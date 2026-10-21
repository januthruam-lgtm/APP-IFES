import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Gamepad2,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Upload,
} from "lucide-react";
import { UserProfile, QuizQuestion } from "../../types";
import confetti from "canvas-confetti";
import FileQuizGeneratorModal from "../quiz/FileQuizGeneratorModal";

interface PdfGameGeneratorTabProps {
  user: UserProfile;
  initialDeckId?: string | null;
  onRewardXp?: (xp: number) => void;
  onConsumeEnergy?: (amount: number) => boolean;
  onNavigateToStore?: () => void;
}

export const PdfGameGeneratorTab: React.FC<PdfGameGeneratorTabProps> = ({
  user,
  initialDeckId,
  onRewardXp,
  onConsumeEnergy,
  onNavigateToStore,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [topicName, setTopicName] = useState("Teorias da Administração & Taylorismo");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: "q-1",
      question: "Qual foi o principal objetivo do Taylorismo no início do século XX?",
      options: [
        "Aumentar a produtividade operacional eliminando o desperdício de tempo e movimentos.",
        "Desenvolver planos de previdência privada para operários fabris.",
        "Automatizar totalmente as indústrias sem interferência operária.",
        "Substituir o trabalho assalariado por cooperativas sem hierarquia.",
      ],
      correctIndex: 0,
      explanation: "Taylor utilizou métodos científicos para cronometrar movimentos e maximizar a eficiência fabril.",
      xpReward: 30,
    },
    {
      id: "q-2",
      question: "Na Teoria Clássica de Henri Fayol, qual função administrativa refere-se ao alinhamento de esforços?",
      options: [
        "Coordenação",
        "Previsão",
        "Contabilidade",
        "Segurança",
      ],
      correctIndex: 0,
      explanation: "A Coordenação liga, une e harmoniza todos os atos e todos os esforços coletivos da organização.",
      xpReward: 30,
    },
    {
      id: "q-3",
      question: "No contexto da gestão moderna, qual benefício central a filosofia Kaizen promove?",
      options: [
        "Melhoria contínua e gradual envolvendo todos os colaboradores.",
        "Mudanças radicais e pontuais que descartam toda a cultura existente.",
        "Eliminação completa de qualquer documentação de processos.",
        "Subordinação aos fornecedores sem análise de qualidade.",
      ],
      correctIndex: 0,
      explanation: "Kaizen significa 'mudar para melhor', preconizando aperfeiçoamento constante do dia a dia.",
      xpReward: 35,
    },
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = quizQuestions[currentQuestionIndex];

  const handleGenerateGame = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicName,
          documentText: inputText,
          questionCount: 4,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizQuestions(data.questions);
          setCurrentQuestionIndex(0);
          setSelectedOption(null);
          setIsAnswered(false);
          setScore(0);
          setGameOver(false);
        }
      }
    } catch (err) {
      console.warn("Erro ao gerar quiz por texto:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      if (onRewardXp) onRewardXp(currentQ.xpReward || 30);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameOver(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setGameOver(false);
  };

  const handleQuizGeneratedFromFile = (quizData: { title: string; questions: any[] }) => {
    if (quizData.questions && quizData.questions.length > 0) {
      setTopicName(quizData.title);
      setQuizQuestions(quizData.questions.map((q, idx) => ({
        id: q.id || `file-q-${idx}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        xpReward: 35,
      })));
      handleRestart();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">
              {t("simulados.titulo", "Simulados Rápidos & Gerador por PDF")}
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              {t("simulados.subtitulo", "Questões oficiais do IFES e geração sob medida para testar seus conhecimentos")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFileModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-sm hover:opacity-95 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>{t("simulados.gerar_do_arquivo", "Gerar Quiz de Arquivo")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Text Form */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--app-text-muted)] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[var(--app-primary)]" />
            Fonte do Conteúdo
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-text)]">Tema ou Disciplina</label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none focus:ring-1 focus:ring-[var(--app-primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-text)]">
              Cole o texto de uma apostila, resumo ou anotações
            </label>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui o conteúdo extraído do PDF, slides do professor ou resumo de aula..."
              className="w-full p-3 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none focus:ring-1 focus:ring-[var(--app-primary)] resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateGame}
            disabled={!inputText.trim() || isGenerating}
            className="w-full py-3 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Gerando Desafios com IA..." : "Gerar Quiz Interativo"}</span>
          </button>
        </div>

        {/* Game Play Arena */}
        <div className="lg:col-span-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          {!gameOver ? (
            <>
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
                <span className="text-xs font-mono font-bold text-[var(--app-text-muted)]">
                  {t("simulados.questao_de", { current: currentQuestionIndex + 1, total: quizQuestions.length, defaultValue: `Questão ${currentQuestionIndex + 1} de ${quizQuestions.length}` })}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-500">
                    Acertos: {score}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--app-bg)] border border-[var(--app-border)] text-[10px] font-bold text-[var(--app-text)]">
                    +{currentQ?.xpReward || 30} XP
                  </span>
                </div>
              </div>

              {/* Question Body */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-[var(--app-text)] leading-snug">
                  {currentQ?.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ?.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    const isCorrect = oIdx === currentQ.correctIndex;
                    let style =
                      "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] hover:border-[var(--app-primary)]";

                    if (isAnswered) {
                      if (isCorrect) {
                        style = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                      } else if (isSelected) {
                        style = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold";
                      } else {
                        style = "border-[var(--app-border)] opacity-40";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-start gap-3 cursor-pointer ${style}`}
                      >
                        <span className="w-5 h-5 rounded-lg border border-[var(--app-border)] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {isAnswered && (
                  <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-1 animate-in fade-in">
                    <p className="font-bold text-[var(--app-text)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Explicação Socrática:
                    </p>
                    <p>{currentQ?.explanation}</p>
                  </div>
                )}
              </div>

              {/* Footer navigation */}
              <div className="flex justify-end pt-4 border-t border-[var(--app-border)]">
                {isAnswered && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex + 1 < quizQuestions.length
                        ? t("simulados.proxima_questao", "Próxima Questão")
                        : t("simulados.ver_gabarito", "Ver Resultado")}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[var(--app-text)]">
                {t("simulados.tempo_esgotado", "Desafio Concluído!")}
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] max-w-sm mx-auto">
                {t("simulados.pontuacao", { score, total: quizQuestions.length, defaultValue: `Você acertou ${score} de ${quizQuestions.length} questões.` })}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t("simulados.iniciar_quiz", "Jogar Novamente")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <FileQuizGeneratorModal
        user={user}
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onQuizGenerated={handleQuizGeneratedFromFile}
        onOpenPaywall={onNavigateToStore}
      />
    </div>
  );
};

export default PdfGameGeneratorTab;
