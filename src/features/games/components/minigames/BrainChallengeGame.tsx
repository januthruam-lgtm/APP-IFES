import React, { useState, useEffect } from "react";
import {
  Puzzle,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface BrainChallengeGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

interface LogicStage {
  id: number;
  type: "sequence" | "pattern_memory" | "symbol_logic";
  title: string;
  instruction: string;
  question: string;
  options: (string | number)[];
  correctAnswer: string | number;
  explanation: string;
}

const BRAIN_STAGES: LogicStage[] = [
  {
    id: 1,
    type: "sequence",
    title: "Sequência Fibonacciana",
    instruction: "Descubra o próximo número da sequência lógica:",
    question: "2, 3, 5, 8, 13, 21, ?",
    options: [28, 31, 34, 37],
    correctAnswer: 34,
    explanation: "Cada termo é a soma dos dois anteriores: 13 + 21 = 34.",
  },
  {
    id: 2,
    type: "sequence",
    title: "Progressão Geométrica Alternada",
    instruction: "Qual número completa a lacuna lógica?",
    question: "3, 6, 12, 24, 48, ?",
    options: [64, 72, 84, 96],
    correctAnswer: 96,
    explanation: "Cada número é multiplicado por 2: 48 × 2 = 96.",
  },
  {
    id: 3,
    type: "symbol_logic",
    title: "Equação de Símbolos",
    instruction: "Descubra o valor do símbolo final:",
    question: "🟢 + 🟢 = 20  |  🟢 × 🔷 = 40  |  🔷 + 🔷 = ?",
    options: [4, 8, 12, 16],
    correctAnswer: 8,
    explanation: "🟢 = 10, logo 10 × 🔷 = 40 => 🔷 = 4. Então 4 + 4 = 8.",
  },
  {
    id: 4,
    type: "sequence",
    title: "Quadrados dos Números Primos",
    instruction: "Identifique o próximo elemento da série especial:",
    question: "4, 9, 25, 49, 121, ?",
    options: [144, 169, 196, 225],
    correctAnswer: 169,
    explanation: "Quadrados dos primos (2², 3², 5², 7², 11²). O próximo primo é 13 => 13² = 169.",
  },
  {
    id: 5,
    type: "symbol_logic",
    title: "Dedução Lógica de Conjuntos",
    instruction: "Se todo Estudante IFES é Dedicado, e alguns Dedicados são Cientistas:",
    question: "Podemos afirmar com certeza que:",
    options: [
      "Todo Cientista é Estudante IFES",
      "Pelo menos um Estudante IFES pode ser Cientista",
      "Nenhum Estudante IFES é Cientista",
      "Todos os Estudantes IFES são Cientistas",
    ],
    correctAnswer: "Pelo menos um Estudante IFES pode ser Cientista",
    explanation: "A interseção lógica permite a possibilidade concreta de estudantes IFES serem cientistas.",
  },
];

export const BrainChallengeGame: React.FC<BrainChallengeGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  // Matriz de Memória Visual interativa para o desafio especial
  const [patternMatrix, setPatternMatrix] = useState<number[]>([1, 4, 7]);
  const [patternActive, setPatternActive] = useState<boolean>(false);
  const [userClickedCells, setUserClickedCells] = useState<number[]>([]);

  const stage = BRAIN_STAGES[currentStageIdx];

  const handleSelectOption = (opt: string | number) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === stage.correctAnswer) {
      gameAudio.playCorrect();
      setScore((prev) => prev + 100);
    } else {
      gameAudio.playWrong();
    }
  };

  const handleNextStage = () => {
    gameAudio.playClick();
    if (currentStageIdx + 1 < BRAIN_STAGES.length) {
      setCurrentStageIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      gameAudio.playVictory();
      onFinishGame({
        sessionToken,
        gameId: "brain_challenge",
        score,
        phasesCompleted: BRAIN_STAGES.length,
        extraNote: `Desafios de lógica concluídos (${score} pts)`,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-bold">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Brain Challenge</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 12 • Raciocínio Lógico & Padrões</span>
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

      {/* Progresso das Fases */}
      <div className="px-6 py-3 border-b border-[var(--app-border)] bg-[var(--app-bg)]/40 flex items-center justify-between text-xs">
        <span className="font-bold text-[var(--app-text)]">
          Fase {currentStageIdx + 1} de {BRAIN_STAGES.length}
        </span>
        <span className="font-mono font-black text-emerald-500">
          Pontuação: {score}
        </span>
      </div>

      {!isFinished ? (
        <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold">
                {stage.title}
              </span>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">{stage.instruction}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)] text-center">
              <h4 className="text-lg sm:text-xl font-black font-mono text-[var(--app-text)]">
                {stage.question}
              </h4>
            </div>
          </div>

          {/* Opções */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stage.options.map((opt, idx) => {
              let btnClass = "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-emerald-500 text-[var(--app-text)]";
              if (isAnswered) {
                if (opt === stage.correctAnswer) {
                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold";
                } else if (opt === selectedOption) {
                  btnClass = "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400";
                } else {
                  btnClass = "opacity-40 border-[var(--app-border)] text-[var(--app-text-muted)]";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border text-sm font-semibold text-center transition cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback & Próxima */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3 animate-fade-in">
              <p className="text-xs text-[var(--app-text-muted)]">
                <strong className="text-[var(--app-text)]">Lógica da resposta: </strong>
                {stage.explanation}
              </p>
              <button
                onClick={handleNextStage}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{currentStageIdx + 1 < BRAIN_STAGES.length ? "Próximo Desafio" : "Ver Resultados"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-black text-[var(--app-text)]">Bateria Neural Concluída!</h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Você superou todos os desafios de lógica e sequências numéricas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] max-w-xs mx-auto">
            <span className="text-xs text-[var(--app-text-muted)] uppercase block">Pontos Totais</span>
            <span className="text-2xl font-black font-mono text-emerald-500">{score}</span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentStageIdx(0);
                setScore(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setIsFinished(false);
              }}
              className="px-4 py-2.5 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
            >
              Jogar Novamente
            </button>
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              Voltar ao Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
