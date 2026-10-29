/**
 * Brain Studio - Agenda Acadêmica e Calendário Anual 12 Meses (Bloco 5)
 * Visões: Mês, Semana, Dia e Lista (Próximos 30 dias)
 * Recorrência, Integração Bidirecional com Tarefas e AVA, Feriados Brasileiros e Import/Export .ics
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Circle,
  Flag,
  Tag,
  Repeat,
  Trash2,
  X,
  ListFilter,
  Eye,
  AlertCircle,
} from "lucide-react";
import { UserProfile, CourseTrack, AgendaEvent, EventType, EventRecurrence } from "../../types";
import {
  carregarTodosEventosUnificados,
  carregarEventosAgenda,
  salvarEventosAgenda,
  alternarConclusaoEvento,
  gerarMatrizDiasMes,
  NOMES_MESES,
  obterFeriadosNacionais,
  salvarFeriadoCustomizado,
  exportarAgendaParaArquivoICS,
  importarAgendaDeTextoICS,
  DiaCalendario,
} from "../../services/agendaService";

interface AgendaTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onNavigateToStudyRoom?: () => void;
}

type VisaoCalendario = "mes" | "semana" | "dia" | "lista";

const CORES_TIPO_EVENTO: Record<EventType, { bg: string; text: string; border: string; label: string }> = {
  aula: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Aula" },
  prova: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30", label: "Prova" },
  trabalho: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Trabalho" },
  entrega: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", label: "Entrega AVA" },
  revisao: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Revisão" },
  pessoal: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", label: "Pessoal" },
  feriado: { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/30", label: "Feriado" },
  reuniao: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", label: "Reunião" },
  estudo: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30", label: "Estudo" },
  plantao: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", label: "Plantão" },
};

export const AgendaTab: React.FC<AgendaTabProps> = ({ user, courses, onNavigateToStudyRoom }) => {
  const { t } = useTranslation();

  const hoje = useMemo(() => new Date(), []);
  const [anoAtual, setAnoAtual] = useState<number>(() => hoje.getFullYear());
  const [mesAtual, setMesAtual] = useState<number>(() => hoje.getMonth()); // 0 a 11
  const [diaSelecionado, setDiaSelecionado] = useState<string>(() => hoje.toISOString().split("T")[0]);
  const [visao, setVisao] = useState<VisaoCalendario>("mes");

  const [eventosUnificados, setEventosUnificados] = useState<AgendaEvent[]>(() =>
    carregarTodosEventosUnificados(hoje.getFullYear())
  );

  const [modalNovoEventoAberto, setModalNovoEventoAberto] = useState(false);
  const [modalFeriadoAberto, setModalFeriadoAberto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recarrega eventos quando o ano ou gatilhos externos mudarem
  const recarregarEventos = () => {
    setEventosUnificados(carregarTodosEventosUnificados(anoAtual));
  };

  useEffect(() => {
    recarregarEventos();
  }, [anoAtual]);

  useEffect(() => {
    const handleAgendaUpdated = () => recarregarEventos();
    const handleTasksUpdated = () => recarregarEventos();
    const handleAssignmentsUpdated = () => recarregarEventos();

    window.addEventListener("brainstudio:agenda-updated", handleAgendaUpdated);
    window.addEventListener("brainstudio:tasks-updated", handleTasksUpdated);
    window.addEventListener("brainstudio:assignments-updated", handleAssignmentsUpdated);

    return () => {
      window.removeEventListener("brainstudio:agenda-updated", handleAgendaUpdated);
      window.removeEventListener("brainstudio:tasks-updated", handleTasksUpdated);
      window.removeEventListener("brainstudio:assignments-updated", handleAssignmentsUpdated);
    };
  }, [anoAtual]);

  // Form states para criação de novo evento
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoDescricao, setNovoDescricao] = useState("");
  const [novoData, setNovoData] = useState(() => hoje.toISOString().split("T")[0]);
  const [novoHoraInicio, setNovoHoraInicio] = useState("09:00");
  const [novoHoraFim, setNovoHoraFim] = useState("10:30");
  const [novoTipo, setNovoTipo] = useState<EventType>("aula");
  const [novoCourseName, setNovoCourseName] = useState("");
  const [novoLocal, setNovoLocal] = useState("");
  const [novoRecorrencia, setNovoRecorrencia] = useState<EventRecurrence>("none");
  const [novoRecorrenciaFim, setNovoRecorrenciaFim] = useState("");

  // Form states para novo feriado customizado
  const [feriadoNome, setFeriadoNome] = useState("");
  const [feriadoData, setFeriadoData] = useState(() => hoje.toISOString().split("T")[0]);
  const [feriadoTipo, setFeriadoTipo] = useState<"local" | "academico">("academico");

  // Matriz de dias para o mês atual
  const matrizDias = useMemo(() => {
    return gerarMatrizDiasMes(anoAtual, mesAtual);
  }, [anoAtual, mesAtual]);

  // Mapa de eventos por data para busca O(1)
  const eventosPorData = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const ev of eventosUnificados) {
      const arr = map.get(ev.date) || [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [eventosUnificados]);

  // Navegação entre meses
  const handleMesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual((prev) => prev - 1);
    } else {
      setMesAtual((prev) => prev - 1);
    }
  };

  const handleProximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual((prev) => prev + 1);
    } else {
      setMesAtual((prev) => prev + 1);
    }
  };

  // Alternar checkbox de conclusão
  const handleToggleConclusao = (ev: AgendaEvent) => {
    alternarConclusaoEvento(ev.id, !ev.completed, eventosUnificados);
    recarregarEventos();
  };

  // Salvar novo evento
  const handleSalvarNovoEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novoData) return;

    const novo: AgendaEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: novoTitulo.trim(),
      description: novoDescricao.trim(),
      date: novoData,
      startTime: novoHoraInicio || "09:00",
      endTime: novoHoraFim || "10:00",
      type: novoTipo,
      courseName: novoCourseName || undefined,
      locationOrLink: novoLocal.trim() || undefined,
      recurrence: novoRecorrencia,
      recurrenceEndDate: novoRecorrencia !== "none" ? novoRecorrenciaFim : undefined,
      completed: false,
    };

    const existentes = carregarEventosAgenda();
    salvarEventosAgenda([...existentes, novo]);
    recarregarEventos();

    // Limpa form e fecha
    setNovoTitulo("");
    setNovoDescricao("");
    setNovoLocal("");
    setModalNovoEventoAberto(false);
  };

  // Salvar feriado customizado
  const handleSalvarFeriado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feriadoNome.trim() || !feriadoData) return;

    salvarFeriadoCustomizado({
      data: feriadoData,
      nome: feriadoNome.trim(),
      tipo: feriadoTipo,
      fixo: false,
    });

    recarregarEventos();
    setFeriadoNome("");
    setModalFeriadoAberto(false);
  };

  // Importar arquivo .ics
  const handleArquivoICSSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const conteudo = evt.target?.result as string;
      if (conteudo) {
        const importados = importarAgendaDeTextoICS(conteudo);
        if (importados.length > 0) {
          recarregarEventos();
          alert(`Sucesso! ${importados.length} evento(s) importados da sua agenda .ics com êxito.`);
        } else {
          alert("Nenhum evento válido foi encontrado no arquivo .ics selecionado.");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Próximos 30 dias para a visão Lista
  const eventosProximos30Dias = useMemo(() => {
    const hojeMs = new Date().setHours(0, 0, 0, 0);
    const limite30Ms = hojeMs + 30 * 86400000;

    return eventosUnificados
      .filter((ev) => {
        const [a, m, d] = ev.date.split("-").map(Number);
        const dataEvMs = new Date(a, m - 1, d).getTime();
        return dataEvMs >= hojeMs && dataEvMs <= limite30Ms;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [eventosUnificados]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner de Ações da Agenda */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight">
              Agenda & Calendário Anual
            </h1>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Calendário completo dos 12 meses com integração de matérias, entregas e feriados oficiais.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Novo Evento */}
          <button
            onClick={() => setModalNovoEventoAberto(true)}
            className="px-3.5 py-2 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>

          {/* Botão Feriado */}
          <button
            onClick={() => setModalFeriadoAberto(true)}
            className="px-3 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Adicionar Feriado Local ou Acadêmico"
          >
            <Flag className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Feriado Local</span>
          </button>

          {/* Botão Exportar .ICS */}
          <button
            onClick={() => exportarAgendaParaArquivoICS(eventosUnificados)}
            className="px-3 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Exportar para Google Agenda / Apple Calendar (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Exportar .ics</span>
          </button>

          {/* Botão Importar .ICS */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics,text/calendar"
            className="hidden"
            onChange={handleArquivoICSSelecionado}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Importar arquivo .ics"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Importar</span>
          </button>
        </div>
      </div>

      {/* Controles de Navegação Anual e Seletor de Visão */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navegação de Ano e Mês */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={handleMesAnterior}
              className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] transition cursor-pointer"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleProximoMes}
              className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] transition cursor-pointer"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[var(--app-text)]">
              {NOMES_MESES[mesAtual]}
            </h2>
            <select
              value={anoAtual}
              onChange={(e) => setAnoAtual(Number(e.target.value))}
              className="bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] rounded-lg px-2 py-1 text-sm font-bold cursor-pointer"
            >
              {[anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Botão Voltar para Hoje */}
          <button
            onClick={() => {
              setAnoAtual(hoje.getFullYear());
              setMesAtual(hoje.getMonth());
              setDiaSelecionado(hoje.toISOString().split("T")[0]);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] transition cursor-pointer"
          >
            Hoje
          </button>
        </div>

        {/* 12 Meses Rápidos (Pills) */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-md scrollbar-none">
          {NOMES_MESES.map((nome, idx) => (
            <button
              key={nome}
              onClick={() => setMesAtual(idx)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                mesAtual === idx
                  ? "bg-[var(--app-primary)] text-white"
                  : "bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {nome.substring(0, 3)}
            </button>
          ))}
        </div>

        {/* Alternador de Visões: Mês, Semana, Dia, Lista */}
        <div className="flex items-center gap-1 bg-[var(--app-bg)] p-1 rounded-xl border border-[var(--app-border)] w-full md:w-auto justify-center">
          {(["mes", "semana", "dia", "lista"] as VisaoCalendario[]).map((v) => {
            const labels: Record<VisaoCalendario, string> = {
              mes: "Mês",
              semana: "Semana",
              dia: "Dia",
              lista: "Lista (30d)",
            };
            return (
              <button
                key={v}
                onClick={() => setVisao(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  visao === v
                    ? "bg-[var(--app-card)] text-[var(--app-text)] shadow-xs"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {labels[v]}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDERIZAÇÃO DA VISÃO SELECIONADA */}

      {/* 1. VISÃO MÊS (GRADE DE 35 OU 42 CÉLULAS) */}
      {visao === "mes" && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase text-[var(--app-text-muted)] pb-2 border-b border-[var(--app-border)]">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Células dos Dias */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {matrizDias.map((diaItem, idx) => {
              const eventosDia = eventosPorData.get(diaItem.data) || [];
              const isSelected = diaItem.data === diaSelecionado;

              return (
                <div
                  key={`${diaItem.data}_${idx}`}
                  onClick={() => setDiaSelecionado(diaItem.data)}
                  className={`min-h-[75px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/40 bg-[var(--app-primary)]/5"
                      : diaItem.isMesAtual
                      ? "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
                      : "bg-[var(--app-bg)]/40 border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  {/* Top: Número do dia e badge de Hoje */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        diaItem.isHoje
                          ? "bg-[var(--app-primary)] text-white shadow-xs"
                          : diaItem.isMesAtual
                          ? "text-[var(--app-text)]"
                          : "text-[var(--app-text-muted)]"
                      }`}
                    >
                      {diaItem.diaNumero}
                    </span>

                    {eventosDia.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                        {eventosDia.length}
                      </span>
                    )}
                  </div>

                  {/* Badges/Pills dos Eventos (máximo 2 na célula para não quebrar layout) */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {eventosDia.slice(0, 2).map((ev) => {
                      const estilo = CORES_TIPO_EVENTO[ev.type] || CORES_TIPO_EVENTO.aula;
                      return (
                        <div
                          key={ev.id}
                          className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded truncate border ${estilo.bg} ${estilo.text} ${estilo.border} flex items-center gap-1`}
                        >
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}
                    {eventosDia.length > 2 && (
                      <span className="text-[9px] text-[var(--app-text-muted)] font-medium pl-1">
                        +{eventosDia.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalhes do Dia Selecionado Abaixo da Grade */}
          <div className="pt-4 border-t border-[var(--app-border)]">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--app-primary)]" />
                <span>
                  Eventos em{" "}
                  {new Date(`${diaSelecionado}T00:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </h3>
              <button
                onClick={() => {
                  setNovoData(diaSelecionado);
                  setModalNovoEventoAberto(true);
                }}
                className="text-xs font-bold text-[var(--app-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar neste dia
              </button>
            </div>

            {(!eventosPorData.get(diaSelecionado) || eventosPorData.get(diaSelecionado)!.length === 0) ? (
              <p className="text-xs text-[var(--app-text-muted)] italic py-2">
                Nenhum evento ou prazo agendado para esta data.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventosPorData.get(diaSelecionado)!.map((ev) => (
                  <EventoCardItem
                    key={ev.id}
                    evento={ev}
                    onToggleConclusao={() => handleToggleConclusao(ev)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VISÃO SEMANA (7 DIAS HORIZONTAIS) */}
      {visao === "semana" && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[var(--app-primary)]" />
            Visão Semanal Detalhada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {matrizDias
              .filter((d) => d.isMesAtual)
              .slice(0, 7)
              .map((diaItem) => {
                const eventosDia = eventosPorData.get(diaItem.data) || [];
                return (
                  <div
                    key={diaItem.data}
                    className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3"
                  >
                    <div className="text-center pb-2 border-b border-[var(--app-border)]">
                      <p className="text-[10px] uppercase font-bold text-[var(--app-text-muted)]">
                        {new Date(`${diaItem.data}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "short" })}
                      </p>
                      <p className="text-base font-black text-[var(--app-text)]">{diaItem.diaNumero}</p>
                    </div>
                    <div className="space-y-2">
                      {eventosDia.length === 0 ? (
                        <p className="text-[10px] text-[var(--app-text-muted)] text-center italic py-2">Livre</p>
                      ) : (
                        eventosDia.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs space-y-1"
                          >
                            <p className="font-bold text-[var(--app-text)] line-clamp-1">{ev.title}</p>
                            <p className="text-[10px] text-[var(--app-text-muted)]">
                              ⏱️ {ev.startTime} - {ev.endTime}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. VISÃO DIA (HORA A HORA) */}
      {visao === "dia" && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div>
              <h3 className="text-base font-black text-[var(--app-text)]">
                Cronograma do Dia: {diaSelecionado}
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                {new Date(`${diaSelecionado}T00:00:00`).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => {
                setNovoData(diaSelecionado);
                setModalNovoEventoAberto(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Horário
            </button>
          </div>

          <div className="space-y-2">
            {(!eventosPorData.get(diaSelecionado) || eventosPorData.get(diaSelecionado)!.length === 0) ? (
              <div className="text-center py-12 text-[var(--app-text-muted)] space-y-2">
                <CalendarIcon className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold">Nenhum evento agendado para este dia.</p>
              </div>
            ) : (
              eventosPorData.get(diaSelecionado)!.map((ev) => (
                <EventoCardItem
                  key={ev.id}
                  evento={ev}
                  onToggleConclusao={() => handleToggleConclusao(ev)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. VISÃO LISTA (PRÓXIMOS 30 DIAS) */}
      {visao === "lista" && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <h3 className="text-base font-black text-[var(--app-text)] flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-[var(--app-primary)]" />
              Próximos 30 Dias de Atividades e Prazos
            </h3>
            <span className="text-xs text-[var(--app-text-muted)] font-bold">
              {eventosProximos30Dias.length} evento(s) localizados
            </span>
          </div>

          {eventosProximos30Dias.length === 0 ? (
            <p className="text-center py-8 text-xs text-[var(--app-text-muted)] italic">
              Não há eventos ou entregas nos próximos 30 dias.
            </p>
          ) : (
            <div className="space-y-3">
              {eventosProximos30Dias.map((ev) => (
                <EventoCardItem
                  key={ev.id}
                  evento={ev}
                  showDateBadge
                  onToggleConclusao={() => handleToggleConclusao(ev)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVO EVENTO COM RECORRÊNCIA */}
      {modalNovoEventoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[var(--app-primary)]" />
                Criar Novo Evento na Agenda
              </h3>
              <button
                onClick={() => setModalNovoEventoAberto(false)}
                className="p-1 rounded-xl hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoEvento} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Aula de Física Teórica, Prova Parcial..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as EventType)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none cursor-pointer"
                  >
                    <option value="aula">Aula</option>
                    <option value="prova">Prova</option>
                    <option value="trabalho">Trabalho</option>
                    <option value="entrega">Entrega</option>
                    <option value="revisao">Revisão</option>
                    <option value="pessoal">Pessoal</option>
                    <option value="reuniao">Reunião</option>
                    <option value="estudo">Estudo</option>
                    <option value="plantao">Plantão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                    Matéria Associada
                  </label>
                  <select
                    value={novoCourseName}
                    onChange={(e) => setNovoCourseName(e.target.value)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none cursor-pointer"
                  >
                    <option value="">Geral / Sem matéria</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.icon} {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={novoData}
                    onChange={(e) => setNovoData(e.target.value)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-2 py-2 text-xs text-[var(--app-text)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">Início</label>
                  <input
                    type="time"
                    value={novoHoraInicio}
                    onChange={(e) => setNovoHoraInicio(e.target.value)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-2 py-2 text-xs text-[var(--app-text)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">Término</label>
                  <input
                    type="time"
                    value={novoHoraFim}
                    onChange={(e) => setNovoHoraFim(e.target.value)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-2 py-2 text-xs text-[var(--app-text)] outline-none"
                  />
                </div>
              </div>

              {/* Recorrência */}
              <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-text)]">
                  <Repeat className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Repetição / Recorrência</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={novoRecorrencia}
                    onChange={(e) => setNovoRecorrencia(e.target.value as EventRecurrence)}
                    className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--app-text)] outline-none cursor-pointer"
                  >
                    <option value="none">Não se repete</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quinzenal</option>
                    <option value="monthly">Mensal</option>
                  </select>

                  {novoRecorrencia !== "none" && (
                    <input
                      type="date"
                      value={novoRecorrenciaFim}
                      onChange={(e) => setNovoRecorrenciaFim(e.target.value)}
                      placeholder="Data de término"
                      className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-2 py-1.5 text-xs text-[var(--app-text)] outline-none"
                      title="Data de término da repetição"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Local ou Link
                </label>
                <input
                  type="text"
                  value={novoLocal}
                  onChange={(e) => setNovoLocal(e.target.value)}
                  placeholder="Ex: Sala 204, Google Meet, Sala Virtual..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Anotações / Descrição
                </label>
                <textarea
                  rows={2}
                  value={novoDescricao}
                  onChange={(e) => setNovoDescricao(e.target.value)}
                  placeholder="Instruções ou matérias que serão abordadas..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setModalNovoEventoAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white shadow-xs transition cursor-pointer"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO FERIADO LOCAL OU ACADÊMICO */}
      {modalFeriadoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <h3 className="text-base font-black text-[var(--app-text)] flex items-center gap-2">
                <Flag className="w-5 h-5 text-teal-400" />
                Cadastrar Feriado Local ou Acadêmico
              </h3>
              <button
                onClick={() => setModalFeriadoAberto(false)}
                className="p-1 rounded-xl hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarFeriado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Nome do Feriado / Recesso *
                </label>
                <input
                  type="text"
                  required
                  value={feriadoNome}
                  onChange={(e) => setFeriadoNome(e.target.value)}
                  placeholder="Ex: Aniversário da Cidade, Semana Acadêmica..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={feriadoData}
                    onChange={(e) => setFeriadoData(e.target.value)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-2 py-2 text-xs text-[var(--app-text)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">Tipo</label>
                  <select
                    value={feriadoTipo}
                    onChange={(e) => setFeriadoTipo(e.target.value as any)}
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-2 py-2 text-xs text-[var(--app-text)] outline-none cursor-pointer"
                  >
                    <option value="academico">Acadêmico / IFES</option>
                    <option value="local">Feriado Municipal/Estadual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setModalFeriadoAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--app-bg)] text-[var(--app-text-muted)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-500 text-white shadow-xs cursor-pointer"
                >
                  Registrar Feriado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface EventoCardItemProps {
  evento: AgendaEvent;
  showDateBadge?: boolean;
  onToggleConclusao: () => void;
}

const EventoCardItem: React.FC<EventoCardItemProps> = ({
  evento,
  showDateBadge = false,
  onToggleConclusao,
}) => {
  const estilo = CORES_TIPO_EVENTO[evento.type] || CORES_TIPO_EVENTO.aula;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 bg-[var(--app-card-secondary)] hover:border-[var(--app-border)] shadow-2xs ${
        evento.completed ? "opacity-60 bg-[var(--app-bg)]/60" : ""
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Checkbox interativo */}
        {!evento.isHoliday && (
          <button
            onClick={onToggleConclusao}
            className="mt-0.5 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition cursor-pointer shrink-0"
            title={evento.completed ? "Marcar como pendente" : "Concluir evento"}
          >
            {evento.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${estilo.bg} ${estilo.text} ${estilo.border}`}
            >
              {estilo.label}
            </span>

            {evento.courseName && (
              <span className="text-[10px] font-semibold text-[var(--app-text-muted)] truncate max-w-[180px]">
                • {evento.courseName}
              </span>
            )}

            {evento.isSynced && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Sincronizado
              </span>
            )}

            {evento.recurrence && evento.recurrence !== "none" && (
              <span className="text-[9px] font-bold text-[var(--app-text-muted)] flex items-center gap-0.5">
                <Repeat className="w-3 h-3" /> {evento.recurrence}
              </span>
            )}
          </div>

          <p
            className={`text-xs font-bold text-[var(--app-text)] ${
              evento.completed ? "line-through text-[var(--app-text-muted)]" : ""
            }`}
          >
            {evento.title}
          </p>

          {evento.description && (
            <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1 leading-relaxed">
              {evento.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-[10px] text-[var(--app-text-muted)] pt-0.5">
            {showDateBadge && (
              <span className="font-bold text-[var(--app-primary)]">
                📅 {evento.date}
              </span>
            )}
            <span>⏱️ {evento.startTime} - {evento.endTime}</span>
            {evento.locationOrLink && (
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-3 h-3 shrink-0" />
                {evento.locationOrLink}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
