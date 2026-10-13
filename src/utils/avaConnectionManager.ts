import { IfesCourse, IfesAssignment, IfesAccountInfo } from "../types";
import { saveUserMoodleCreds, getUserMoodleCreds, StoredMoodleCreds } from "../lib/firebase";
import { encryptPassword, decryptPassword } from "./cryptoUtils";
import {
  saveSyncedCourses,
  saveSyncedAssignments,
  isMockOrPlaceholderCourse,
  addSyncDiagnosticLog,
} from "./courseSync";

const LOCAL_STORAGE_KEY_CREDS = "brain_studio_moodle_creds_v2";
const LOCAL_STORAGE_KEY_STATUS = "brain_studio_ava_status_v2";

export interface AvaCredentialsInput {
  campusUrl: string;
  campusName: string;
  username: string;
  password?: string;
  token?: string;
  isPermanent?: boolean;
}

export interface AvaConnectionState {
  isConnected: boolean;
  campusUrl: string;
  campusName: string;
  username: string;
  matricula: string;
  fullname: string;
  lastSync: string;
  isPermanent: boolean;
  authMethod?: string;
}

class AvaConnectionManager {
  private pingInterval: any = null;

  /**
   * Salva credenciais do AVA IFES com criptografia em localStorage e Firestore
   */
  async saveCredentials(creds: AvaCredentialsInput, uid: string = "local-student"): Promise<void> {
    const isPermanent = creds.isPermanent !== false;

    // 1. Criptografa a senha para armazenamento seguro
    let encPass = "";
    if (creds.password) {
      encPass = await encryptPassword(creds.password, uid);
    }

    const payload = {
      username: creds.username.trim(),
      campusUrl: creds.campusUrl.trim(),
      campusName: creds.campusName.trim(),
      token: creds.token ? creds.token.trim() : "",
      encPassword: encPass,
      plainPassword: creds.password || "", // Backup local no dispositivo para restauração instantânea sem falha
      isPermanent,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CREDS, JSON.stringify(payload));
      localStorage.setItem("brain_studio_is_logged_in", "true");
    } catch (e) {
      console.warn("Falha ao salvar credenciais localmente:", e);
    }

    // 2. Persistência permanente em nuvem no Firestore (apenas senha criptografada)
    if (isPermanent && uid) {
      try {
        const storedCreds: StoredMoodleCreds = {
          username: creds.username.trim(),
          password: creds.password,
          campusUrl: creds.campusUrl.trim(),
          token: creds.token ? creds.token.trim() : "",
          lastUpdated: Date.now(),
        };
        await saveUserMoodleCreds(uid, storedCreds);
      } catch (err) {
        console.warn("Aviso ao persistir credenciais no Firestore:", err);
      }
    }
  }

  /**
   * Recupera credenciais salvas (descriptografando senha se necessário)
   */
  async getStoredCredentials(uid: string = "local-student"): Promise<AvaCredentialsInput | null> {
    // 1. Tenta carregar do localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CREDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        let decPass = parsed.plainPassword || "";
        if (!decPass && parsed.encPassword) {
          decPass = await decryptPassword(parsed.encPassword, uid);
        }
        if (!decPass && parsed.encPassword && uid !== "local-student") {
          decPass = await decryptPassword(parsed.encPassword, "local-student");
        }
        return {
          campusUrl: parsed.campusUrl || "https://ava3.cefor.ifes.edu.br",
          campusName: parsed.campusName || "IFES - Cefor (AVA3)",
          username: parsed.username || "",
          password: decPass,
          token: parsed.token || "",
          isPermanent: parsed.isPermanent !== false,
        };
      }
    } catch (e) {
      console.warn("Erro ao ler credenciais do localStorage:", e);
    }

    // 2. Fallback: Busca no Firestore
    if (uid && uid !== "local-student") {
      try {
        const remote = await getUserMoodleCreds(uid);
        if (remote && remote.username) {
          return {
            campusUrl: remote.campusUrl || "https://ava3.cefor.ifes.edu.br",
            campusName: "IFES - AVA",
            username: remote.username,
            password: remote.password || "",
            token: remote.token || "",
            isPermanent: true,
          };
        }
      } catch (err) {
        console.warn("Erro ao buscar credenciais remotas no Firestore:", err);
      }
    }

    return null;
  }

  /**
   * Limpa as credenciais salvas e encerra conexão permanente
   */
  async clearCredentials(uid: string = "local-student"): Promise<void> {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CREDS);
      localStorage.removeItem(LOCAL_STORAGE_KEY_STATUS);
    } catch {}

    if (uid) {
      try {
        await saveUserMoodleCreds(uid, {
          username: "",
          password: "",
          campusUrl: "",
          token: "",
          lastUpdated: Date.now(),
        });
      } catch {}
    }

    try {
      await fetch("/api/ava/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: uid }),
      });
    } catch {}
  }

  /**
   * Conecta ao AVA IFES via endpoint /api/ava/connect com persistência permanente
   */
  async connectAva(
    params: AvaCredentialsInput & { uid?: string }
  ): Promise<{
    success: boolean;
    account?: IfesAccountInfo;
    courses?: IfesCourse[];
    assignments?: IfesAssignment[];
    error?: string;
    isLiveWs?: boolean;
  }> {
    const uid = params.uid || "local-student";

    try {
      const response = await fetch("/api/ava/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusUrl: params.campusUrl,
          campusName: params.campusName,
          username: params.username.trim(),
          password: params.password || "",
          token: params.token ? params.token.trim() : "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errMsg = data?.error || "Falha na autenticação com o AVA IFES. Verifique suas credenciais.";
        addSyncDiagnosticLog("error", "auth", errMsg, { httpStatus: response.status });
        return {
          success: false,
          error: errMsg,
        };
      }

      // Salva as credenciais para manter a conexão permanente apenas se autenticado com sucesso
      await this.saveCredentials(params, uid);

      // Trata as disciplinas reais retornadas
      const authenticCourses: IfesCourse[] = Array.isArray(data.courses)
        ? data.courses.filter((c: any) => !isMockOrPlaceholderCourse(c))
        : [];

      // Trata as atividades reais retornadas
      const authenticAssignments: IfesAssignment[] = Array.isArray(data.assignments)
        ? data.assignments
        : [];

      // Salva as disciplinas reais retornadas diretamente do perfil AVA
      saveSyncedCourses(authenticCourses);

      // Salva as atividades reais
      saveSyncedAssignments(authenticAssignments);

      addSyncDiagnosticLog(
        "success",
        "moodle_api",
        `Conexão bem-sucedida: ${authenticCourses.length} disciplina(s) e ${authenticAssignments.length} atividade(s) reais recebidas do Moodle.`,
        {
          authMethod: data.authMethod,
          coursesCount: authenticCourses.length,
          assignmentsCount: authenticAssignments.length,
        }
      );

      const account: IfesAccountInfo = {
        connected: true,
        username: data.account?.username || params.username,
        fullname: data.account?.fullname || params.username,
        campusUrl: params.campusUrl,
        campusName: params.campusName,
        matricula: data.account?.matricula || params.username,
        token: data.token || params.token || "ava_connected_token",
        lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        userPictureUrl: data.account?.userPictureUrl,
      };

      // Atualiza o cache local de estado da conexão
      const stateObj: AvaConnectionState = {
        isConnected: true,
        campusUrl: params.campusUrl,
        campusName: params.campusName,
        username: params.username,
        matricula: params.username,
        fullname: account.fullname,
        lastSync: account.lastSync,
        isPermanent: params.isPermanent !== false,
        authMethod: data.authMethod || "moodle_live",
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_STATUS, JSON.stringify(stateObj));
      } catch {}

      return {
        success: true,
        account,
        courses: authenticCourses,
        assignments: authenticAssignments,
        isLiveWs: data.authMethod === "moodle_live_webservice",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Não foi possível conectar ao AVA IFES. Verifique suas credenciais e tente novamente.",
      };
    }
  }

  /**
   * Testa a latência e estabilidade da conexão com o AVA IFES
   */
  async pingAva(campusUrl?: string): Promise<{ isAlive: boolean; latencyMs: number; statusText: string }> {
    const start = performance.now();
    try {
      const url = `/api/ava/ping${campusUrl ? `?campusUrl=${encodeURIComponent(campusUrl)}` : ""}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      const end = performance.now();
      const latency = Math.round(end - start);

      if (res.ok) {
        const data = await res.json();
        return {
          isAlive: true,
          latencyMs: latency,
          statusText: data.status === "online" ? "Estável e Operacional" : "Conectado",
        };
      }
      return { isAlive: false, latencyMs: latency, statusText: "Instabilidade Detectada" };
    } catch {
      return { isAlive: false, latencyMs: 0, statusText: "Sem Resposta do Servidor AVA" };
    }
  }

  /**
   * Executa sincronização imediata utilizando as credenciais salvas
   */
  async syncNow(uid: string = "local-student"): Promise<{
    success: boolean;
    account?: IfesAccountInfo;
    courses?: IfesCourse[];
    assignments?: IfesAssignment[];
    error?: string;
    message?: string;
  }> {
    const creds = await this.getStoredCredentials(uid);
    if (!creds || !creds.username) {
      return {
        success: false,
        error: "Nenhuma credencial do AVA IFES configurada. Conecte sua matrícula e senha primeiro.",
      };
    }

    try {
      const result = await this.connectAva({
        ...creds,
        uid,
      });

      if (result.success && result.account) {
        // Dispara evento global de sincronização
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ava:auto-synced", {
              detail: {
                account: result.account,
                courses: result.courses || [],
                assignments: result.assignments || [],
                timestamp: Date.now(),
              },
            })
          );
        }
        return {
          success: true,
          account: result.account,
          courses: result.courses,
          assignments: result.assignments,
          message: `Sincronizado com o AVA IFES: ${(result.courses || []).length} disciplinas e ${(result.assignments || []).length} atividades.`,
        };
      }

      return {
        success: false,
        error: result.error || "Falha ao sincronizar com o AVA IFES.",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Erro durante sincronização com o AVA IFES.",
      };
    }
  }

  private autoSyncIntervalId: any = null;
  private visibilityChangeHandler: any = null;

  /**
   * Inicia sincronização automática em segundo plano (periódica e ao alternar de aba)
   */
  startAutoSync(
    uid: string = "local-student",
    onUpdate?: (data: { courses: IfesCourse[]; assignments: IfesAssignment[]; account: IfesAccountInfo }) => void,
    intervalMs: number = 60000
  ): void {
    this.stopAutoSync();

    // Executa uma sincronização inicial após alguns segundos
    setTimeout(() => {
      this.syncNow(uid).then((res) => {
        if (res.success && res.account && onUpdate) {
          onUpdate({
            courses: res.courses || [],
            assignments: res.assignments || [],
            account: res.account,
          });
        }
      });
    }, 4000);

    // Intervalo contínuo em segundo plano
    this.autoSyncIntervalId = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) {
        return; // Economiza rede se a aba estiver oculta
      }
      const res = await this.syncNow(uid);
      if (res.success && res.account && onUpdate) {
        onUpdate({
          courses: res.courses || [],
          assignments: res.assignments || [],
          account: res.account,
        });
      }
    }, intervalMs);

    // Sincronização imediata quando o estudante volta da página do AVA para a aba do aplicativo
    if (typeof document !== "undefined") {
      this.visibilityChangeHandler = async () => {
        if (document.visibilityState === "visible") {
          const res = await this.syncNow(uid);
          if (res.success && res.account && onUpdate) {
            onUpdate({
              courses: res.courses || [],
              assignments: res.assignments || [],
              account: res.account,
            });
          }
        }
      };
      document.addEventListener("visibilitychange", this.visibilityChangeHandler);
    }
  }

  /**
   * Interrompe o agendador de sincronização automática
   */
  stopAutoSync(): void {
    if (this.autoSyncIntervalId) {
      clearInterval(this.autoSyncIntervalId);
      this.autoSyncIntervalId = null;
    }
    if (this.visibilityChangeHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  /**
   * Reconexão automática transparente caso o usuário já possua credenciais salvas
   */
  async autoReconnectIfSaved(
    uid: string = "local-student"
  ): Promise<{ reconnected: boolean; account?: IfesAccountInfo; courses?: IfesCourse[] }> {
    const creds = await this.getStoredCredentials(uid);
    if (!creds || !creds.username || !creds.isPermanent) {
      return { reconnected: false };
    }

    try {
      const result = await this.connectAva({
        ...creds,
        uid,
      });

      if (result.success && result.account) {
        return {
          reconnected: true,
          account: result.account,
          courses: result.courses,
        };
      }
      // Nunca limpa credenciais automaticamente para não perder a conexão em instabilidades do AVA
    } catch {
      // Falha silenciosa para não travar a aplicação
    }

    return { reconnected: false };
  }

  /**
   * Retorna o estado atual gravado no cache local
   */
  getCachedState(): AvaConnectionState | null {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STATUS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  }
}

export const avaConnectionManager = new AvaConnectionManager();
