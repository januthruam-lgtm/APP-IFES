import {
  QAcademicoAccountInfo,
  QAcademicoGradeItem,
  QAcademicoScheduleItem,
  IfesCourse,
} from "../types";

export interface QAcademicoConnectParams {
  matricula: string;
  senha?: string;
  ano?: string;
  periodo?: string;
  campus?: string;
  userCourses?: IfesCourse[];
}

export interface QAcademicoApiResponse {
  success: boolean;
  authenticated?: boolean;
  requiresManualSync?: boolean;
  account?: QAcademicoAccountInfo;
  grades?: QAcademicoGradeItem[];
  schedules?: QAcademicoScheduleItem[];
  courses?: IfesCourse[];
  message?: string;
  error?: string;
  debugLogs?: string[];
}

class QAcademicoApiClient {
  private portalUrl = "https://academico.ifes.edu.br/qacademico/index.asp?t=2000";

  getPortalUrl(): string {
    return this.portalUrl;
  }

  /**
   * Verifica o status da conexão com o servidor do Q-Acadêmico IFES com logging detalhado
   */
  async checkStatus(): Promise<{ online: boolean; message: string; latencyMs: number; statusText?: string }> {
    const start = performance.now();
    console.group("[Q-Acadêmico] Verificando conectividade institucional");
    console.log("Destino oficial:", this.portalUrl);
    console.log("Timestamp:", new Date().toISOString());

    try {
      const res = await fetch("/api/qacademico/status");
      const latencyMs = Math.round(performance.now() - start);

      if (!res.ok) {
        console.warn(`[Q-Acadêmico] Resposta HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`[Q-Acadêmico] Status da API: ${data.online ? "ONLINE" : "OFFLINE"} (${latencyMs}ms)`, data);
      console.groupEnd();

      return {
        online: data.online ?? true,
        message: data.message || "Servidor do Q-Acadêmico respondendo.",
        latencyMs,
        statusText: `HTTP ${res.status} (${latencyMs}ms)`,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      console.error("[Q-Acadêmico] Erro de rede ao verificar status:", err);
      console.groupEnd();

      return {
        online: false,
        message: "Não foi possível testar o servidor do Q-Acadêmico (Falha de rede).",
        latencyMs,
        statusText: "Erro de conexão",
      };
    }
  }

  /**
   * Tenta conectar e autenticar com o Q-Acadêmico IFES
   */
  async connect(params: QAcademicoConnectParams): Promise<QAcademicoApiResponse> {
    console.group(`[Q-Acadêmico] Tentativa de conexão direta (Matrícula: ${params.matricula})`);
    console.log("Parâmetros:", { campus: params.campus, ano: params.ano, matricula: params.matricula });

    try {
      const res = await fetch("/api/qacademico/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data: QAcademicoApiResponse = await res.json();
      if (!res.ok || !data.success) {
        console.warn("[Q-Acadêmico] Resposta do servidor indicou ação necessária:", data.message || data.error);
      } else {
        console.log("[Q-Acadêmico] Conexão bem-sucedida!", data);
      }
      console.groupEnd();
      return data;
    } catch (err: any) {
      console.error("[Q-Acadêmico] Erro inesperado na chamada /api/qacademico/connect:", err);
      console.groupEnd();
      return {
        success: false,
        requiresManualSync: true,
        message: err?.message || "Falha na conexão com a ponte do Q-Acadêmico.",
        error: String(err),
      };
    }
  }

  /**
   * Envia o texto ou código HTML copiado da tela do Q-Acadêmico para processamento no servidor ou parser
   */
  async parseReport(rawContent: string, defaultCampus: string = "IFES"): Promise<QAcademicoApiResponse> {
    console.group("[Q-Acadêmico] Processando boletim/relatório acadêmico copiado");
    console.log(`Tamanho do conteúdo bruto: ${rawContent.length} caracteres`);
    console.log("Campus padrão:", defaultCampus);

    try {
      const res = await fetch("/api/qacademico/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, defaultCampus }),
      });

      const data: QAcademicoApiResponse = await res.json();
      if (!res.ok || !data.success) {
        console.warn("[Q-Acadêmico] Processamento do relatório retornou aviso:", data.error || data.message);
      } else {
        console.log(
          `[Q-Acadêmico] Relatório analisado com sucesso! Disciplinas encontradas: ${data.grades?.length || 0}`,
          data
        );
      }
      console.groupEnd();
      return data;
    } catch (err: any) {
      console.error("[Q-Acadêmico] Erro na requisição /api/qacademico/parse-report:", err);
      console.groupEnd();
      return {
        success: false,
        message: err?.message || "Erro ao processar relatório do Q-Acadêmico.",
        error: String(err),
      };
    }
  }

  /**
   * Sincroniza dados da sessão ativa
   */
  async sync(matricula: string): Promise<QAcademicoApiResponse> {
    console.group(`[Q-Acadêmico] Sincronizando sessão para matrícula: ${matricula}`);
    try {
      const res = await fetch("/api/qacademico/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula }),
      });

      const data: QAcademicoApiResponse = await res.json();
      console.log("[Q-Acadêmico] Resultado do sync:", data);
      console.groupEnd();
      return data;
    } catch (err: any) {
      console.error("[Q-Acadêmico] Erro ao sincronizar sessão:", err);
      console.groupEnd();
      return {
        success: false,
        message: err?.message || "Erro ao sincronizar com Q-Acadêmico.",
        error: String(err),
      };
    }
  }
}

export const qacademicoApi = new QAcademicoApiClient();
