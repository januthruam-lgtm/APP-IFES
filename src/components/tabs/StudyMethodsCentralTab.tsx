import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Brain,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { UserProfile, CourseTrack } from "../../types";
import confetti from "canvas-confetti";

interface StudyMethodsCentralTabProps {
  user: UserProfile;
  courses?: CourseTrack[];
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (amount: number) => void;
  onNavigateToTab?: (tabId: string) => void;
  onNavigateToFlashcards?: () => void;
  onOpenSocraticWithTopic?: (topic: string) => void;
}

export const StudyMethodsCentralTab: React.FC<StudyMethodsCentralTabProps> = ({
  user,
  onRewardXp,
  onNavigateToTab,
}) => {
  // Pomodoro State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((s) => s - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isRunning) {
      setIsRunning(false);
      if (mode === "focus") {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onRewardXp) onRewardXp(50);
        setMode("break");
        setPomodoroSeconds(5 * 60);
      } else {
        setMode("focus");
        setPomodoroSeconds(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, pomodoroSeconds, mode, onRewardXp]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setPomodoroSeconds(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Feynman State
  const [feynmanTopic, setFeynmanTopic] = useState("");
  const [feynmanExplanation, setFeynmanExplanation] = useState("");
  const [feynmanSubmitted, setFeynmanSubmitted] = useState(false);

  const handleFeynmanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feynmanTopic.trim() || !feynmanExplanation.trim()) return;
    setFeynmanSubmitted(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    if (onRewardXp) onRewardXp(35);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[var(--app-text)]">Central de Métodos Científicos de Estudo</h2>
          <p className="text-xs text-[var(--app-text-muted)]">
            Ferramentas validadas pela neurociência: Pomodoro de Hiperfoco, Método Feynman e Recordação Ativa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: Pomodoro Timer */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 text-center">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">
              {mode === "focus" ? "Modo Hiperfoco (25 min)" : "Pausa Regenerativa (5 min)"}
            </span>
            <h3 className="text-base font-bold text-[var(--app-text)] mt-2">Temporizador Pomodoro IFES</h3>
          </div>

          <div className="text-6xl sm:text-7xl font-mono font-black text-[var(--app-text)] tracking-wider">
            {timeFormatted}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleTimer}
              className="px-6 py-3 rounded-2xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? "Pausar" : "Iniciar Foco"}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
              title="Reiniciar timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Method 2: Feynman Technique */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20">
              Método Feynman
            </span>
            <h3 className="text-base font-bold text-[var(--app-text)] mt-2">
              Explicação em Linguagem Simples
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">
              Se você não consegue explicar para uma criança de 10 anos, você ainda não dominou o conceito.
            </p>
          </div>

          {!feynmanSubmitted ? (
            <form onSubmit={handleFeynmanSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={feynmanTopic}
                onChange={(e) => setFeynmanTopic(e.target.value)}
                placeholder="Conceito a explicar (ex: Recursividade, Divisão de Trabalho)..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none"
              />

              <textarea
                rows={4}
                required
                value={feynmanExplanation}
                onChange={(e) => setFeynmanExplanation(e.target.value)}
                placeholder="Explique com analogias cotidianas sem jargões complexos..."
                className="w-full p-3 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none resize-none"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold transition cursor-pointer"
              >
                Validar Compreensão (+35 XP)
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Excelente exercício de simplificação!
              </p>
              <p className="text-[11px]">
                Você traduziu com clareza o tema <b>{feynmanTopic}</b>.
              </p>
              <button
                onClick={() => {
                  setFeynmanSubmitted(false);
                  setFeynmanTopic("");
                  setFeynmanExplanation("");
                }}
                className="mt-2 text-[11px] font-bold text-[var(--app-primary)] hover:underline cursor-pointer block"
              >
                Explicar outro conceito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
