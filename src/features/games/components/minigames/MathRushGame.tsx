import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface MathRushGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

interface MathProblem {
  equation: string;
  options: number[];
  correctAnswer: number;
  type: "Aritmética" | "Equação" | "Porcentagem" | "Função" | "Financeira";
}

export const MathRushGame: React.FC<MathRushGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [gameState, setGameState] = useState<"LOBBY" | "PLAYING" | "SUMMARY">("LOBBY");
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [highestCombo, setHighestCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalProblems, setTotalProblems] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30s base
  const [timeNotification, setTimeNotification] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  const timerRef = useRef<any>(null);

  // Gerador dinâmico de problemas matemáticos
  const generateProblem = (difficultyLevel: number): MathProblem => {
    const types: MathProblem["type"][] = ["Aritmética", "Equação", "Porcentagem", "Função", "Financeira"];
    const chosenType = types[Math.floor(Math.random() * Math.min(types.length, 2 + Math.floor(difficultyLevel / 3)))];

    let equation = "";
    let correctAnswer = 0;

    if (chosenType === "Aritmética") {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 15) + 3;
      const op = Math.random() > 0.5 ? "+" : Math.random() > 0.3 ? "-" : "×";
      if (op === "+") {
        equation = `${a} + ${b} = ?`;
        correctAnswer = a + b;
      } else if (op === "-") {
        equation = `${a + b} - ${b} = ?`;
        correctAnswer = a;
      } else {
        const x = Math.floor(Math.random() * 9) + 2;
        const y = Math.floor(Math.random() * 9) + 2;
        equation = `${x} × ${y} = ?`;
        correctAnswer = x * y;
      }
    } else if (chosenType === "Equação") {
      const x = Math.floor(Math.random() * 10) + 1;
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 15) + 2;
      const result = a * x + b;
      equation = `${a}x + ${b} = ${result}. Quanto vale x?`;
      correctAnswer = x;
    } else if (chosenType === "Porcentagem") {
      const base = (Math.floor(Math.random() * 8) + 1) * 50; // 50, 100, 150...
      const percent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
      equation = `Quanto é ${percent}% de ${base}?`;
      correctAnswer = (percent / 100) * base;
    } else if (chosenType === "Função") {
      const a = Math.floor(Math.random() * 4) + 2;
      const b = Math.floor(Math.random() * 6) + 1;
      const x = Math.floor(Math.random() * 5) + 1;
      equation = `Se f(x) = ${a}x - ${b}, quanto é f(${x})?`;
      correctAnswer = a * x - b;
    } else {
      // Financeira (Juros Simples)
      const c = 200;
      const t = Math.floor(Math.random() * 3) + 1; // 1 a 3 meses
      const juros = c * 0.05 * t;
      equation = `Capital de R$ ${c} a 5% a.m. por ${t} ${t === 1 ? "mês" : "meses"}. Qual o juro simples?`;
      correctAnswer = Math.round(juros);
    }

    // Gera 3 opções falsas próximas
    const optionsSet = new Set<number>([correctAnswer]);
    while (optionsSet.size < 4) {
      const delta = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = correctAnswer + delta;
      if (fake >= 0) optionsSet.add(fake);
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return { equation, options, correctAnswer, type: chosenType };
  };

  const handleStartGame = () => {
    gameAudio.playClick();
    setScore(0);
    setCombo(0);
    setHighestCombo(0);
    setCorrectCount(0);
    setTotalProblems(0);
    setTimeLeft(30);
    setCurrentProblem(generateProblem(1));
    setGameState("PLAYING");
  };

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleTimeOut = () => {
    gameAudio.playVictory();
    setGameState("SUMMARY");

    onFinishGame({
      sessionToken,
      gameId: "math_rush",
      score,
      highestStreak: highestCombo,
      accuracyPercent: totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0,
      extraNote: `Rush: ${correctCount} acertos, Maior combo: x${(1 + highestCombo * 0.2).toFixed(1)}`,
    });
  };

  const triggerTimeBanner = (msg: string) => {
    setTimeNotification(msg);
    setTimeout(() => setTimeNotification(null), 800);
  };

  const handleSelectAnswer = (ans: number) => {
    if (!currentProblem || gameState !== "PLAYING") return;

    setTotalProblems((prev) => prev + 1);

    if (ans === currentProblem.correctAnswer) {
      // Acerto
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > highestCombo) setHighestCombo(newCombo);

      const multiplier = Math.min(3.0, 1 + newCombo * 0.2);
      const points = Math.round(50 * multiplier);
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);

      // Bônus de tempo: +3 segundos
      setTimeLeft((prev) => Math.min(60, prev + 3));
      triggerTimeBanner("+3s!");

      if (newCombo % 4 === 0) {
        gameAudio.playStreakBonus();
      } else {
        gameAudio.playCorrect();
      }
    } else {
      // Erro
      setCombo(0);
      setTimeLeft((prev) => Math.max(0, prev - 4));
      triggerTimeBanner("-4s");
      gameAudio.playWrong();
    }

    // Próximo problema dinâmico
    setCurrentProblem(generateProblem(correctCount + 1));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Math Rush</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 8 • Matemática Contra o Tempo</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = gameAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]/50 transition cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onExit}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>

      {/* LOBBY */}
      {gameState === "LOBBY" && (
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-xl font-black text-[var(--app-text)]">Velocidade & Precisão</h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Você começa com 30 segundos. Cada acerto concede <strong>+3s de bônus</strong> e eleva seu multiplicador de combo. Erros penalizam seu tempo em 4s!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-amber-500 font-bold uppercase block">Operações</span>
              <span className="text-xs font-bold text-[var(--app-text)]">Aritmética & Equações</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-emerald-500 font-bold uppercase block">Finanças</span>
              <span className="text-xs font-bold text-[var(--app-text)]">Porcentagem & Juros</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full max-w-sm mx-auto py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm tracking-wide shadow-md transition transform active:scale-95 cursor-pointer block"
          >
            Começar Math Rush
          </button>
        </div>
      )}

      {/* PLAYING */}
      {gameState === "PLAYING" && currentProblem && (
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
          {/* Top Bar com Timer e Combo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--app-text-muted)]">Pontos:</span>
              <span className="text-lg font-mono font-black text-amber-500">{score}</span>
            </div>

            <div className="flex items-center gap-2 relative">
              <div
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono font-black text-sm transition-all ${
                  timeLeft <= 7 ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-amber-500/15 text-amber-500"
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
              {timeNotification && (
                <span
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 font-black text-xs animate-bounce ${
                    timeNotification.includes("+") ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {timeNotification}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase block">Multiplicador</span>
              <div className="flex items-center gap-1 font-mono font-black text-xs text-orange-500">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>x{(1 + combo * 0.2).toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Problema Atual */}
          <div className="p-6 rounded-3xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)] text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] text-[10px] uppercase font-bold text-[var(--app-text-muted)] tracking-wider inline-block">
              {currentProblem.type}
            </span>
            <h4 className="text-xl sm:text-2xl font-black font-mono text-[var(--app-text)] tracking-tight">
              {currentProblem.equation}
            </h4>
          </div>

          {/* 4 Alternativas de Resposta */}
          <div className="grid grid-cols-2 gap-3">
            {currentProblem.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(opt)}
                className="py-4 rounded-2xl bg-[var(--app-card-secondary)] hover:bg-amber-500/10 border border-[var(--app-border)] hover:border-amber-500 text-[var(--app-text)] font-mono font-black text-lg transition transform active:scale-95 cursor-pointer shadow-xs"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {gameState === "SUMMARY" && (
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-black text-[var(--app-text)]">Tempo Esgotado!</h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Você resolveu {correctCount} cálculos com precisão de{" "}
              {totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0}%
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider block">Pontos</span>
              <span className="text-lg font-black font-mono text-amber-500">{score}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider block">Maior Combo</span>
              <span className="text-lg font-black font-mono text-orange-500">x{(1 + highestCombo * 0.2).toFixed(1)}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider block">Recompensas</span>
              <span className="text-xs font-mono font-black text-emerald-500 block mt-1">
                🪙 +{Math.min(75, Math.floor(score / 15))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleStartGame}
              className="py-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:bg-[var(--app-border)]/50 text-[var(--app-text)] font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Jogar Novamente</span>
            </button>
            <button
              onClick={onExit}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
            >
              Voltar ao Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
