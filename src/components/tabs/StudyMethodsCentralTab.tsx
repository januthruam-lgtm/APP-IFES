import React, { useState, useEffect } from "react";
import {
  Brain,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";
import confetti from "canvas-confetti";

interface StudyMethodsCentralTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onNavigateToFlashcards: () => void;
  onOpenSocraticWithTopic: (topic: string) => void;
}

export const StudyMethodsCentralTab: React.FC<StudyMethodsCentralTabProps> = ({
  user,
  courses,
  onRewardXp,
  onRewardCoins,
  onNavigateToFlashcards,
  onOpenSocraticWithTopic,
}) => {
  // Pomodoro state
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Feynman state
  const [feynmanTopic, setFeynmanTopic] = useState("");
  const [feynmanExplanation, setFeynmanExplanation] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && pomodoroSeconds === 0) {
      setIsRunning(false);
      confetti({ particleCount: 40, spread: 70 });
      if (!isBreak) {
        onRewardXp(50);
        if (onRewardCoins) onRewardCoins(10);
        setIsBreak(true);
        setPomodoroSeconds(5 * 60);
      } else {
        setIsBreak(false);
        setPomodoroSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroSeconds, isBreak, onRewardXp, onRewardCoins]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setPomodoroSeconds(isBreak ? 5 * 60 : 25 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Brain className="w-3.5 h-3.5" />
          <span>Neurociência do Aprendizado</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary,#f8fafc)]">
          Central de Métodos de Estudo
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted,#94a3b8)]">
          Técnicas com evidência científica comprovada para foco sustentável e retenção máxima
        </p>
      </div>

      {/* Grid: Pomodoro & Feynman */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method 1: Pomodoro */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {isBreak ? "Pausa Restauradora" : "Foco Profundo (25 min)"}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                +50 XP por ciclo
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary,#f8fafc)]">
              Técnica Pomodoro
            </h3>
            <p className="text-xs text-[var(--text-muted,#94a3b8)]">
              Elimine distrações durante 25 minutos e descanse a mente por 5 minutos.
            </p>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-[var(--text-primary,#f8fafc)]">
              {formatTime(pomodoroSeconds)}
            </div>
            <p className="text-xs text-[var(--text-muted,#94a3b8)] mt-2">
              {isRunning ? "Sessão ativa em andamento..." : "Cronômetro pausado"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-[var(--btn-primary,#6366f1)] hover:bg-[var(--btn-primary-hover,#4f46e5)] text-white"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? "Pausar" : "Iniciar Foco"}</span>
            </button>
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-muted,#94a3b8)] hover:text-white transition cursor-pointer"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Method 2: Feynman Technique */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Simplificação & Maestria
            </span>
            <h3 className="text-lg font-bold text-[var(--text-primary,#f8fafc)]">
              Técnica de Feynman
            </h3>
            <p className="text-xs text-[var(--text-muted,#94a3b8)]">
              Explique o conceito complexo como se estivesse ensinando para uma criança de 10 anos.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={feynmanTopic}
              onChange={(e) => setFeynmanTopic(e.target.value)}
              placeholder="Qual conceito você quer explicar? Ex: Recursão..."
              className="w-full bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-xs text-[var(--text-primary,#f8fafc)] placeholder-neutral-500 rounded-xl px-3 py-2.5 focus:outline-none"
            />
            <textarea
              value={feynmanExplanation}
              onChange={(e) => setFeynmanExplanation(e.target.value)}
              placeholder="Explique com palavras simples, analogias e sem jargões desnecessários..."
              className="w-full bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-xs text-[var(--text-primary,#f8fafc)] placeholder-neutral-500 rounded-xl p-3 focus:outline-none h-24 resize-none"
            />
          </div>

          <button
            onClick={() => {
              if (feynmanTopic) {
                onOpenSocraticWithTopic(`Técnica de Feynman: Quero avaliar se minha explicação de ${feynmanTopic} está simples e correta.`);
              }
            }}
            disabled={!feynmanTopic.trim()}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Avaliar Explicação com Lumina IA</span>
          </button>
        </div>
      </div>

      {/* Spaced Repetition Link */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[var(--text-primary,#f8fafc)]">
            Evocação Ativa & Repetição Espaçada
          </h3>
          <p className="text-xs text-[var(--text-muted,#94a3b8)]">
            O cérebro esquece 70% das informações novas em 24h sem revisão espaçada ativa.
          </p>
        </div>

        <button
          onClick={onNavigateToFlashcards}
          className="px-5 py-2.5 rounded-2xl bg-[var(--btn-primary,#6366f1)] hover:bg-[var(--btn-primary-hover,#4f46e5)] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition self-start sm:self-auto cursor-pointer"
        >
          <span>Abrir Baralhos Anki</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
