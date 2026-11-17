import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
  Edit2,
  X,
} from "lucide-react";
import { UserProfile, CourseTrack, AgendaEvent, IfesClassSchedule } from "../../types";
import { loadSyncedSchedules, saveSyncedSchedules } from "../../utils/courseSync";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { moverParaExcluidos, isItemExcluido } from "../../features/excluidos/services/excluidosService";

interface AgendaTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onNavigateToStudyRoom: () => void;
}

const STORAGE_KEY_AGENDA = "brain_studio_agenda_events_v3";
const STORAGE_KEY_DELETED_SCHEDULES = "brain_studio_deleted_schedules_v1";

const DEFAULT_EVENTS: AgendaEvent[] = [
  {
    id: "ev-1",
    title: "Seminário de Apresentação: Taylorismo vs Fordismo",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    startTime: "09:30",
    endTime: "11:00",
    type: "trabalho",
    courseName: "Teorias da Administração",
    locationOrLink: "Sala 204 - IFES Campus Vitória",
  },
  {
    id: "ev-2",
    title: "Plantão de Dúvidas & Monitoria de Algoritmos",
    date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:30",
    type: "reuniao",
    courseName: "Algoritmos e Lógica",
    locationOrLink: "Sala de Foco em Grupo",
  },
  {
    id: "ev-3",
    title: "Avaliação Escrita: Ciclo PDCA e Ferramentas 5S",
    date: new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "10:00",
    type: "prova",
    courseName: "Gestão da Qualidade",
    locationOrLink: "Auditório Setorial",
  },
];

const FERIADOS_NACIONAIS_BR: Record<string, string> = {
  "01-01": "Confraternização Universal",
  "04-21": "Tiradentes",
  "05-01": "Dia do Trabalho",
  "09-07": "Independência do Brasil",
  "10-12": "Nossa Sra. Aparecida",
  "11-02": "Finados",
  "11-15": "Proclamação da República",
  "12-25": "Natal",
};

const NOMES_MESES = [
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

const DIAS_SEMANA_SIGLA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const AgendaTab: React.FC<AgendaTabProps> = ({
  user,
  courses = [],
  onNavigateToStudyRoom,
}) => {
  const { t } = useTranslation();
  const userId = user?.id || user?.uid || "local_user";

  const [visao, setVisao] = useState<"ano" | "mes" | "semana" | "lista">("mes");
  const hoje = new Date();
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [mesAtual, setMesAtual] = useState(hoje.getMonth()); // 0-11
  const [dataSelecionada, setDataSelecionada] = useState(hoje.toISOString().split("T")[0]);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroMateria, setFiltroMateria] = useState<string>("todas");

  // Modal de criação / edição de evento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEmEdicao, setEventoEmEdicao] = useState<AgendaEvent | null>(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formData, setFormData] = useState(dataSelecionada);
  const [formHoraInicio, setFormHoraInicio] = useState("09:00");
  const [formHoraFim, setFormHoraFim] = useState("10:30");
  const [formTipo, setFormTipo] = useState<"prova" | "trabalho" | "reuniao">("trabalho");
  const [formMateria, setFormMateria] = useState(courses[0]?.title || "Geral");
  const [formLocal, setFormLocal] = useState("Campus IFES");

  const [schedules, setSchedules] = useState<IfesClassSchedule[]>(() => loadSyncedSchedules());
  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGENDA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((e) => !isItemExcluido(e.id, e.title));
        }
      }
    } catch {}
    return DEFAULT_EVENTS.filter((e) => !isItemExcluido(e.id, e.title));
  });

  const salvarEventos = (novos: AgendaEvent[]) => {
    setEvents(novos);
    try {
      localStorage.setItem(STORAGE_KEY_AGENDA, JSON.stringify(novos));
    } catch {}
  };

  const eventosFiltrados = useMemo(() => {
    return events.filter((ev) => {
      if (isItemExcluido(ev.id, ev.title)) return false;
      const matchTipo = filtroTipo === "todos" || ev.type === filtroTipo;
      const matchMateria = filtroMateria === "todas" || ev.courseName === filtroMateria;
      const matchBusca =
        !busca.trim() ||
        ev.title.toLowerCase().includes(busca.toLowerCase().trim()) ||
        ev.courseName.toLowerCase().includes(busca.toLowerCase().trim());
      return matchTipo && matchMateria && matchBusca;
    });
  }, [events, filtroTipo, filtroMateria, busca]);

  const eventosDoMes = useMemo(() => {
    const prefix = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}`;
    return eventosFiltrados.filter((ev) => ev.date.startsWith(prefix));
  }, [eventosFiltrados, anoAtual, mesAtual]);

  const mapaEventosPorDia = useMemo(() => {
    const mapa = new Map<string, AgendaEvent[]>();
    for (const ev of eventosFiltrados) {
      const lista = mapa.get(ev.date) || [];
      lista.push(ev);
      mapa.set(ev.date, lista);
    }
    return mapa;
  }, [eventosFiltrados]);

  // Abre modal para criar novo evento
  const handleNovoEvento = (dataPredefinida?: string) => {
    setEventoEmEdicao(null);
    setFormTitulo("");
    setFormData(dataPredefinida || dataSelecionada);
    setFormHoraInicio("09:00");
    setFormHoraFim("10:30");
    setFormTipo("trabalho");
    setFormMateria(courses[0]?.title || "Geral");
    setFormLocal("Campus IFES");
    setIsModalOpen(true);
  };

  // Abre modal para editar evento existente
  const handleEditarEvento = (ev: AgendaEvent) => {
    setEventoEmEdicao(ev);
    setFormTitulo(ev.title);
    setFormData(ev.date);
    setFormHoraInicio(ev.startTime);
    setFormHoraFim(ev.endTime);
    setFormTipo(ev.type);
    setFormMateria(ev.courseName);
    setFormLocal(ev.locationOrLink || "Campus IFES");
    setIsModalOpen(true);
  };

  const handleSalvarModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;

    if (eventoEmEdicao) {
      const atualizado: AgendaEvent = {
        ...eventoEmEdicao,
        title: formTitulo.trim(),
        date: formData,
        startTime: formHoraInicio,
        endTime: formHoraFim,
        type: formTipo,
        courseName: formMateria,
        locationOrLink: formLocal.trim(),
      };
      salvarEventos(events.map((e) => (e.id === eventoEmEdicao.id ? atualizado : e)));
    } else {
      const novo: AgendaEvent = {
        id: `ev-${Date.now()}`,
        title: formTitulo.trim(),
        date: formData,
        startTime: formHoraInicio,
        endTime: formHoraFim,
        type: formTipo,
        courseName: formMateria,
        locationOrLink: formLocal.trim(),
      };
      salvarEventos([novo, ...events]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteEvent = async (ev: AgendaEvent) => {
    await moverParaExcluidos(userId, {
      id: ev.id,
      categoria: "eventos",
      nome: ev.title,
      materiaOrigem: ev.courseName,
      dadosOriginais: ev,
    });
    const updated = events.filter((e) => e.id !== ev.id);
    salvarEventos(updated);
  };

  const handleDeleteSchedule = async (index: number) => {
    const sch = schedules[index];
    if (!sch) return;
    const key = `${sch.dayOfWeek}_${sch.timeSlot}_${sch.courseName}`.toLowerCase().trim();

    await moverParaExcluidos(userId, {
      id: `sch-${index}-${key}`,
      categoria: "eventos",
      nome: `${sch.courseName} (${sch.dayOfWeek} ${sch.timeSlot})`,
      materiaOrigem: sch.courseName,
      dadosOriginais: sch,
    });

    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
    saveSyncedSchedules(updated);
  };

  // Exportar Agenda para arquivo RFC 5545 iCalendar (.ics)
  const handleExportarICS = () => {
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Brain Studio//Agenda Academica//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

    for (const ev of events) {
      const startDateTime = `${ev.date.replace(/-/g, "")}T${ev.startTime.replace(":", "")}00`;
      const endDateTime = `${ev.date.replace(/-/g, "")}T${ev.endTime.replace(":", "")}00`;
      ics += "BEGIN:VEVENT\n";
      ics += `UID:${ev.id}@brainstudio.app\n`;
      ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
      ics += `DTSTART:${startDateTime}\n`;
      ics += `DTEND:${endDateTime}\n`;
      ics += `SUMMARY:${ev.title}\n`;
      ics += `DESCRIPTION:Disciplina: ${ev.courseName} | Tipo: ${ev.type}\n`;
      ics += `LOCATION:${ev.locationOrLink || "Campus IFES"}\n`;
      ics += "STATUS:CONFIRMED\n";
      ics += "END:VEVENT\n";
    }

    ics += "END:VCALENDAR\n";

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `brain_studio_agenda_${anoAtual}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dias no mês com suporte real a bissextos
  const totalDiasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay(); // 0 = Dom

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight">
              Agenda & Calendário Anual
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Planejamento anual, prazos acadêmicos, avaliações e grade semanal integrada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarICS}
            className="flex items-center gap-1.5 text-xs"
            title="Exportar calendário para formato padrão .ics"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .ICS</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateToStudyRoom}
            className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sala de Foco</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNovoEvento()}
            className="flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </Button>
        </div>
      </div>

      {/* Controles de Navegação e Seletor de Visão */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--app-card)] p-4 rounded-3xl border border-[var(--app-border)]">
        {/* Navegador de Data */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (visao === "ano") {
                setAnoAtual((prev) => prev - 1);
              } else {
                if (mesAtual === 0) {
                  setMesAtual(11);
                  setAnoAtual((prev) => prev - 1);
                } else {
                  setMesAtual((prev) => prev - 1);
                }
              }
            }}
            className="w-8 h-8 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] flex items-center justify-center transition cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h3 className="text-base sm:text-lg font-black text-[var(--app-text)] min-w-[180px] text-center font-mono">
            {visao === "ano" ? anoAtual : `${NOMES_MESES[mesAtual]} de ${anoAtual}`}
          </h3>

          <button
            type="button"
            onClick={() => {
              if (visao === "ano") {
                setAnoAtual((prev) => prev + 1);
              } else {
                if (mesAtual === 11) {
                  setMesAtual(0);
                  setAnoAtual((prev) => prev + 1);
                } else {
                  setMesAtual((prev) => prev + 1);
                }
              }
            }}
            className="w-8 h-8 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] flex items-center justify-center transition cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAnoAtual(hoje.getFullYear());
              setMesAtual(hoje.getMonth());
              setDataSelecionada(hoje.toISOString().split("T")[0]);
            }}
            className="text-xs ml-2"
          >
            Hoje
          </Button>
        </div>

        {/* Abas de Visão: Ano, Mês, Semana, Lista */}
        <div className="flex items-center p-1 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] self-stretch sm:self-auto">
          {(["ano", "mes", "semana", "lista"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisao(v)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                visao === v
                  ? "bg-[var(--app-card)] text-[var(--app-primary)] shadow-xs"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {v === "ano" ? "Ano Completo" : v === "mes" ? "Mês" : v === "semana" ? "Semana" : "Lista"}
            </button>
          ))}
        </div>
      </div>

      {/* 1. VISÃO MÊS */}
      {visao === "mes" && (
        <div className="space-y-4">
          <div className="bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)] p-4 sm:p-6 shadow-xs">
            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[var(--app-text-muted)] pb-3 border-b border-[var(--app-border)] uppercase tracking-wider">
              {DIAS_SEMANA_SIGLA.map((d, i) => (
                <div key={d} className={i === 0 || i === 6 ? "text-amber-500/80" : ""}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid dos Dias */}
            <div className="grid grid-cols-7 gap-1.5 pt-3">
              {/* Espaços vazios antes do 1º dia */}
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-2xl opacity-20 bg-black/5 dark:bg-white/5" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: totalDiasNoMes }).map((_, i) => {
                const diaNum = i + 1;
                const diaStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(diaNum).padStart(2, "0")}`;
                const ehHoje = diaStr === hoje.toISOString().split("T")[0];
                const ehSelecionado = diaStr === dataSelecionada;
                const eventosDoDia = mapaEventosPorDia.get(diaStr) || [];
                const feriadoMes = `${String(mesAtual + 1).padStart(2, "0")}-${String(diaNum).padStart(2, "0")}`;
                const feriadoNome = FERIADOS_NACIONAIS_BR[feriadoMes];

                return (
                  <div
                    key={diaStr}
                    onClick={() => setDataSelecionada(diaStr)}
                    className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      ehSelecionado
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)]/5 ring-2 ring-[var(--app-primary)]/20"
                        : ehHoje
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          ehHoje
                            ? "bg-[var(--app-primary)] text-white shadow-xs"
                            : "text-[var(--app-text)]"
                        }`}
                      >
                        {diaNum}
                      </span>
                      {feriadoNome && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title={feriadoNome} />
                      )}
                    </div>

                    {/* Marcadores de Eventos */}
                    <div className="space-y-1 overflow-hidden">
                      {eventosDoDia.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold truncate ${
                            ev.type === "prova"
                              ? "bg-red-500/15 text-red-600 dark:text-red-400"
                              : ev.type === "trabalho"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}
                          title={`${ev.title} (${ev.startTime})`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {eventosDoDia.length > 2 && (
                        <span className="text-[9px] text-[var(--app-text-muted)] font-bold pl-1 block">
                          +{eventosDoDia.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes do Dia Selecionado */}
          <div className="bg-[var(--app-card)] p-5 sm:p-6 rounded-3xl border border-[var(--app-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-[var(--app-text)]">
                  Compromissos para {dataSelecionada}
                </h4>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {(mapaEventosPorDia.get(dataSelecionada) || []).length} compromissos agendados para este dia
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNovoEvento(dataSelecionada)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar a esta data</span>
              </Button>
            </div>

            {(!mapaEventosPorDia.get(dataSelecionada) || mapaEventosPorDia.get(dataSelecionada)!.length === 0) ? (
              <div className="p-8 text-center rounded-2xl bg-[var(--app-card-secondary)] border border-dashed border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-1">
                <p>Nenhum compromisso marcado para este dia.</p>
                <p className="text-[11px]">Toque em "Adicionar a esta data" para agendar uma prova, entrega ou revisão.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mapaEventosPorDia.get(dataSelecionada)!.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ev.type === "prova"
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : ev.type === "trabalho"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}
                        >
                          {ev.type}
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--app-primary)]">
                          {ev.startTime} - {ev.endTime}
                        </span>
                        <span className="text-xs text-[var(--app-text-muted)]">• {ev.courseName}</span>
                      </div>
                      <h5 className="font-bold text-sm text-[var(--app-text)] truncate">{ev.title}</h5>
                      <p className="text-xs text-[var(--app-text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--app-text-muted)]" />
                        <span>{ev.locationOrLink}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditarEvento(ev)}
                        className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary)]/10 transition cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev)}
                        className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Mover para Excluídos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VISÃO ANO COMPLETO (12 MESES) */}
      {visao === "ano" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {NOMES_MESES.map((nomeMes, idxMes) => {
            const diasNoMes = new Date(anoAtual, idxMes + 1, 0).getDate();
            const primeiroDia = new Date(anoAtual, idxMes, 1).getDay();
            const prefixoMes = `${anoAtual}-${String(idxMes + 1).padStart(2, "0")}`;
            const totalEventosMes = eventosFiltrados.filter((e) => e.date.startsWith(prefixoMes)).length;

            return (
              <div
                key={nomeMes}
                onClick={() => {
                  setMesAtual(idxMes);
                  setVisao("mes");
                }}
                className="p-4 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer shadow-xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition">
                    {nomeMes}
                  </h4>
                  {totalEventosMes > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                      {totalEventosMes} eventos
                    </span>
                  )}
                </div>

                {/* Mini Grid dos dias */}
                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-center opacity-80 pt-1">
                  {DIAS_SEMANA_SIGLA.map((d) => (
                    <span key={d} className="text-[var(--app-text-muted)] text-[8px] font-bold">
                      {d[0]}
                    </span>
                  ))}
                  {Array.from({ length: primeiroDia }).map((_, i) => (
                    <span key={`emp-${i}`} />
                  ))}
                  {Array.from({ length: diasNoMes }).map((_, i) => {
                    const diaD = i + 1;
                    const dateD = `${prefixoMes}-${String(diaD).padStart(2, "0")}`;
                    const hasEv = mapaEventosPorDia.has(dateD);
                    const isToday = dateD === hoje.toISOString().split("T")[0];

                    return (
                      <span
                        key={diaD}
                        className={`rounded-md p-0.5 ${
                          isToday
                            ? "bg-[var(--app-primary)] text-white font-bold"
                            : hasEv
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold"
                            : "text-[var(--app-text-muted)]"
                        }`}
                      >
                        {diaD}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. VISÃO SEMANA */}
      {visao === "semana" && (
        <div className="bg-[var(--app-card)] p-6 rounded-3xl border border-[var(--app-border)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <h4 className="font-black text-base text-[var(--app-text)]">
              Grade Semanal de Aulas e Compromissos
            </h4>
            <span className="text-xs text-[var(--app-text-muted)]">
              {schedules.length} aulas fixas cadastradas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"].map((diaSemana) => {
              const aulasDoDia = schedules.filter(
                (s) => s.dayOfWeek.toLowerCase() === diaSemana.toLowerCase()
              );

              return (
                <div
                  key={diaSemana}
                  className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3"
                >
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[var(--app-primary)] border-b border-[var(--app-border)] pb-2">
                    {diaSemana.split("-")[0]}
                  </h5>

                  {aulasDoDia.length === 0 ? (
                    <p className="text-[11px] text-[var(--app-text-muted)] italic">Sem aulas fixas</p>
                  ) : (
                    <div className="space-y-2">
                      {aulasDoDia.map((a, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs space-y-1">
                          <span className="font-mono font-bold text-[10px] text-[var(--app-primary)] block">
                            {a.timeSlot}
                          </span>
                          <h6 className="font-bold text-[var(--app-text)] line-clamp-2">{a.courseName}</h6>
                          <span className="text-[10px] text-[var(--app-text-muted)] block">
                            📍 {a.room || "Campus"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISÃO LISTA */}
      {visao === "lista" && (
        <div className="space-y-4">
          {/* Filtros da Lista */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[var(--app-card)] p-4 rounded-2xl border border-[var(--app-border)]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar compromisso por título ou matéria..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="p-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="prova">Provas</option>
                <option value="trabalho">Trabalhos</option>
                <option value="reuniao">Monitorias/Reuniões</option>
              </select>

              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                className="p-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer max-w-[160px] truncate"
              >
                <option value="todas">Todas as Matérias</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Listagem */}
          {eventosFiltrados.length === 0 ? (
            <Card variant="default" padding="lg" className="py-12 text-center text-xs text-[var(--app-text-muted)]">
              Nenhum evento encontrado com os filtros selecionados.
            </Card>
          ) : (
            <div className="space-y-3">
              {eventosFiltrados.map((ev) => (
                <Card
                  key={ev.id}
                  variant="default"
                  padding="md"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ev.type === "prova"
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : ev.type === "trabalho"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        }`}
                      >
                        {ev.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--app-primary)]">
                        {ev.date} • {ev.startTime} às {ev.endTime}
                      </span>
                      <span className="text-xs text-[var(--app-text-muted)] font-medium">
                        • {ev.courseName}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--app-text)]">{ev.title}</h4>
                    <p className="text-xs text-[var(--app-text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--app-text-muted)]" />
                      <span>{ev.locationOrLink || "Campus IFES"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarEvento(ev)}
                      className="text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev)}
                      className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Mover para Excluídos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição de Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h3 className="text-lg font-black text-[var(--app-text)]">
                {eventoEmEdicao ? "Editar Compromisso" : "Novo Compromisso na Agenda"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarModal} className="space-y-4">
              <Input
                label="Título do Compromisso ou Prova"
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
                placeholder="Ex: Prova Bimestral de Física"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Data"
                  type="date"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                  required
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--app-text)]">Tipo</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer"
                  >
                    <option value="prova">Avaliação / Prova</option>
                    <option value="trabalho">Entrega de Trabalho</option>
                    <option value="reuniao">Monitoria / Reunião</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Horário Início"
                  type="time"
                  value={formHoraInicio}
                  onChange={(e) => setFormHoraInicio(e.target.value)}
                  required
                />
                <Input
                  label="Horário Término"
                  type="time"
                  value={formHoraFim}
                  onChange={(e) => setFormHoraFim(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--app-text)]">Disciplina Vinculada</label>
                <select
                  value={formMateria}
                  onChange={(e) => setFormMateria(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer"
                >
                  <option value="Geral">Geral (Sem disciplina vinculada)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Local ou Sala"
                value={formLocal}
                onChange={(e) => setFormLocal(e.target.value)}
                placeholder="Ex: Sala 204, Laboratório 3, Sala de Foco"
              />

              <div className="flex items-center gap-3 pt-3">
                <Button variant="primary" fullWidth type="submit">
                  {eventoEmEdicao ? "Salvar Alterações" : "Criar Compromisso"}
                </Button>
                <Button variant="secondary" fullWidth type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaTab;
