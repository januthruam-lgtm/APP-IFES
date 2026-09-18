import React from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Layers,
  Award,
  Users,
  Video,
  DownloadCloud,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { CourseTrack, TrackModule, UserProfile } from "../../types";

interface SequenceTrackTabProps {
  modules: TrackModule[];
  user: UserProfile;
  courses: CourseTrack[];
  currentCourse?: CourseTrack;
  onSelectCourse: (course: CourseTrack) => void;
  onOpenLesson: (mod: TrackModule) => void;
  onOpenDeck: (deckId: string) => void;
  onOpenOfflineModal: () => void;
  onResetCourses: () => void;
  onDeleteCourse: (courseId: string) => void;
  onStartCallWithMember?: (member: any, isVideo: boolean) => void;
  onStartGroupCallWithCourse?: () => void;
  onRewardXp: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

export const SequenceTrackTab: React.FC<SequenceTrackTabProps> = ({
  modules,
  user,
  courses,
  currentCourse,
  onSelectCourse,
  onOpenLesson,
  onOpenDeck,
  onOpenOfflineModal,
  onResetCourses,
  onDeleteCourse,
  onStartGroupCallWithCourse,
  onRewardXp,
}) => {
  const activeCourse = currentCourse || courses[0];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header with Course Selector */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-3.5 h-3.5" />
              Trilha de Aprendizado Sequencial
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary,#f8fafc)]">
              {activeCourse?.title || "Disciplina do Curso"}
            </h1>
            <p className="text-xs text-[var(--text-muted,#94a3b8)]">
              {activeCourse?.code ? `Código: ${activeCourse.code} • ` : ""}
              Avance nos módulos em ordem didática para desbloquear novos níveis
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenOfflineModal}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-primary,#f8fafc)] hover:opacity-80 flex items-center gap-1.5 transition"
              title="Baixar para uso sem internet"
            >
              <DownloadCloud className="w-4 h-4 text-emerald-400" />
              <span>Cache Offline</span>
            </button>

            {onStartGroupCallWithCourse && (
              <button
                onClick={onStartGroupCallWithCourse}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 flex items-center gap-1.5 transition"
              >
                <Video className="w-4 h-4" />
                <span>Sala da Turma</span>
              </button>
            )}
          </div>
        </div>

        {/* Select Course Dropdown */}
        {courses.length > 1 && (
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-[var(--text-muted,#94a3b8)] shrink-0 font-medium">Trocar Disciplina:</span>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCourse(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeCourse?.id === c.id
                    ? "bg-[var(--btn-primary,#6366f1)] text-white shadow-md"
                    : "bg-[var(--bg-card-secondary,#334155)] text-[var(--text-muted,#94a3b8)] hover:text-white"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modules Roadmap */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-center space-y-3">
            <BookOpen className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-[var(--text-primary,#f8fafc)]">
              Nenhum módulo registrado nesta disciplina
            </h3>
            <p className="text-xs text-[var(--text-muted,#94a3b8)] max-w-md mx-auto">
              Sincronize com o AVA IFES ou Q-Acadêmico na aba correspondente para carregar o plano de ensino oficial.
            </p>
          </div>
        ) : (
          modules.map((mod, index) => {
            const isCompleted = mod.completed;
            const isCurrent = !isCompleted && (index === 0 || modules[index - 1]?.completed);
            const isLocked = !isCompleted && !isCurrent;

            return (
              <div
                key={mod.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? "bg-[var(--bg-card,#1e293b)] border-emerald-500/30"
                    : isCurrent
                    ? "bg-[var(--bg-card,#1e293b)] border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/30"
                    : "bg-[var(--bg-card,#1e293b)]/50 border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isCurrent
                        ? "bg-indigo-600 text-white shadow-md animate-pulse"
                        : "bg-neutral-800 text-neutral-500 border border-white/5"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-[var(--text-primary,#f8fafc)] truncate">
                        {mod.title}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          MÓDULO ATUAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted,#94a3b8)] line-clamp-2">
                      {mod.summary || mod.description || "Conceitos fundamentais e exercícios práticos."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    disabled={isLocked}
                    onClick={() => onOpenLesson(mod)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                      isCompleted
                        ? "bg-[var(--bg-card-secondary,#334155)] text-[var(--text-primary,#f8fafc)] hover:opacity-80"
                        : isCurrent
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isCompleted ? "Revisar Aula" : "Estudar Módulo"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
