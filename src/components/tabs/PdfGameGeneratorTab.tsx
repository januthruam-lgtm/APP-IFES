import React, { useState } from "react";
import {
  Gamepad2,
  Zap,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { UserProfile } from "../../types";
import confetti from "canvas-confetti";

interface PdfGameGeneratorTabProps {
  user: UserProfile;
  initialDeckId?: string | null;
  onRewardXp: (xp: number) => void;
  onConsumeEnergy: (amount: number) => boolean;
  onNavigateToStore: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    question: "Qual é a principal vantagem de uma árvore binária de busca equilibrada (ex: AVL) sobre uma lista encadeada simples?",
    options: [
      "Menor consumo de memória por ponteiro",
      "Busca em tempo O(log n) em vez de O(n)",
      "Capacidade de armazenar strings arbitrariamente longas sem overhead",
      "Não requer alocação dinâmica de memória",
    ],
    correctIndex: 1,
    explanation: "Em árvores binárias balanceadas, a altura é mantida em O(log n), garantindo operações eficientes de busca e inserção.",
  },
  {
    question: "Na derivação de funções compostas pela Regra da Cadeia, a derivada de f(g(x)) é dada por:",
    options: [
      "f'(x) * g'(x)",
      "f'(g(x)) * g'(x)",
      "f'(g'(x))",
      "f(x) * g'(x) + f'(x) * g(x)",
    ],
    correctIndex: 1,
    explanation: "A Regra da Cadeia estabelece que a taxa de variação da composta é o produto da derivada externa avaliada na interna pela derivada da função interna.",
  },
  {
    question: "Qual protocolo da camada de transporte fornece transmissão rápida sem garantia de confirmação de entrega (não confiável)?",
    options: ["TCP", "UDP", "HTTP", "BGP"],
    correctIndex: 1,
    explanation: "UDP é orientado a datagramas sem overhead de handshake, muito utilizado em streaming ao vivo e jogos online.",
  },
];

export const PdfGameGeneratorTab: React.FC<PdfGameGeneratorTabProps> = ({
  user,
  onRewardXp,
  onConsumeEnergy,
  onNavigateToStore,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [noEnergyWarning, setNoEnergyWarning] = useState(false);

  const currentQ = SAMPLE_QUESTIONS[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    if (user.energy <= 0) {
      setNoEnergyWarning(true);
      return;
    }

    // Consume 1 energy
    const success = onConsumeEnergy(1);
    if (!success) {
      setNoEnergyWarning(true);
      return;
    }

    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
      confetti({ particleCount: 30, spread: 60 });
      onRewardXp(20);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < SAMPLE_QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameOver(true);
      confetti({ particleCount: 60, spread: 80 });
      onRewardXp(50);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setGameOver(false);
    setNoEnergyWarning(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Quiz Acadêmico Gamificado</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary,#f8fafc)]">
            Desafio Relâmpago de Conteúdo
          </h1>
          <p className="text-xs text-[var(--text-muted,#94a3b8)]">
            Responda questões para fixar o aprendizado e subir no ranking da guilda
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-[var(--text-primary,#f8fafc)]">
              {user.energy}/{user.maxEnergy} Energia
            </span>
          </div>
        </div>
      </div>

      {noEnergyWarning && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Sua energia acabou! Descanse ou compre uma poção de recarga na loja.</span>
          </div>
          <button
            onClick={onNavigateToStore}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 flex items-center gap-1.5 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ir para Loja</span>
          </button>
        </div>
      )}

      {gameOver ? (
        <div className="p-8 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-2xl text-center space-y-6">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[var(--text-primary,#f8fafc)]">
              Desafio Concluído!
            </h2>
            <p className="text-sm text-[var(--text-muted,#94a3b8)]">
              Você acertou <strong className="text-emerald-400">{score}</strong> de {SAMPLE_QUESTIONS.length} questões!
            </p>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-2">
              +70 XP Total Concedido
            </span>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-[var(--btn-primary,#6366f1)] hover:bg-[var(--btn-primary-hover,#4f46e5)] text-white font-bold text-xs flex items-center gap-2 transition shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted,#94a3b8)]">
            <span>Questão {currentQuestionIndex + 1} de {SAMPLE_QUESTIONS.length}</span>
            <span>Pontuação: {score}</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary,#f8fafc)] leading-relaxed">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "bg-[var(--bg-card-secondary,#334155)] border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-primary,#f8fafc)] hover:opacity-90";
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                } else if (idx === selectedOption) {
                  btnClass = "bg-rose-500/20 border-rose-500 text-rose-300";
                } else {
                  btnClass = "opacity-40 bg-neutral-800 border-white/5";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-4 cursor-pointer ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-xs text-[var(--text-muted,#94a3b8)] leading-relaxed">
                <strong className="text-[var(--text-primary,#f8fafc)] block mb-1">Explicação do Conceito:</strong>
                {currentQ.explanation}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--btn-primary,#6366f1)] hover:bg-[var(--btn-primary-hover,#4f46e5)] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <span>Próxima Questão</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
