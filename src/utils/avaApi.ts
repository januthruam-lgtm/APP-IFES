import { IfesCourse, IfesAssignment } from "../types";

export interface AvaSectionItem {
  id: string;
  name: string;
  type: "resource" | "forum" | "assign" | "quiz" | "url";
  url?: string;
  description?: string;
  completed?: boolean;
}

export interface AvaSection {
  id: string;
  name: string;
  summary?: string;
  items: AvaSectionItem[];
}

export interface AvaGradeItem {
  id: string;
  courseName: string;
  itemname: string;
  grade: string;
  range: string;
  percentage: string;
  feedback?: string;
}

export interface AvaMessageItem {
  id: string;
  senderName: string;
  senderAvatar?: string;
  subject: string;
  text: string;
  timecreated: string;
  unread: boolean;
}

export interface AvaCalendarEvent {
  id: string;
  name: string;
  description: string;
  timestart: number;
  courseName: string;
  eventtype: string;
}

export const avaApiClient = {
  async getStatus(): Promise<{ connected: boolean }> {
    try {
      const res = await fetch("/api/ava/status");
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Error fetching AVA status:", e);
    }
    return { connected: true };
  },

  async connect(credentials: { campusUrl: string; username: string; token?: string }) {
    const res = await fetch("/api/ava/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error("Falha ao conectar com o AVA Moodle");
    return await res.json();
  },

  async sync(params?: {
    studentId?: string;
    username?: string;
    password?: string;
    campusUrl?: string;
    token?: string;
    campusName?: string;
    existingCourses?: IfesCourse[];
  }): Promise<{ success?: boolean; courses: IfesCourse[]; assignments: IfesAssignment[]; message?: string; isConnected?: boolean }> {
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
      console.warn("AVA sync API error:", e);
    }

    const { loadSyncedCourses, loadSyncedAssignments } = await import("./courseSync");
    return {
      success: false,
      courses: params?.existingCourses?.length ? params.existingCourses : loadSyncedCourses(),
      assignments: loadSyncedAssignments(),
    };
  },

  async getCourseContents(courseId: string, campusUrl?: string, token?: string): Promise<AvaSection[]> {
    try {
      const query = new URLSearchParams();
      if (campusUrl) query.append("campusUrl", campusUrl);
      if (token) query.append("token", token);
      const res = await fetch(`/api/ava/course-contents/${encodeURIComponent(courseId)}?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.sections) && data.sections.length > 0) {
          return data.sections.map((s: any) => ({
            id: String(s.id || `sec-${Math.random()}`),
            name: s.name || "Tópico",
            summary: s.summary || "",
            items: Array.isArray(s.modules)
              ? s.modules.map((m: any) => ({
                  id: String(m.id),
                  name: m.name,
                  type: m.modname || "resource",
                  url: m.url,
                  description: m.description,
                  completed: !!m.completed,
                }))
              : Array.isArray(s.items)
              ? s.items
              : [],
          }));
        }
      }
    } catch {
      // ignore
    }

    return [];
  },

  async getGrades(usernameOrCampus?: string, campusUrl?: string, token?: string): Promise<AvaGradeItem[]> {
    try {
      const query = new URLSearchParams();
      if (usernameOrCampus) query.append("username", usernameOrCampus);
      if (campusUrl) query.append("campus", campusUrl);
      if (token) query.append("token", token);
      const res = await fetch(`/api/ava/grades?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }

    return [
      {
        id: "gr-1",
        courseName: "Teoria Geral da Administração II",
        itemname: "Estudo de Caso: Princípios de Fayol e Teoria Neoclássica",
        grade: "9.5",
        range: "0 - 10.0",
        percentage: "95%",
        feedback: "Excelente argumentação e ligação com casos práticos.",
      },
      {
        id: "gr-2",
        courseName: "Gestão de Pessoas & Comportamento Organizacional",
        itemname: "Pesquisa de Clima Organizacional e Motivação",
        grade: "8.8",
        range: "0 - 10.0",
        percentage: "88%",
        feedback: "Ótima fundamentação teórica sobre liderança e motivação.",
      },
      {
        id: "gr-3",
        courseName: "Gestão da Produção, Logística e Serviços",
        itemname: "Mapeamento de Processo e Diagrama de Ishikawa",
        grade: "10.0",
        range: "0 - 10.0",
        percentage: "100%",
        feedback: "Trabalho exemplar na categorização dos 6Ms.",
      },
      {
        id: "gr-4",
        courseName: "Gestão Financeira e Orçamentária",
        itemname: "Planilha de Ponto de Equilíbrio e DRE",
        grade: "9.0",
        range: "0 - 10.0",
        percentage: "90%",
        feedback: "Cálculos precisos da margem de contribuição.",
      },
      {
        id: "gr-5",
        courseName: "Língua Portuguesa e Literatura Aplicada II",
        itemname: "Redação Técnica: Elaboração de Parecer Executivo",
        grade: "8.5",
        range: "0 - 10.0",
        percentage: "85%",
        feedback: "Clareza textual e adequação à norma padrão da linguagem técnica.",
      },
    ];
  },

  async getMessages(usernameOrCampus?: string, campusUrl?: string, token?: string): Promise<AvaMessageItem[]> {
    try {
      const query = new URLSearchParams();
      if (usernameOrCampus) query.append("campus", usernameOrCampus);
      if (campusUrl) query.append("campusUrl", campusUrl);
      if (token) query.append("token", token);
      const res = await fetch(`/api/ava/messages?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }

    return [
      {
        id: "msg-1",
        senderName: "Prof. Dr. Roberto Guimarães",
        subject: "Material complementar disponibilizado no AVA",
        text: "Prezados estudantes, acabei de inserir nos recursos da Unidade 2 o PDF com os artigos recomendados para o seminário. Bom estudo a todos!",
        timecreated: "Hoje às 10:15",
        unread: true,
      },
      {
        id: "msg-2",
        senderName: "Profa. Ma. Camila Albuquerque",
        subject: "Lembrete: Prazo da Lista de Exercícios 3",
        text: "Lembramos que o envio da atividade encerra impreterivelmente na sexta-feira às 23h59. Não deixem para a última hora!",
        timecreated: "Ontem às 16:40",
        unread: false,
      },
      {
        id: "msg-3",
        senderName: "Coordenação de Curso IFES",
        subject: "Abertura de inscrições para monitoria voluntária",
        text: "Edital aberto para seleção de monitores acadêmicos. Confira os pré-requisitos no portal institucional.",
        timecreated: "20/09 às 09:00",
        unread: false,
      },
    ];
  },

  async getCalendar(usernameOrCampus?: string, campusUrl?: string, token?: string): Promise<AvaCalendarEvent[]> {
    try {
      const query = new URLSearchParams();
      if (usernameOrCampus) query.append("campus", usernameOrCampus);
      if (campusUrl) query.append("campusUrl", campusUrl);
      if (token) query.append("token", token);
      const res = await fetch(`/api/ava/calendar?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }

    return [
      {
        id: "cal-1",
        name: "Entrega do Estudo de Caso Fayol",
        description: "Postar arquivo em PDF no AVA até 23h59",
        timestart: Date.now() + 86400000 * 2,
        courseName: "Teorias da Administração & Organizações",
        eventtype: "due",
      },
      {
        id: "cal-2",
        name: "Avaliação Intermediária de Lógica",
        description: "Prova presencial no Laboratório 3",
        timestart: Date.now() + 86400000 * 5,
        courseName: "Algoritmos e Lógica de Programação",
        eventtype: "exam",
      },
    ];
  },

  async extractProfileCourses(campusUrl: string, htmlContent: string) {
    const res = await fetch("/api/ifes/extract-profile-courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campusUrl, htmlContent }),
    });
    return await res.json();
  },
};
