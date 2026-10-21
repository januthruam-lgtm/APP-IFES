import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  BookOpen,
} from "lucide-react";
import { UserProfile, CourseTrack, AgendaEvent, IfesClassSchedule } from "../../types";
import { loadSyncedSchedules } from "../../utils/courseSync";

interface AgendaTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onNavigateToStudyRoom: () => void;
}

const STORAGE_KEY_AGENDA = "brain_studio_agenda_events_v2";

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
    locationOrLink: "Sala Virtual Brain Studio",
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

export const AgendaTab: React.FC<AgendaTabProps> = ({
  user,
  courses,
  onNavigateToStudyRoom,
}) => {
  const { t } = useTranslation();
  const [schedules] = useState<IfesClassSchedule[]>(() => loadSyncedSchedules());
  const [events] = useState<AgendaEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGENDA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_EVENTS;
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">
              {t("agenda.titulo", "Agenda Acadêmica Integrada")}
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              {t("agenda.subtitulo", "Prazos, avaliações, entregas e salas de aula virtuais sincronizados")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToStudyRoom}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Video className="w-4 h-4" />
          <span>{t("agenda.entrar_sala_virtual", "Entrar na Sala Virtual")}</span>
        </button>
      </div>

      {/* Grade de Horários Oficiais do Semestre */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[var(--app-primary)]" />
          {t("dashboard.horarios_aulas", "Grade Semanal Oficial IFES")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {schedules.map((sch, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[var(--app-primary)]">
                  {sch.dayOfWeek}
                </span>
                <span className="text-[10px] font-mono text-[var(--app-text-muted)] font-bold">
                  {sch.timeSlot}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--app-text)] line-clamp-2">{sch.courseName}</p>
              <p className="text-[10px] text-[var(--app-text-muted)] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {sch.room || "Campus"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos Eventos & Provas */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[var(--app-primary)]" />
          {t("agenda.proximos_eventos", "Próximos Compromissos & Avaliações")}
        </h3>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
              {t("agenda.nenhum_evento", "Nenhum compromisso agendado para os próximos dias.")}
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ev.type === "prova"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : ev.type === "trabalho"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}
                    >
                      {ev.type === "prova"
                        ? t("agenda.tipo_prova", "Avaliação / Prova")
                        : ev.type === "trabalho"
                        ? t("agenda.tipo_trabalho", "Entrega de Trabalho")
                        : t("agenda.tipo_reuniao", "Reunião / Monitoria")}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--app-primary)]">
                      {ev.date} • {t("agenda.horario", { start: ev.startTime, end: ev.endTime, defaultValue: `${ev.startTime} às ${ev.endTime}` })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--app-text)]">{ev.title}</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    {ev.courseName} • {t("agenda.local", { location: ev.locationOrLink, defaultValue: `Local: ${ev.locationOrLink}` })}
                  </p>
                </div>

                {ev.locationOrLink?.includes("Virtual") && (
                  <button
                    type="button"
                    onClick={onNavigateToStudyRoom}
                    className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{t("agenda.entrar_sala_virtual", "Acessar Chamada")}</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaTab;
