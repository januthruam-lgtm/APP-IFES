/**
 * Brain Studio - Serviço Completo de Agenda e Calendário Anual (Bloco 5)
 * Suporte a 12 meses navegáveis, 4 visões (Mês, Semana, Dia, Lista),
 * recorrência (diária, semanal, quinzenal, mensal), integração bidirecional
 * com Tarefas e AVA, feriados nacionais/locais e exportação/importação .ics (RFC 5545).
 */

import { AgendaEvent, EventType, EventRecurrence, TaskItem, IfesAssignment } from "../types";
import { loadSyncedAssignments, saveSyncedAssignments } from "../utils/courseSync";

export const STORAGE_KEY_AGENDA = "brain_studio_agenda_events_v2";
export const STORAGE_KEY_CUSTOM_HOLIDAYS = "brain_studio_custom_holidays_v2";
export const STORAGE_KEY_TASKS = "brain_studio_tasks_v2";

export interface FeriadoInfo {
  data: string; // YYYY-MM-DD
  nome: string;
  tipo: "nacional" | "local" | "academico";
  fixo: boolean;
}

/**
 * Calcula a data da Páscoa pelo Algoritmo de Meeus/Jones/Butcher
 */
function calcularPascoa(ano: number): { mes: number; dia: number } {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { mes, dia }; // mes 1-12
}

/**
 * Retorna os feriados nacionais oficiais do Brasil para determinado ano
 */
export function obterFeriadosNacionais(ano: number): FeriadoInfo[] {
  const pad = (n: number) => String(n).padStart(2, "0");

  // Feriados Nacionais com datas fixas
  const fixos: FeriadoInfo[] = [
    { data: `${ano}-01-01`, nome: "Confraternização Universal (Ano Novo)", tipo: "nacional", fixo: true },
    { data: `${ano}-04-21`, nome: "Tiradentes", tipo: "nacional", fixo: true },
    { data: `${ano}-05-01`, nome: "Dia Mundial do Trabalho", tipo: "nacional", fixo: true },
    { data: `${ano}-09-07`, nome: "Independência do Brasil", tipo: "nacional", fixo: true },
    { data: `${ano}-10-12`, nome: "Nossa Senhora Aparecida (Padroeira do Brasil)", tipo: "nacional", fixo: true },
    { data: `${ano}-11-02`, nome: "Finados", tipo: "nacional", fixo: true },
    { data: `${ano}-11-15`, nome: "Proclamação da República", tipo: "nacional", fixo: true },
    { data: `${ano}-11-20`, nome: "Dia Nacional de Zumbi e da Consciência Negra", tipo: "nacional", fixo: true },
    { data: `${ano}-12-25`, nome: "Natal", tipo: "nacional", fixo: true },
  ];

  // Feriados móveis calculados a partir da Páscoa
  const { mes, dia } = calcularPascoa(ano);
  const dataPascoa = new Date(Date.UTC(ano, mes - 1, dia));

  const addDias = (dias: number): string => {
    const d = new Date(dataPascoa.getTime() + dias * 86400000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  };

  const moveis: FeriadoInfo[] = [
    { data: addDias(-47), nome: "Carnaval (Terça-feira)", tipo: "nacional", fixo: false },
    { data: addDias(-2), nome: "Sexta-feira Santa (Paixão de Cristo)", tipo: "nacional", fixo: false },
    { data: addDias(0), nome: "Páscoa", tipo: "nacional", fixo: false },
    { data: addDias(60), nome: "Corpus Christi", tipo: "nacional", fixo: false },
  ];

  return [...fixos, ...moveis].sort((a, b) => a.data.localeCompare(b.data));
}

/**
 * Lê feriados customizados locais/acadêmicos do usuário
 */
export function carregarFeriadosCustomizados(): FeriadoInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_HOLIDAYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Salva feriado customizado do estudante
 */
export function salvarFeriadoCustomizado(feriado: FeriadoInfo): void {
  if (typeof window === "undefined") return;
  const list = carregarFeriadosCustomizados();
  const filtered = list.filter((f) => f.data !== feriado.data || f.nome !== feriado.nome);
  filtered.push(feriado);
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_HOLIDAYS, JSON.stringify(filtered));
  } catch {}
}

/**
 * Eventos padrão de demonstração para novos estudantes
 */
export const EVENTOS_PADRAO_AGENDA: AgendaEvent[] = [
  {
    id: "ev-demo-1",
    title: "Aula Inaugural e Alinhamento da Trilha",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:30",
    type: "aula",
    courseName: "Administração Geral",
    locationOrLink: "Sala 101 - IFES",
    recurrence: "weekly",
  },
  {
    id: "ev-demo-2",
    title: "Avaliação Parcial: Diagnóstico e Métodos",
    date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "16:00",
    type: "prova",
    courseName: "Gestão da Qualidade",
    locationOrLink: "Auditório Central",
    recurrence: "none",
  },
  {
    id: "ev-demo-3",
    title: "Revisão Espaçada Ativa com Flashcards",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    startTime: "19:00",
    endTime: "20:00",
    type: "revisao",
    courseName: "Estudo Pessoal",
    recurrence: "daily",
  },
];

/**
 * Carrega todos os eventos base salvos pelo usuário
 */
export function carregarEventosAgenda(): AgendaEvent[] {
  if (typeof window === "undefined") return EVENTOS_PADRAO_AGENDA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AGENDA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return EVENTOS_PADRAO_AGENDA;
}

/**
 * Salva a lista de eventos base no armazenamento
 */
export function salvarEventosAgenda(eventos: AgendaEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_AGENDA, JSON.stringify(eventos));
    window.dispatchEvent(new CustomEvent("brainstudio:agenda-updated"));
  } catch {}
}

/**
 * Expande eventos recorrentes para datas virtuais até o final do ano ou data limite
 */
export function expandirRecorrencia(evento: AgendaEvent, anoLimite: number): AgendaEvent[] {
  if (!evento.recurrence || evento.recurrence === "none") {
    return [evento];
  }

  const instancias: AgendaEvent[] = [evento];
  const [ano, mes, dia] = evento.date.split("-").map(Number);
  const dataInicio = new Date(Date.UTC(ano, mes - 1, dia));

  let dataFim = new Date(Date.UTC(anoLimite, 11, 31));
  if (evento.recurrenceEndDate) {
    const [fAno, fMes, fDia] = evento.recurrenceEndDate.split("-").map(Number);
    const limiteRec = new Date(Date.UTC(fAno, fMes - 1, fDia));
    if (limiteRec < dataFim) {
      dataFim = limiteRec;
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  let dataAtual = new Date(dataInicio.getTime());
  let count = 1;

  while (count < 60) { // limite de segurança para iterações
    if (evento.recurrence === "daily") {
      dataAtual = new Date(dataAtual.getTime() + 86400000);
    } else if (evento.recurrence === "weekly") {
      dataAtual = new Date(dataAtual.getTime() + 7 * 86400000);
    } else if (evento.recurrence === "biweekly") {
      dataAtual = new Date(dataAtual.getTime() + 14 * 86400000);
    } else if (evento.recurrence === "monthly") {
      dataAtual = new Date(Date.UTC(dataAtual.getUTCFullYear(), dataAtual.getUTCMonth() + 1, dia));
    }

    if (dataAtual > dataFim) break;

    const dataIso = `${dataAtual.getUTCFullYear()}-${pad(dataAtual.getUTCMonth() + 1)}-${pad(dataAtual.getUTCDate())}`;
    instancias.push({
      ...evento,
      id: `${evento.id}_rec_${count}`,
      date: dataIso,
    });
    count++;
  }

  return instancias;
}

/**
 * Lê tarefas ativas do estudante e as converte em eventos de agenda
 */
export function carregarTarefasComoEventos(): AgendaEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) return [];
    const tasks: TaskItem[] = JSON.parse(raw);
    if (!Array.isArray(tasks)) return [];

    return tasks.map((t) => ({
      id: `task_ev_${t.id}`,
      title: `Tarefa: ${t.title}`,
      description: t.description || "Criada no gerenciador de tarefas",
      date: t.dueDate,
      startTime: t.dueTime || "09:00",
      endTime: t.dueTime ? `${parseInt(t.dueTime.split(":")[0]) + 1}:00` : "10:00",
      type: "trabalho" as EventType,
      courseName: t.category || "Geral",
      completed: t.completed,
      taskId: t.id,
      isSynced: false,
    }));
  } catch {
    return [];
  }
}

/**
 * Lê prazos/entregas sincronizados do AVA Moodle e converte em eventos
 */
export function carregarAtividadesAvaComoEventos(): AgendaEvent[] {
  try {
    const assignments: IfesAssignment[] = loadSyncedAssignments();
    return assignments.map((a) => ({
      id: `ava_ev_${a.id}`,
      title: `[AVA] ${a.title}`,
      description: a.description || `Atividade avaliativa ${a.type} vinculada a ${a.courseName}`,
      date: a.dueDate ? a.dueDate.split("T")[0] : new Date().toISOString().split("T")[0],
      startTime: a.dueDate && a.dueDate.includes("T") ? a.dueDate.split("T")[1].substring(0, 5) : "23:59",
      endTime: "23:59",
      type: (a.type === "questionario" ? "prova" : "entrega") as EventType,
      courseId: a.courseId,
      courseName: a.courseName,
      completed: a.status === "submitted" || a.status === "graded",
      assignmentId: a.id,
      isSynced: true,
    }));
  } catch {
    return [];
  }
}

/**
 * Converte feriados em eventos de calendário
 */
export function carregarFeriadosComoEventos(ano: number): AgendaEvent[] {
  const nacionais = obterFeriadosNacionais(ano);
  const customizados = carregarFeriadosCustomizados().filter((f) => f.data.startsWith(String(ano)));
  const todos = [...nacionais, ...customizados];

  return todos.map((f) => ({
    id: `holiday_${f.data}_${f.nome.replace(/\s+/g, "_")}`,
    title: `Feriado: ${f.nome}`,
    date: f.data,
    startTime: "00:00",
    endTime: "23:59",
    type: "feriado" as EventType,
    isHoliday: true,
    holidayType: f.tipo,
  }));
}

/**
 * Retorna todos os eventos unificados para exibição no calendário
 */
export function carregarTodosEventosUnificados(ano: number): AgendaEvent[] {
  const baseEvents = carregarEventosAgenda();
  const tarefasEvents = carregarTarefasComoEventos();
  const avaEvents = carregarAtividadesAvaComoEventos();
  const feriadosEvents = carregarFeriadosComoEventos(ano);

  // Expande recorrências dos eventos base
  const baseExpandidos = baseEvents.flatMap((e) => expandirRecorrencia(e, ano));

  return [...baseExpandidos, ...tarefasEvents, ...avaEvents, ...feriadosEvents];
}

/**
 * Alterna a conclusão de um evento com sincronização bidirecional em Tarefas e AVA
 */
export function alternarConclusaoEvento(
  eventId: string,
  novoStatus: boolean,
  todosEventos: AgendaEvent[]
): void {
  const ev = todosEventos.find((e) => e.id === eventId);
  if (!ev) return;

  // 1. Se for vinculado a uma tarefa do Brain Studio
  if (ev.taskId) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASKS);
      if (raw) {
        const tasks: TaskItem[] = JSON.parse(raw);
        const updated = tasks.map((t) => (t.id === ev.taskId ? { ...t, completed: novoStatus } : t));
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("brainstudio:tasks-updated", { detail: updated }));
      }
    } catch {}
    return;
  }

  // 2. Se for vinculado a uma atividade do AVA
  if (ev.assignmentId) {
    try {
      const assignments = loadSyncedAssignments();
      const updated = assignments.map((a) =>
        a.id === ev.assignmentId ? { ...a, status: novoStatus ? ("submitted" as const) : ("pending" as const) } : a
      );
      saveSyncedAssignments(updated);
      window.dispatchEvent(new CustomEvent("brainstudio:assignments-updated", { detail: updated }));
    } catch {}
    return;
  }

  // 3. Evento base de agenda
  const baseId = eventId.split("_rec_")[0];
  const baseEvents = carregarEventosAgenda();
  const updatedBase = baseEvents.map((e) => (e.id === baseId ? { ...e, completed: novoStatus } : e));
  salvarEventosAgenda(updatedBase);
}

/**
 * Gera texto no formato iCalendar (.ics - RFC 5545)
 */
export function gerarTextoICS(eventos: AgendaEvent[]): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const agoraIso = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Brain Studio//Agenda Academica v2.0//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Brain Studio Agenda",
    "X-WR-TIMEZONE:America/Sao_Paulo",
  ];

  for (const ev of eventos) {
    if (ev.isHoliday) continue; // Não polui com feriados ao exportar

    const dataLimpa = ev.date.replace(/-/g, "");
    const horaInicio = (ev.startTime || "09:00").replace(":", "") + "00";
    const horaFim = (ev.endTime || "10:00").replace(":", "") + "00";

    const dtStart = `${dataLimpa}T${horaInicio}`;
    const dtEnd = `${dataLimpa}T${horaFim}`;

    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${ev.id}@brainstudio.app`);
    ics.push(`DTSTAMP:${agoraIso}`);
    ics.push(`DTSTART:${dtStart}`);
    ics.push(`DTEND:${dtEnd}`);
    ics.push(`SUMMARY:${ev.title.replace(/\n/g, " ")}`);
    if (ev.description) {
      ics.push(`DESCRIPTION:${ev.description.replace(/\n/g, "\\n")}`);
    }
    if (ev.locationOrLink) {
      ics.push(`LOCATION:${ev.locationOrLink.replace(/\n/g, " ")}`);
    }
    if (ev.courseName) {
      ics.push(`CATEGORIES:${ev.courseName.replace(/\n/g, " ")}`);
    }
    if (ev.completed) {
      ics.push("STATUS:COMPLETED");
    } else {
      ics.push("STATUS:CONFIRMED");
    }
    if (ev.recurrence === "daily") ics.push("RRULE:FREQ=DAILY");
    if (ev.recurrence === "weekly") ics.push("RRULE:FREQ=WEEKLY");
    if (ev.recurrence === "biweekly") ics.push("RRULE:FREQ=WEEKLY;INTERVAL=2");
    if (ev.recurrence === "monthly") ics.push("RRULE:FREQ=MONTHLY");

    ics.push("END:VEVENT");
  }

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Dispara o download do arquivo .ics no navegador
 */
export function exportarAgendaParaArquivoICS(eventos: AgendaEvent[]): void {
  if (typeof window === "undefined") return;
  const conteudo = gerarTextoICS(eventos);
  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `brain-studio-agenda-${new Date().toISOString().split("T")[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parser de arquivos iCalendar (.ics - RFC 5545)
 */
export function importarAgendaDeTextoICS(icsConteudo: string): AgendaEvent[] {
  const eventosImportados: AgendaEvent[] = [];
  const linhas = icsConteudo.replace(/\r\n /g, "").split(/\r\n|\n|\r/);

  let noEvento = false;
  let eventoAtual: Partial<AgendaEvent> = {};

  for (let linha of linhas) {
    linha = linha.trim();
    if (linha === "BEGIN:VEVENT") {
      noEvento = true;
      eventoAtual = {
        id: `import_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: "pessoal",
        recurrence: "none",
        completed: false,
      };
      continue;
    }

    if (linha === "END:VEVENT" && noEvento) {
      noEvento = false;
      if (eventoAtual.title && eventoAtual.date) {
        eventosImportados.push({
          id: eventoAtual.id || `imp_${Date.now()}`,
          title: eventoAtual.title,
          description: eventoAtual.description || "",
          date: eventoAtual.date,
          startTime: eventoAtual.startTime || "09:00",
          endTime: eventoAtual.endTime || "10:00",
          type: eventoAtual.type || "pessoal",
          locationOrLink: eventoAtual.locationOrLink,
          courseName: eventoAtual.courseName,
          recurrence: eventoAtual.recurrence || "none",
          completed: eventoAtual.completed || false,
        });
      }
      eventoAtual = {};
      continue;
    }

    if (!noEvento) continue;

    if (linha.startsWith("SUMMARY:")) {
      eventoAtual.title = linha.substring(8).replace(/\\,/g, ",").replace(/\\n/g, " ");
    } else if (linha.startsWith("DESCRIPTION:")) {
      eventoAtual.description = linha.substring(12).replace(/\\,/g, ",").replace(/\\n/g, "\n");
    } else if (linha.startsWith("LOCATION:")) {
      eventoAtual.locationOrLink = linha.substring(9).replace(/\\,/g, ",");
    } else if (linha.startsWith("CATEGORIES:")) {
      eventoAtual.courseName = linha.substring(11).split(",")[0];
    } else if (linha.startsWith("DTSTART:") || linha.startsWith("DTSTART;")) {
      const valor = linha.split(":")[1];
      if (valor && valor.length >= 8) {
        const ano = valor.substring(0, 4);
        const mes = valor.substring(4, 6);
        const dia = valor.substring(6, 8);
        eventoAtual.date = `${ano}-${mes}-${dia}`;
        if (valor.includes("T") && valor.length >= 13) {
          const tIdx = valor.indexOf("T");
          const hora = valor.substring(tIdx + 1, tIdx + 3);
          const min = valor.substring(tIdx + 3, tIdx + 5);
          eventoAtual.startTime = `${hora}:${min}`;
        } else {
          eventoAtual.startTime = "08:00";
        }
      }
    } else if (linha.startsWith("DTEND:") || linha.startsWith("DTEND;")) {
      const valor = linha.split(":")[1];
      if (valor && valor.includes("T") && valor.length >= 13) {
        const tIdx = valor.indexOf("T");
        const hora = valor.substring(tIdx + 1, tIdx + 3);
        const min = valor.substring(tIdx + 3, tIdx + 5);
        eventoAtual.endTime = `${hora}:${min}`;
      } else {
        eventoAtual.endTime = "09:00";
      }
    } else if (linha.startsWith("RRULE:")) {
      if (linha.includes("FREQ=DAILY")) eventoAtual.recurrence = "daily";
      else if (linha.includes("FREQ=WEEKLY;INTERVAL=2")) eventoAtual.recurrence = "biweekly";
      else if (linha.includes("FREQ=WEEKLY")) eventoAtual.recurrence = "weekly";
      else if (linha.includes("FREQ=MONTHLY")) eventoAtual.recurrence = "monthly";
    }
  }

  // Persiste os eventos importados junto aos existentes
  if (eventosImportados.length > 0) {
    const existentes = carregarEventosAgenda();
    salvarEventosAgenda([...existentes, ...eventosImportados]);
  }

  return eventosImportados;
}

/**
 * Matriz de dias para o calendário do mês especificado
 */
export interface DiaCalendario {
  data: string; // YYYY-MM-DD
  diaNumero: number;
  mes: number;
  ano: number;
  isMesAtual: boolean;
  isHoje: boolean;
}

export function gerarMatrizDiasMes(ano: number, mes: number): DiaCalendario[] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const hojeIso = new Date().toISOString().split("T")[0];

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay(); // 0 (Domingo) a 6 (Sábado)

  const dias: DiaCalendario[] = [];

  // Dias do mês anterior para preencher a primeira semana
  const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    const diaNum = ultimoDiaMesAnterior - i;
    const mesAnt = mes === 0 ? 11 : mes - 1;
    const anoAnt = mes === 0 ? ano - 1 : ano;
    const dataIso = `${anoAnt}-${pad(mesAnt + 1)}-${pad(diaNum)}`;
    dias.push({
      data: dataIso,
      diaNumero: diaNum,
      mes: mesAnt,
      ano: anoAnt,
      isMesAtual: false,
      isHoje: dataIso === hojeIso,
    });
  }

  // Dias do mês atual
  for (let d = 1; d <= diasNoMes; d++) {
    const dataIso = `${ano}-${pad(mes + 1)}-${pad(d)}`;
    dias.push({
      data: dataIso,
      diaNumero: d,
      mes,
      ano,
      isMesAtual: true,
      isHoje: dataIso === hojeIso,
    });
  }

  // Dias do próximo mês para completar 35 ou 42 células
  const totalCelulas = dias.length > 35 ? 42 : 35;
  const diasRestantes = totalCelulas - dias.length;
  for (let d = 1; d <= diasRestantes; d++) {
    const mesProx = mes === 11 ? 0 : mes + 1;
    const anoProx = mes === 11 ? ano + 1 : ano;
    const dataIso = `${anoProx}-${pad(mesProx + 1)}-${pad(d)}`;
    dias.push({
      data: dataIso,
      diaNumero: d,
      mes: mesProx,
      ano: anoProx,
      isMesAtual: false,
      isHoje: dataIso === hojeIso,
    });
  }

  return dias;
}

export const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
