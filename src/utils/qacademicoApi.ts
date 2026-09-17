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
}

class QAcademicoApiClient {
  private portalUrl = "https://academico.ifes.edu.br/qacademico/index.asp?t=2000";

  getPortalUrl(): string {
    return this.portalUrl;
  }

  /**
   * Verifica o status da conexão com o servidor do Q-Acadêmico IFES
   */
  async checkStatus(): Promise<{ online: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    try {
      const res = await fetch("/api/qacademico/status");
      const data = await res.json();
      return {
        online: data.online ?? true,
        message: data.message || "Servidor do Q-Acadêmico respondendo.",
        latencyMs: Math.round(performance.now() - start),
      };
    } catch {
      return {
        online: false,
        message: "Não foi possível testar o servidor do Q-Acadêmico.",
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  /**
   * Tenta conectar e autenticar com o Q-Acadêmico IFES
   */
  async connect(params: QAcademicoConnectParams): Promise<QAcademicoApiResponse> {
    try {
      const res = await fetch("/api/qacademico/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        requiresManualSync: true,
        message: err?.message || "Falha na conexão com a ponte do Q-Acadêmico.",
      };
    }
  }

  /**
   * Envia o texto ou código HTML copiado da tela do Q-Acadêmico para processamento no servidor ou parser
   */
  async parseReport(rawContent: string, defaultCampus: string = "IFES"): Promise<QAcademicoApiResponse> {
    try {
      const res = await fetch("/api/qacademico/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, defaultCampus }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Erro ao processar relatório do Q-Acadêmico.",
      };
    }
  }

  /**
   * Sincroniza dados da sessão ativa
   */
  async sync(matricula: string): Promise<QAcademicoApiResponse> {
    try {
      const res = await fetch("/api/qacademico/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Erro ao sincronizar com Q-Acadêmico.",
      };
    }
  }
}

export const qacademicoApi = new QAcademicoApiClient();
