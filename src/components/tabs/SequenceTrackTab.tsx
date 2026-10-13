import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Lock,
  CheckCircle2,
  Play,
  Layers,
  Flame,
  ChevronRight,
  Database,
  RotateCcw,
  Trash2,
  Users,
  Video,
  ExternalLink,
} from "lucide-react";
import { UserProfile, TrackModule, CourseTrack } from "../../types";
import { CourseMember } from "../../utils/courseParticipants";
import { CourseWorkspaceView } from "../CourseWorkspaceView";

interface SequenceTrackTabProps {
  modules: TrackModule[];
  user: UserProfile;
  courses: CourseTrack[];
  currentCourse: CourseTrack;
  onSelectCourse: (course: CourseTrack) => void;
  onOpenLesson: (mod: TrackModule) => void;
  onOpenDeck?: (deckId: string) => void;
  onOpenOfflineModal?: () => void;
  onResetCourses?: () => void;
  onDeleteCourse?: (courseId: string) => void;
  onStartCallWithMember?: (member: CourseMember, isVideo: boolean) => void;
  onStartGroupCallWithCourse?: () => void;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onOpenPrivateChatWithMember?: (member: CourseMember) => void;
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
  onStartCallWithMember,
  onStartGroupCallWithCourse,
  onRewardXp,
  onRewardCoins,
  onOpenPrivateChatWithMember,
}) => {
  const [viewingWorkspace, setViewingWorkspace] = useState(false);

  if (viewingWorkspace) {
    return (
      <CourseWorkspaceView
        course={currentCourse}
        user={user}
        modules={modules}
        onBack={() => setViewingWorkspace(false)}
        onRewardXp={onRewardXp || (() => {})}
        onRewardCoins={onRewardCoins}
        onStartCallWithMember={onStartCallWithMember}
        onOpenLesson={onOpenLesson}
        onOpenPrivateChatWithMember={onOpenPrivateChatWithMember}
      />
    );
  }

  const completedCount = modules.filter(
    (m) => m.status === "completed" || user.completedModules.includes(m.id)
  ).length;
  const progressPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Course Header Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentCourse.icon || "📚"}</span>
              <span className="px-3 py-1 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20 text-xs font-black uppercase">
                {currentCourse.category || "Trilha Oficial IFES"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
              {currentCourse.title}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-2xl leading-relaxed">
              {currentCourse.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[var(--app-text-muted)]">Progresso Geral da Trilha</span>
                <span className="text-[var(--app-primary)]">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--app-bg)] rounded-full overflow-hidden border border-[var(--app-border)]">
                <div
                  className="h-full bg-[var(--app-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setViewingWorkspace(true)}
              className="px-4 py-2.5 rounded-2xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Sala de Aula & Tarefas</span>
            </button>

            {onOpenOfflineModal && (
              <button
                onClick={onOpenOfflineModal}
                className="px-4 py-2.5 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Cache Offline</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Courses Switcher Bar */}
      {courses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] shrink-0 pr-2">
            Disciplinas:
          </span>
          {courses.map((c) => {
            const isSelected = c.id === currentCourse.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCourse(c)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <span>{c.icon || "📖"}</span>
                <span className="truncate max-w-[160px]">{c.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Modules Roadmap Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--app-primary)]" />
          Módulos Sequenciais de Aprendizado
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod, index) => {
            const isCompleted = mod.status === "completed" || user.completedModules.includes(mod.id);
            const isLocked = mod.status === "locked" && !isCompleted;
            const isActive = !isCompleted && !isLocked;

            return (
              <div
                key={mod.id}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 bg-[var(--app-card)] shadow-xs ${
                  isActive
                    ? "border-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/30"
                    : isCompleted
                    ? "border-emerald-500/40"
                    : "border-[var(--app-border)] opacity-80"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                      Módulo {index + 1}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" /> Concluído
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                        <Lock className="w-3.5 h-3.5" /> Bloqueado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-[var(--app-primary)]">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Ativo
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[var(--app-text)]">{mod.title}</h4>
                    <p className="text-xs text-[var(--app-text-muted)] mt-1 line-clamp-2">
                      {mod.subtitle || mod.summary}
                    </p>
                  </div>

                  {mod.keyConcepts && mod.keyConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mod.keyConcepts.map((concept, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded-lg text-[10px] bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] font-medium"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--app-border)]">
                  <div className="flex items-center gap-3 text-xs font-semibold text-[var(--app-text-muted)]">
                    <span>⏱️ {mod.estimatedMinutes || 20} min</span>
                    <span>⭐ +{mod.xpReward || 60} XP</span>
                  </div>

                  <button
                    onClick={() => onOpenLesson(mod)}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isCompleted
                        ? "bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)]"
                        : isActive
                        ? "bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white shadow-xs"
                        : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    <span>{isCompleted ? "Revisar Aula" : "Estudar Agora"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
