import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Download,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";

interface AgendaTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onNavigateToStudyRoom: () => void;
}

interface ScheduleSlot {
  id: string;
  day: string;
  time: string;
  courseTitle: string;
  room: string;
  instructor: string;
}

const WEEKLY_SCHEDULE: ScheduleSlot[] = [
  { id: "s1", day: "Segunda", time: "07:30 - 09:10", courseTitle: "Algoritmos e Estruturas de Dados", room: "Lab Informática 03", instructor: "Prof. Marcos Silva" },
  { id: "s2", day: "Segunda", time: "09:25 - 11:05", courseTitle: "Cálculo Diferencial e Integral", room: "Sala 204 - Bloco B", instructor: "Profa. Cláudia Rocha" },
  { id: "s3", day: "Terça", time: "07:30 - 09:10", courseTitle: "Redes de Computadores", room: "Lab Redes 01", instructor: "Prof. André Martins" },
  { id: "s4", day: "Quarta", time: "07:30 - 10:15", courseTitle: "Banco de Dados I", room: "Lab Informática 02", instructor: "Profa. Renata Nunes" },
  { id: "s5", day: "Quinta", time: "09:25 - 11:55", courseTitle: "Sistemas Operacionais", room: "Sala 102 - Bloco A", instructor: "Prof. Fábio Lima" },
];

export const AgendaTab: React.FC<AgendaTabProps> = ({
  user,
  courses,
  onNavigateToStudyRoom,
}) => {
  const [selectedDay, setSelectedDay] = useState("Todos");

  const days = ["Todos", "Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const filtered = selectedDay === "Todos"
    ? WEEKLY_SCHEDULE
    : WEEKLY_SCHEDULE.filter((s) => s.day === selectedDay);

  const handleExportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//IFES BrainStudio//PT\n";
    WEEKLY_SCHEDULE.forEach((slot) => {
      icsContent += `BEGIN:VEVENT\nSUMMARY:${slot.courseTitle}\nDESCRIPTION:Sala: ${slot.room} - Docente: ${slot.instructor}\nLOCATION:${slot.room}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "horarios_ifes.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda & Grade Semanal de Aulas</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--app-text)]">
            Horários & Encontros IFES
          </h1>
          <p className="text-xs text-[var(--app-text-muted)]">
            Consulte horários de salas presenciais e organize suas sessões de estudo
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportICS}
            className="px-4 py-2.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text)] hover:opacity-80 text-xs font-bold flex items-center gap-2 transition"
            title="Exportar calendário para Google Agenda / Outlook"
          >
            <Download className="w-4 h-4 text-[var(--app-primary)]" />
            <span>Exportar .ICS</span>
          </button>

          <button
            onClick={onNavigateToStudyRoom}
            className="px-4 py-2.5 rounded-2xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold flex items-center gap-2 transition shadow-xs"
          >
            <Video className="w-4 h-4" />
            <span>Sala de Estudos</span>
          </button>
        </div>
      </div>

      {/* Day Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedDay === d
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Schedule slots */}
      <div className="space-y-3">
        {filtered.map((slot) => (
          <div
            key={slot.id}
            className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs hover:border-[var(--app-primary)]/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--app-primary)]/15 text-[var(--app-primary)]">
                  {slot.day}
                </span>
                <span className="text-xs font-semibold text-[var(--app-text-muted)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {slot.time}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-[var(--app-text)] truncate">
                {slot.courseTitle}
              </h4>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--app-text-muted)]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {slot.room}
                </span>
                <span>• {slot.instructor}</span>
              </div>
            </div>

            <button
              onClick={onNavigateToStudyRoom}
              className="px-4 py-2 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-primary)] hover:text-white text-[var(--app-text)] text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-center"
            >
              <span>Abrir Sessão</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
