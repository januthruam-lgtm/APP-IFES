import { IfesCourse, IfesAssignment, IfesClassSchedule, IfesAccountInfo } from "../types";

export interface AvaLoginParams {
  username: string;
  password?: string;
  campusUrl?: string;
  campusName?: string;
  token?: string;
}

export interface AvaSyncResult {
  success: boolean;
  account?: IfesAccountInfo;
  courses?: IfesCourse[];
  assignments?: IfesAssignment[];
  schedules?: IfesClassSchedule[];
  error?: string;
  message?: string;
}

class AvaApiClient {
  async connect(params: AvaLoginParams): Promise<AvaSyncResult> {
    try {
      const res = await fetch("/api/ava/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ava connect error:", e);
    }
    return {
      success: false,
      message: "Falha ao conectar com o AVA IFES Moodle.",
    };
  }

  async sync(params?: any): Promise<AvaSyncResult> {
    try {
      const res = await fetch("/api/ava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params || {}),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("ava sync error:", e);
    }
    return {
      success: false,
      message: "Falha na sincronização periódica.",
    };
  }

  async getCourseContents(courseId: string, campusName?: string, token?: string): Promise<any> {
    try {
      const res = await fetch(
        `/api/ava/course-contents?courseId=${encodeURIComponent(courseId)}&campusName=${encodeURIComponent(
          campusName || ""
        )}&token=${encodeURIComponent(token || "")}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("getCourseContents error:", e);
    }
    return { sections: [] };
  }

  async getGrades(campusName?: string, token?: string, userId?: string): Promise<any> {
    try {
      const res = await fetch(
        `/api/ava/grades?campusName=${encodeURIComponent(campusName || "")}&token=${encodeURIComponent(
          token || ""
        )}&userId=${encodeURIComponent(userId || "")}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("getGrades error:", e);
    }
    return { grades: [] };
  }

  async getMessages(campusName?: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/ava/messages?campusName=${encodeURIComponent(campusName || "")}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("getMessages error:", e);
    }
    return [
      {
        id: "msg-1",
        subject: "Bem-vindo ao Ambiente Virtual do IFES",
        author: "Coordenação Acadêmica",
        date: "Hoje às 09:00",
        message: "Lembramos a todos os estudantes de conferir o calendário acadêmico e as entregas pendentes.",
      },
    ];
  }

  async submitAssignment(assignmentId: string, textOrFile: any): Promise<boolean> {
    try {
      const res = await fetch("/api/ava/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, submission: textOrFile }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

export const avaApiClient = new AvaApiClient();
