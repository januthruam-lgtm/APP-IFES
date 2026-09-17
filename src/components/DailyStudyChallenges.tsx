import React, { useState, useEffect } from "react";
import {
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Brain,
  Zap,
  Check,
  Gift,
  HelpCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TabId } from "./Sidebar";
import { UserProfile } from "../types";

export interface DailyChallengeItem {
  id: string;
  title: string;
  description: string;
  category: "reading" | "quiz" | "tutor" | "flashcards" | "tasks";
  iconEmoji: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
  coinsReward: number;
  actionTab?: TabId;
  actionLabel?: string;
}

interface DailyStudyChallengesProps {
  user: UserProfile;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onNavigate?: (tab: TabId) => void;
}

const DEFAULT_CHALLENGES: DailyChallengeItem[] = [
  {
    id: "read-pages",
    title: "Ler 5 páginas de material acadêmico",
    description: "Leia o PDF, ementa ou anotações da sua disciplina ativa.",
    category: "reading",
    iconEmoji: "📖",
    targetCount: 5,
    currentCount: 0,
    completed: false,
    xpReward: 25,
    coinsReward: 10,
    actionTab: "sequence",
    actionLabel: "Abrir Trilha",
  },
  {
    id: "solve-quiz",
    title: "Resolver 1 Quiz Socrático",
    description: "Teste seus conhecimentos nas rodadas rápidas com energia.",
    category: "quiz",
    iconEmoji: "🧠",
    targetCount: 1,
    currentCount: 0,
    completed: false,
    xpReward: 30,
    coinsReward: 15,
    actionTab: "games",
    actionLabel: "Fazer Quiz",
  },
  {
    id: "ask-tutor",
    title: "Tirar 1 dúvida com o Tutor Socrático",
    description: "Faça uma pergunta sobre conceitos difíceis ou resolva um exercício.",
    category: "tutor",
    iconEmoji: "💬",
    targetCount: 1,
    currentCount: 0,
    completed: false,
    xpReward: 20,
    coinsReward: 10,
    actionTab: "lumina",
    actionLabel: "Abrir Tutor",
  },
  {
    id: "review-flashcards",
    title: "Revisar 3 conceitos ou flashcards",
    description: "Pratique memorização ativa com o repositório ou cartões de estudo.",
    category: "flashcards",
    iconEmoji: "⚡",
    targetCount: 3,
    currentCount: 0,
    completed: false,
    xpReward: 20,
    coinsReward: 10,
    actionTab: "library",
    actionLabel: "Ver Biblioteca",
  },
  {
    id: "check-ava",
    title: "Planejar ou entregar 1 atividade do AVA",
    description: "Consulte seus prazos no painel ou marque uma tarefa como entregue.",
    category: "tasks",
    iconEmoji: "📝",
    targetCount: 1,
    currentCount: 0,
    completed: false,
    xpReward: 35,
    coinsReward: 20,
    actionTab: "dashboard",
    actionLabel: "Ver Prazos",
  },
];

const STORAGE_KEY = "ifes_daily_study_challenges_v1";

export const DailyStudyChallenges: React.FC<DailyStudyChallengesProps> = ({
  user,
  onRewardXp,
  onRewardCoins,
  onNavigate,
}) => {
  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const [challenges, setChallenges] = useState<DailyChallengeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === getTodayDateString() && Array.isArray(parsed.challenges)) {
          return parsed.challenges;
        }
      }
    } catch {}
    return DEFAULT_CHALLENGES;
  });

  const [claimedBonus, setClaimedBonus] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === getTodayDateString()) {
          return !!parsed.claimedBonus;
        }
      }
    } catch {}
    return false;
  });

  // Save to LocalStorage whenever challenges or bonus claim change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: getTodayDateString(),
          challenges,
          claimedBonus,
        })
      );
    } catch (e) {
      console.warn("Error saving daily challenges to localStorage:", e);
    }
  }, [challenges, claimedBonus]);

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Complete or increment a challenge
  const handleProgressChallenge = (id: string, increment: number = 1) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id !== id) return ch;
        if (ch.completed) return ch;

        const newCount = Math.min(ch.targetCount, ch.currentCount + increment);
        const isNowCompleted = newCount >= ch.targetCount;

        if (isNowCompleted && !ch.completed) {
          // Trigger rewards
          if (onRewardXp) onRewardXp(ch.xpReward);
          if (onRewardCoins) onRewardCoins(ch.coinsReward);

          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        return {
          ...ch,
          currentCount: newCount,
          completed: isNowCompleted,
        };
      })
    );
  };

  // Claim all-completed daily bonus
  const handleClaimDailyBonus = () => {
    if (claimedBonus || !allCompleted) return;

    setClaimedBonus(true);
    if (onRewardXp) onRewardXp(50);
    if (onRewardCoins) onRewardCoins(25);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // Reset challenges manually (for testing or re-run)
  const handleResetDay = () => {
    if (confirm("Deseja reiniciar os desafios diários de hoje para praticar novamente?")) {
      setChallenges(DEFAULT_CHALLENGES);
      setClaimedBonus(false);
    }
  };

  // 7-day week streak calculation
  const weekDays = [
    { label: "Seg", key: "mon" },
    { label: "Ter", key: "tue" },
    { label: "Qua", key: "wed" },
    { label: "Qui", key: "thu" },
    { label: "Sex", key: "fri" },
    { label: "Sáb", key: "sat" },
    { label: "Dom", key: "sun" },
  ];

  // Current day index (0 = Monday in ISO logic)
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs relative overflow-hidden">
      {/* Header & Streak Tracker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--app-border)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--app-text)] flex items-center gap-2">
                Desafios Diários de Estudo
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  {completedCount}/{totalCount} Concluídos
                </span>
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Metas rápidas diárias para impulsionar sua consistência acadêmica e alimentar seu mascote.
              </p>
            </div>
          </div>
        </div>

        {/* Streak & Consistency Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-2xl">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
                Ofensiva de Estudo
              </div>
              <div className="text-xs font-black text-amber-700 font-mono">
                {user.streakDays || 1} {user.streakDays === 1 ? "Dia" : "Dias Seguidos"}
              </div>
            </div>
          </div>

          <button
            onClick={handleResetDay}
            className="p-2.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)] border border-transparent hover:border-[var(--app-border)] rounded-2xl transition cursor-pointer"
            title="Reiniciar desafios diários"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Consistency Week Strip */}
      <div className="bg-[var(--app-bg)] border border-[var(--app-border)] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--app-text)] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Histórico Semanal de Consistência
          </span>
          <span className="text-[11px] font-mono text-[var(--app-primary)] font-bold">
            {progressPercent}% da Meta de Hoje
          </span>
        </div>

        {/* Week Days Progress Bubbles */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((day, idx) => {
            const isToday = idx === currentDayIndex;
            const isPast = idx < currentDayIndex;
            const isFuture = idx > currentDayIndex;
            const isCompletedPast = isPast; // Past days in streak are marked as accomplished
            const isTodayDone = isToday && allCompleted;

            return (
              <div
                key={day.key}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                  isToday
                    ? "bg-[var(--app-card)] border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/20 shadow-xs"
                    : isCompletedPast
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                    : "bg-[var(--app-card)] border-[var(--app-border)] opacity-60"
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase text-[var(--app-text-muted)]">
                  {day.label}
                </span>
                <div className="my-1">
                  {isToday ? (
                    isTodayDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--app-primary)] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-primary)] animate-ping" />
                      </div>
                    )
                  ) : isCompletedPast ? (
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[var(--app-text-muted)] opacity-40" />
                  )}
                </div>
                <span className="text-[9px] font-mono font-bold">
                  {isToday ? (isTodayDone ? "100%" : `${progressPercent}%`) : isCompletedPast ? "✓" : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-[var(--app-card)] h-2 rounded-full overflow-hidden border border-[var(--app-border)]">
          <div
            className="bg-gradient-to-r from-[var(--app-primary)] to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {challenges.map((challenge) => {
          const isDone = challenge.completed;
          const isIncremental = challenge.targetCount > 1;

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDone
                  ? "bg-[var(--app-bg)]/60 border-[var(--app-border)] opacity-75"
                  : "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 shadow-xs"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0 p-2 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  {challenge.iconEmoji}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-xs sm:text-sm font-extrabold ${
                        isDone ? "line-through text-[var(--app-text-muted)]" : "text-[var(--app-text)]"
                      }`}
                    >
                      {challenge.title}
                    </h4>
                    {isDone ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Concluído
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                        {challenge.currentCount}/{challenge.targetCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1">
                    {challenge.description}
                  </p>

                  {/* Reward Tags */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> +{challenge.xpReward} XP
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      🪙 +{challenge.coinsReward} Moedas
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--app-border)]">
                {challenge.actionTab && onNavigate && !isDone && (
                  <button
                    onClick={() => onNavigate(challenge.actionTab!)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-[var(--app-text)] bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{challenge.actionLabel || "Ir"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {isIncremental && !isDone && (
                  <button
                    onClick={() => handleProgressChallenge(challenge.id, 1)}
                    className="px-3.5 py-2 bg-[var(--app-primary)]/15 hover:bg-[var(--app-primary)]/25 text-[var(--app-primary)] text-xs font-extrabold rounded-xl transition border border-[var(--app-primary)]/30 cursor-pointer"
                  >
                    +1 Feito
                  </button>
                )}

                {!isDone ? (
                  <button
                    onClick={() => handleProgressChallenge(challenge.id, challenge.targetCount)}
                    className="px-4 py-2 bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Concluir</span>
                  </button>
                ) : (
                  <div className="text-emerald-600 font-extrabold text-xs flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Feito
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Consistency Bonus Box (When All Completed) */}
      {allCompleted && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border-2 border-amber-400/40 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="text-3xl p-2 rounded-2xl bg-amber-400/20 border border-amber-400/30">
                🎁
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-1.5 justify-center sm:justify-start">
                  Bônus de Consistência Diária Desbloqueado!
                </h4>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Você completou todos os 5 desafios de hoje! Resgate seu prêmio diário especial.
                </p>
              </div>
            </div>

            {claimedBonus ? (
              <span className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 text-white shadow-xs flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Bônus Resgatado (+50 XP / +25 🪙)
              </span>
            ) : (
              <button
                onClick={handleClaimDailyBonus}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-500/25 animate-bounce cursor-pointer flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>Resgatar Bônus (+50 XP / +25 🪙)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
