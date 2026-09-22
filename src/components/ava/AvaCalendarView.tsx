import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  HelpCircle,
} from "lucide-react";
import { IfesAssignment } from "../../types";

interface AvaCalendarViewProps {
  assignments: IfesAssignment[];
  onOpenSubmitModal: (assignment: IfesAssignment) => void;
}

export const AvaCalendarView: React.FC<AvaCalendarViewProps> = ({
  assignments,
  onOpenSubmitModal,
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);

  const currentDate = new Date();
  const displayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + selectedMonthOffset, 1);
  const monthName = displayDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Header */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center border border-[var(--app-primary)]/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--app-text)] capitalize">{monthName}</h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              Calendário Acadêmico Oficial e Prazos do AVA IFES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
            className="p-2 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl transition border border-[var(--app-border)] cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedMonthOffset(0)}
            className="px-3 py-1.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl transition border border-[var(--app-border)] cursor-pointer"
          >
            Hoje
          </button>
          <button
            onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
            className="p-2 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl transition border border-[var(--app-border)] cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events List for the Month */}
      <div className="space-y-3">
        {sortedAssignments.length === 0 ? (
          <div className="p-8 text-center bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[var(--app-success)] mx-auto" />
            <p className="text-sm font-bold text-[var(--app-text)]">Nenhum evento no calendário para este período</p>
            <p className="text-xs text-[var(--app-text-muted)]">Todas as entregas e provas foram concluídas ou ainda não foram agendadas pelos docentes.</p>
          </div>
        ) : (
          sortedAssignments.map((assign) => {
            const dueDate = new Date(assign.dueDate);
            const isDueSoon = assign.status === "urgent" || dueDate.getTime() - Date.now() < 3 * 86400 * 1000;
            const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={assign.id}
                className={`bg-[var(--app-card)] border rounded-2xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDueSoon ? "border-red-500/30 bg-red-950/10" : "border-[var(--app-border)] hover:border-[var(--app-primary)]/30"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="text-center bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl px-3 py-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block font-mono">
                      {dueDate.toLocaleDateString("pt-BR", { month: "short" })}
                    </span>
                    <span className="text-xl font-black text-[var(--app-text)] font-mono block">
                      {dueDate.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-[var(--app-primary)] uppercase tracking-wider">
                        {assign.courseName}
                      </span>
                      {isDueSoon ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Prazo Iminente ({diffDays}d)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] border border-[var(--app-border)] rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--app-text-muted)]" /> Vence em {diffDays}d
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[var(--app-text)]">{assign.title}</h4>
                    <p className="text-[11px] text-[var(--app-text-muted)] font-mono">
                      Horário limite: {dueDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onOpenSubmitModal(assign)}
                    className="px-3.5 py-1.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Entregar no AVA</span>
                  </button>
                  {assign.link && (
                    <a
                      href={assign.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl transition border border-[var(--app-border)]"
                      title="Abrir no Moodle original"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
