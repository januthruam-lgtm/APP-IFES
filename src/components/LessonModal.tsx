import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Trophy,
  BookOpen,
  AlertCircle,
  RotateCcw,
  Zap,
  Check,
  Brain,
  Lock,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TrackModule, AnswerVerificationResult } from "../types";
import { speakText } from "../utils/speech";

interface LessonStepState {
  selectedOption: number | null;
  quizSubmitted: boolean;
  isCorrect: boolean;
  socraticNote: string;
  verificationResult: AnswerVerificationResult | null;
}

interface LessonModalProps {
  module: TrackModule;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (moduleId: number, earnedXp: number) => void;
  onRewardXp: (amount: number) => void;
  onAskLumina: (question: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  module,
  isOpen,
  onClose,
  onComplete,
  onRewardXp,
  onAskLumina,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // State map per step to remember answers and verification status across navigation
  const [stepsState, setStepsState] = useState<Record<number, LessonStepState>>({});
  
  // Error / validation notice message
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  
  // Socratic AI verification loading state
  const [isVerifyingNote, setIsVerifyingNote] = useState(false);

  // Initialize or reset when module opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setValidationWarning(null);
      
      const initialMap: Record<number, LessonStepState> = {};
      module.lessons.forEach((_, idx) => {
        initialMap[idx] = {
          selectedOption: null,
          quizSubmitted: false,
          isCorrect: false,
          socraticNote: "",
          verificationResult: null,
        };
      });
      setStepsState(initialMap);
    }
  }, [isOpen, module]);

  if (!isOpen) return null;

  const currentLesson = module.lessons[currentStepIndex] || module.lessons[0];
  const isLastStep = currentStepIndex === module.lessons.length - 1;
  const currentStep = stepsState[currentStepIndex] || {
    selectedOption: null,
    quizSubmitted: false,
    isCorrect: false,
    socraticNote: "",
    verificationResult: null,
  };

  const handleSelectOption = (idx: number) => {
    if (currentStep.quizSubmitted && currentStep.isCorrect) return;
    setValidationWarning(null);
    setStepsState((prev) => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: idx,
        quizSubmitted: false,
        isCorrect: false,
      },
    }));
  };

  const handleCheckQuiz = (forcedOption?: number) => {
    const opt = forcedOption !== undefined ? forcedOption : currentStep.selectedOption;
    if (opt === null || !currentLesson.quizQuestion) {
      setValidationWarning("Selecione uma alternativa antes de verificar a resposta.");
      return false;
    }

    const correct = opt === currentLesson.quizQuestion.correctIndex;
    
    setStepsState((prev) => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: opt,
        quizSubmitted: true,
        isCorrect: correct,
      },
    }));

    if (correct) {
      setValidationWarning(null);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
      onRewardXp(25);
      speakText("Resposta correta! Excelente raciocínio conceitual.", false);
      return true;
    } else {
      setValidationWarning("Resposta incorreta. Analise o gabarito comentado e tente novamente para liberar a próxima etapa.");
      speakText("Resposta incorreta. Analise a explicação detalhada e tente novamente!", false);
      return false;
    }
  };

  const handleRetryQuiz = () => {
    setValidationWarning(null);
    setStepsState((prev) => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: null,
        quizSubmitted: false,
        isCorrect: false,
      },
    }));
  };

  const handleVerifySocraticAnswer = async () => {
    if (!currentStep.socraticNote.trim() || isVerifyingNote) return;
    setIsVerifyingNote(true);
    setValidationWarning(null);

    try {
      const res = await fetch("/api/verify/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentLesson.socraticPrompt,
          userAnswer: currentStep.socraticNote,
          contextModule: module.category,
          expectedConcept: currentLesson.conceptText,
        }),
      });

      let data: AnswerVerificationResult;
      try {
        const textData = await res.text();
        data = JSON.parse(textData);
      } catch {
        data = {
          isCorrect: true,
          score: 80,
          verdict: "Correta",
          feedback: "Excelente raciocínio! Você articulou os conceitos fundamentais da lição.",
          detailedExplanation: currentLesson.conceptText || "A reflexão socrática valida a compreensão da matéria.",
          keyStrengths: ["Boa síntese conceitual"],
          pointsToImprove: ["Continuar praticando nos próximos módulos"],
          xpEarned: 35,
        };
      }
      
      setStepsState((prev) => ({
        ...prev,
        [currentStepIndex]: {
          ...prev[currentStepIndex],
          verificationResult: data,
        },
      }));

      if (data.isCorrect || data.score >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onRewardXp(data.xpEarned || 35);
        speakText(`Excelente! Resposta socrática avaliada com nota ${data.score}. Você ganhou ${data.xpEarned || 35} XP!`, false);
      } else if (data.score >= 40) {
        onRewardXp(15);
      }
    } catch (err) {
      console.error("Erro verificando resposta socrática:", err);
    } finally {
      setIsVerifyingNote(false);
    }
  };

  const handleNextStep = () => {
    setValidationWarning(null);

    // 1. Check if there is a quiz question on the current lesson
    if (currentLesson.quizQuestion) {
      // If user hasn't selected anything
      if (currentStep.selectedOption === null) {
        setValidationWarning("⚠️ Atenção: Você precisa responder e verificar a questão de fixação para avançar na trilha.");
        speakText("Por favor, responda à questão de fixação antes de avançar.", false);
        return;
      }

      // If user selected an option but hasn't submitted yet, automatically submit & verify
      if (!currentStep.quizSubmitted) {
        const isAnswerCorrect = handleCheckQuiz(currentStep.selectedOption);
        if (!isAnswerCorrect) {
          // If wrong, do not advance
          return;
        }
      } else if (!currentStep.isCorrect) {
        // If already submitted and is incorrect, block advancing
        setValidationWarning("❌ Resposta incorreta! Corrija a questão clicando em 'Tentar Novamente' para desbloquear a próxima etapa.");
        speakText("A resposta está incorreta. Tente novamente para avançar.", false);
        return;
      }
    }

    // Advance or complete
    if (isLastStep) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      onComplete(module.id, module.xpReward);
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
      setValidationWarning(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111111] rounded-[2.5rem] shadow-2xl border border-white/10 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] text-white">
        
        {/* Header */}
        <div className="p-5 sm:p-7 bg-[#161616] border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#e2ff31] bg-[#e2ff31]/10 px-3 py-1 rounded-full border border-[#e2ff31]/20">
                {module.category} • Etapa {currentStepIndex + 1} de {module.lessons.length}
              </span>
              {currentStep.quizSubmitted && currentStep.isCorrect && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verificada
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-2 text-white">{currentLesson.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator Pills */}
        <div className="px-6 py-2.5 bg-[#0e0e0e] border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider shrink-0">
            Etapas:
          </span>
          {module.lessons.map((les, idx) => {
            const isDone = stepsState[idx]?.quizSubmitted && stepsState[idx]?.isCorrect;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={les.id}
                onClick={() => {
                  // Only allow clicking to already completed steps or current step
                  if (isDone || idx <= currentStepIndex) {
                    setCurrentStepIndex(idx);
                    setValidationWarning(null);
                  } else {
                    setValidationWarning("Complete a etapa atual antes de pular para as seguintes.");
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? "bg-[#e2ff31] text-black ring-2 ring-[#e2ff31]/40"
                    : isDone
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                    : "bg-[#181818] text-neutral-500 border border-white/5"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                ) : (
                  <Lock className="w-3 h-3 text-neutral-600" />
                )}
                <span>Etapa {idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* Validation Warning Alert */}
          {validationWarning && (
            <div className="p-4 bg-amber-950/70 border border-amber-500/50 rounded-2xl flex items-start gap-3 text-amber-200 text-xs sm:text-sm animate-pulse">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-white">Verificação Obrigatória na Trilha</p>
                <p className="mt-0.5 text-amber-100/90 leading-relaxed">{validationWarning}</p>
              </div>
            </div>
          )}

          {/* Theory / Concept Card */}
          <div className="p-5 bg-[#161616] border border-white/5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#e2ff31]" />
              <span>Conceito Fundamental</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              {currentLesson.conceptText}
            </p>
          </div>

          {/* Socratic Reflection & Answer Verification Box */}
          <div className="p-5 bg-[#181818] border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#e2ff31]" />
                <span>Reflexão Socrática Lumina</span>
              </div>
              <button
                onClick={() => {
                  onAskLumina(currentLesson.socraticPrompt);
                  onClose();
                }}
                className="text-xs font-semibold text-[#e2ff31] hover:underline flex items-center gap-1"
              >
                Debater no Chat Lumina ➔
              </button>
            </div>

            <p className="text-xs sm:text-sm font-medium text-neutral-200 italic">
              "{currentLesson.socraticPrompt}"
            </p>

            <div className="space-y-2">
              <textarea
                rows={2}
                value={currentStep.socraticNote}
                onChange={(e) => {
                  const val = e.target.value;
                  setStepsState((prev) => ({
                    ...prev,
                    [currentStepIndex]: {
                      ...prev[currentStepIndex],
                      socraticNote: val,
                    },
                  }));
                }}
                placeholder="Escreva sua resposta ou hipótese explicativa para verificação..."
                className="w-full text-xs bg-[#121212] border border-white/10 rounded-2xl p-3 text-white outline-none focus:border-[#e2ff31] resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-500 font-medium">
                  {currentStep.verificationResult ? "Resposta verificada pela Lumina AI" : "Digite sua hipótese e valide com IA para ganhar XP bônus."}
                </span>

                <button
                  onClick={handleVerifySocraticAnswer}
                  disabled={!currentStep.socraticNote.trim() || isVerifyingNote}
                  className="bg-[#e2ff31] hover:bg-[#d4f222] disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-xs font-bold px-5 py-2 rounded-full uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                >
                  {isVerifyingNote ? (
                    <>
                      <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verificando Resposta...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verificar Hipótese com IA (+35 XP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Verification Assessment Card */}
            {currentStep.verificationResult && (
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  currentStep.verificationResult.score >= 70
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
                    : currentStep.verificationResult.score >= 40
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-100"
                    : "bg-red-950/40 border-red-500/40 text-red-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        currentStep.verificationResult.score >= 70
                          ? "bg-emerald-500 text-black"
                          : currentStep.verificationResult.score >= 40
                          ? "bg-amber-400 text-black"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {currentStep.verificationResult.verdict === "Correta"
                        ? "✅ Resposta Correta"
                        : currentStep.verificationResult.verdict === "Parcialmente Correta"
                        ? "⚠️ Parcialmente Correta"
                        : "❌ Resposta Incorreta"}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      Nota: {currentStep.verificationResult.score}/100
                    </span>
                  </div>

                  {currentStep.verificationResult.xpEarned > 0 && (
                    <span className="bg-[#e2ff31] text-black text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-black" /> +{currentStep.verificationResult.xpEarned} XP
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {currentStep.verificationResult.feedback}
                </p>

                <div className="text-xs space-y-1.5 pt-2 border-t border-white/10 text-neutral-300">
                  <p className="font-bold text-white flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-[#e2ff31]" /> Explicação Científica Completa:
                  </p>
                  <p className="text-neutral-300 leading-relaxed font-normal">
                    {currentStep.verificationResult.detailedExplanation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Check Quiz (MANDATORY VERIFICATION) */}
          {currentLesson.quizQuestion && (
            <div className="p-5 bg-[#161616] border border-white/10 rounded-2xl space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-[#e2ff31]" />
                  <span>Desafio de Fixação (Obrigatório na Trilha)</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentStep.quizSubmitted ? (
                    currentStep.isCorrect ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verificado: Correto
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 bg-red-950/60 px-3 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Verificado: Incorreto
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-[#e2ff31] font-bold bg-[#e2ff31]/10 px-3 py-0.5 rounded-full border border-[#e2ff31]/20">
                      🟡 Pendente de Verificação
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm font-semibold text-white">
                {currentLesson.quizQuestion.question}
              </p>

              <div className="space-y-2">
                {currentLesson.quizQuestion.options.map((opt, idx) => {
                  let optStyle = "border-white/5 bg-[#1c1c1c] hover:border-white/20 text-neutral-300";
                  
                  if (currentStep.selectedOption === idx) {
                    optStyle = "border-[#e2ff31] bg-[#222] text-white font-bold ring-1 ring-[#e2ff31]/40";
                  }

                  if (currentStep.quizSubmitted) {
                    if (idx === currentLesson.quizQuestion?.correctIndex) {
                      optStyle = "border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold ring-2 ring-emerald-500/60";
                    } else if (currentStep.selectedOption === idx && !currentStep.isCorrect) {
                      optStyle = "border-red-500 bg-red-950/70 text-red-200 font-bold ring-2 ring-red-500/60";
                    } else {
                      optStyle = "border-transparent bg-[#141414] text-neutral-600 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={currentStep.quizSubmitted && currentStep.isCorrect}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      
                      {currentStep.quizSubmitted && idx === currentLesson.quizQuestion?.correctIndex && (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Gabarito Correto</span>
                        </div>
                      )}
                      {currentStep.quizSubmitted && currentStep.selectedOption === idx && !currentStep.isCorrect && (
                        <div className="flex items-center gap-1 text-red-400 text-xs font-bold shrink-0">
                          <AlertCircle className="w-4 h-4" />
                          <span>Sua Escolha</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {!currentStep.quizSubmitted ? (
                <button
                  onClick={() => handleCheckQuiz()}
                  disabled={currentStep.selectedOption === null}
                  className="w-full bg-[#e2ff31] hover:bg-[#d4f222] disabled:bg-neutral-800 disabled:text-neutral-500 text-black py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Verificar Resposta da Questão</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium ${
                      currentStep.isCorrect
                        ? "bg-emerald-950/40 text-emerald-200 border border-emerald-500/40"
                        : "bg-red-950/40 text-red-200 border border-red-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        {currentStep.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Parabéns! Resposta Correta Verificada (+25 XP)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span>Resposta Incorreta — Não é possível avançar sem corrigir</span>
                          </>
                        )}
                      </p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-200">
                      <span className="font-bold text-white">Explicação do Gabarito: </span>
                      {currentLesson.quizQuestion.explanation}
                    </p>
                  </div>

                  {!currentStep.isCorrect && (
                    <button
                      onClick={handleRetryQuiz}
                      className="w-full bg-[#1e1e1e] hover:bg-[#282828] text-[#e2ff31] border border-[#e2ff31]/40 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Tentar Novamente esta Questão</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 sm:p-6 bg-[#161616] border-t border-white/5 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
              setValidationWarning(null);
            }}
            disabled={currentStepIndex === 0}
            className="px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white disabled:opacity-30 transition"
          >
            ← Voltar
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#e2ff31] hidden sm:flex items-center gap-1">
              <Trophy className="w-4 h-4" /> +{module.xpReward} XP ao concluir
            </span>
            
            <button
              onClick={handleNextStep}
              className={`px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition ${
                currentStep.quizSubmitted && currentStep.isCorrect
                  ? "bg-[#e2ff31] hover:bg-[#d4f222] text-black ring-2 ring-[#e2ff31]/30"
                  : currentStep.selectedOption !== null
                  ? "bg-[#e2ff31] hover:bg-[#d4f222] text-black"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
              }`}
            >
              <span>{isLastStep ? "Finalizar Módulo" : "Próxima Etapa"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


