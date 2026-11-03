import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Timer,
  Zap,
  Award,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { QUIZ_QUESTIONS, QuizQuestion } from "../../data/quizQuestions";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";
import {
  getEnrolledAcademicCourses,
  getTopicsForSubject,
  recordStudentPerformance,
  getStudentWeaknessesLocal,
} from "../../services/avaGameContentService";
import {
  generateUnprecedentedQuizQuestions,
  generateSmartReviewQuiz,
  saveQuizQuestionToHistory,
  QuizIaQuestion,
  QuizDifficultyLevel,
} from "../../services/quizIaService";

interface QuizBattleGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  initialCourse?: string;
  initialTopic?: string;
  initialReviewMode?: boolean;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

export const QuizBattleGame: React.FC<QuizBattleGameProps> = ({
  userId,
  userName,
  sessionToken,
  initialCourse,
  initialTopic,
  initialReviewMode = false,
  onFinishGame,
  onExit,
}) => {
  const enrolledCourses = getEnrolledAcademicCourses();
  const defaultCategory = initialCourse || (enrolledCourses[0]?.name ?? "Teoria Geral da Administração II");

  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficultyLevel>("Intermediária");
  const [isReviewMode, setIsReviewMode] = useState<boolean>(initialReviewMode);
  const [mode, setMode] = useState<"ai" | "classic">("ai");
  const [vsBotMode, setVsBotMode] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  // Game state
  const [gameState, setGameState] = useState<"LOBBY" | "PLAYING" | "SUMMARY">("LOBBY");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isLoadingIa, setIsLoadingIa] = useState<boolean>(false);
  const [iaError, setIaError] = useState<string | null>(null);

  // Scores & metrics
  const [userScore, setUserScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  const timerRef = useRef<any>(null);

  // Tópicos disponíveis para a disciplina selecionada
  const availableTopics = getTopicsForSubject(selectedCategory);

  // Pontos fracos registrados para o estudante
  const studentWeaknesses = getStudentWeaknessesLocal(userId);

  const handleStartGame = async (forceReview = isReviewMode) => {
    gameAudio.playClick();
    setIaError(null);

    if (mode === "ai") {
      setIsLoadingIa(true);

      let res: { success: boolean; questions: QuizIaQuestion[]; error?: string };

      if (forceReview) {
        res = await generateSmartReviewQuiz({
          userId,
          count: 5,
        });
      } else {
        res = await generateUnprecedentedQuizQuestions({
          userId,
          subject: selectedCategory,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          count: 5,
          isReviewMode: false,
        });
      }

      setIsLoadingIa(false);

      if (!res.success || !res.questions || res.questions.length === 0) {
        setIaError(res.error || "Não foi possível gerar novas perguntas com a IA no momento.");
        return;
      }

      const mapped: QuizQuestion[] = res.questions.map((q) => ({
        id: q.id,
        category: (q.category || selectedCategory) as any,
        difficulty:
          selectedDifficulty === "Fácil"
            ? "facil"
            : selectedDifficulty === "Intermediária" || selectedDifficulty === "Médio"
            ? "medio"
            : "dificil",
        question: q.question,
        options: (q.options.length >= 4
          ? [q.options[0], q.options[1], q.options[2], q.options[3]]
          : [q.options[0] || "A", q.options[1] || "B", q.options[2] || "C", q.options[3] || "D"]) as [
          string,
          string,
          string,
          string
        ],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }));

      // Registrar a primeira pergunta no histórico
      saveQuizQuestionToHistory(userId, res.questions[0]).catch(() => {});

      setQuestions(mapped);
    } else {
      let filtered = [...QUIZ_QUESTIONS];
      if (selectedCategory) {
        filtered = filtered.filter((q) => q.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      }
      if (filtered.length === 0) filtered = [...QUIZ_QUESTIONS];
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 5);
      setQuestions(shuffled);
    }

    setCurrentIndex(0);
    setUserScore(0);
    setBotScore(0);
    setCurrentStreak(0);
    setHighestStreak(0);
    setCorrectAnswersCount(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setTimeLeft(20);
    setGameState("PLAYING");
  };

  // Timer da pergunta
  useEffect(() => {
    if (gameState !== "PLAYING" || isAnswerRevealed) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex, isAnswerRevealed]);

  const handleTimeExpired = () => {
    if (isAnswerRevealed) return;
    setIsAnswerRevealed(true);
    setSelectedAnswer(-1); // Nenhuma selecionada
    setCurrentStreak(0);
    gameAudio.playWrong();

    const currentQ = questions[currentIndex];
    if (currentQ) {
      recordStudentPerformance(
        userId,
        currentQ.category,
        (currentQ as any).topic || selectedTopic || "Conceito Geral",
        currentQ.question,
        false,
        currentQ.explanation
      ).catch(() => {});
    }

    // Bot tem chance de acertar
    if (vsBotMode) {
      if (Math.random() > 0.35) {
        setBotScore((prev) => prev + 50);
      }
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    clearInterval(timerRef.current);

    setSelectedAnswer(idx);
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.correctIndex;

    // Registra desempenho para revisão inteligente de pontos fracos
    recordStudentPerformance(
      userId,
      currentQ.category,
      (currentQ as any).topic || selectedTopic || "Conceito Geral",
      currentQ.question,
      isCorrect,
      currentQ.explanation
    ).catch(() => {});

    if (isCorrect) {
      const streakBonus = Math.min(2.0, 1 + currentStreak * 0.2);
      const points = Math.round((50 + timeLeft * 3) * streakBonus);
      setUserScore((prev) => prev + points);
      setCorrectAnswersCount((prev) => prev + 1);

      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      if (newStreak >= 3) {
        gameAudio.playStreakBonus();
      } else {
        gameAudio.playCorrect();
      }
    } else {
      setCurrentStreak(0);
      gameAudio.playWrong();
    }

    // Bot simula resposta
    if (vsBotMode) {
      const botAcc = currentQ.difficulty === "facil" ? 0.8 : currentQ.difficulty === "medio" ? 0.65 : 0.5;
      if (Math.random() < botAcc) {
        setBotScore((prev) => prev + Math.round(50 + Math.random() * 30));
      }
    }
  };

  const handleNextQuestion = () => {
    gameAudio.playClick();
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setTimeLeft(20);
      // Persistir no histórico para prevenção de repetição
      if (questions[nextIdx]) {
        saveQuizQuestionToHistory(userId, questions[nextIdx] as any).catch(() => {});
      }
    } else {
      handleFinishMatch();
    }
  };

  const handleFinishMatch = () => {
    clearInterval(timerRef.current);
    setGameState("SUMMARY");
    gameAudio.playVictory();

    const acc = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;
    onFinishGame({
      sessionToken,
      gameId: "quiz_battle",
      score: userScore,
      accuracyPercent: acc,
      highestStreak,
      extraNote: vsBotMode ? `Contra Lumina Bot (${userScore} vs ${botScore})` : "Modo Individual",
    });
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Top Header do Jogo */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight flex items-center gap-2">
              Quiz Battle
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                IA Inédita
              </span>
            </h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 1 • Batalha Acadêmica com Prevenção de Repetição</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = gameAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]/50 transition cursor-pointer"
            title={isAudioMuted ? "Ativar som" : "Desativar som"}
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

      {/* LOBBY / SETUP */}
      {gameState === "LOBBY" && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Base Curricular Real do AVA IFES</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight">
              Batalha de Conhecimento com IA
            </h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Desafios gerados dinamicamente a partir das suas matérias matriculadas e planos de aula, com proteção ativa contra repetição de perguntas.
            </p>
          </div>

          {/* BANNER DO MODO DE REVISÃO INTELIGENTE */}
          {studentWeaknesses.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center font-black shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Modo Revisão Inteligente
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                      {studentWeaknesses.length} pendência{studentWeaknesses.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                    Reforce tópicos onde você errou: <strong className="text-[var(--app-text)]">{studentWeaknesses[0]?.topic}</strong> em {studentWeaknesses[0]?.subject}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleStartGame(true)}
                disabled={isLoadingIa}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs tracking-wide shadow-md transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Revisar Erros Agora</span>
              </button>
            </div>
          )}

          {/* Erro de geração da IA */}
          {iaError && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Aviso de Conexão com a IA</span>
              </div>
              <p>{iaError}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleStartGame()}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-white font-bold cursor-pointer hover:bg-amber-600 transition"
                >
                  Tentar Novamente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("classic");
                    setIaError(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-[var(--app-card)] border border-[var(--app-border)] font-semibold cursor-pointer hover:bg-[var(--app-card-secondary)] transition"
                >
                  Usar Modo Clássico Offline
                </button>
              </div>
            </div>
          )}

          {/* Modo de Geração */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)]">
            <button
              type="button"
              onClick={() => {
                setMode("ai");
                setIsReviewMode(false);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "ai" && !isReviewMode
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perguntas Inéditas (AVA IFES)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("classic");
                setIsReviewMode(false);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "classic"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Banco Clássico</span>
            </button>
          </div>

          {/* 1. SELEÇÃO DA DISCIPLINA MATRICULADA */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">
                Disciplinas Matriculadas ({enrolledCourses.length})
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Sincronizadas com o AVA
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {enrolledCourses.map((c) => {
                const isSelected = selectedCategory === c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setSelectedTopic(""); // Reseta o tópico ao trocar de disciplina
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                        : "bg-[var(--app-card-secondary)]/50 text-[var(--app-text)] border-[var(--app-border)] hover:border-blue-500/50"
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold tracking-wider ${isSelected ? "text-blue-100" : "text-[var(--app-text-muted)]"}`}>
                      {c.code || "IFES"}
                    </span>
                    <span className="text-xs font-bold mt-1 line-clamp-2">
                      {c.name}
                    </span>
                    <span className={`text-[10px] mt-2 ${isSelected ? "text-blue-200" : "text-[var(--app-text-muted)]"}`}>
                      Prof: {c.professor || "Corpo Docente"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SELEÇÃO DO ASSUNTO / TÓPICO ESPECÍFICO */}
          {availableTopics.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">
                Tópico Curricular de {selectedCategory}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedTopic("")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    selectedTopic === ""
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-[var(--app-card-secondary)]/50 text-[var(--app-text)] border-[var(--app-border)] hover:border-blue-500/50"
                  }`}
                >
                  Todos os tópicos da matéria
                </button>
                {availableTopics.map((top) => (
                  <button
                    key={top}
                    type="button"
                    onClick={() => setSelectedTopic(top)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      selectedTopic === top
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-[var(--app-card-secondary)]/50 text-[var(--app-text)] border-[var(--app-border)] hover:border-blue-500/50"
                    }`}
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. DIFICULDADE PROGRESSIVA */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">
              Nível de Dificuldade
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Fácil", "Intermediária", "Difícil", "Avançada"] as const).map((dif) => (
                <button
                  key={dif}
                  type="button"
                  onClick={() => setSelectedDifficulty(dif)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    selectedDifficulty === dif
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-[var(--app-card-secondary)]/50 text-[var(--app-text)] border-[var(--app-border)] hover:border-indigo-500/50"
                  }`}
                >
                  {dif}
                </button>
              ))}
            </div>
          </div>

          {/* 4. OPONENTE BOT */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-[var(--app-text)]">Desafiar Lumina Bot IFES</p>
                <p className="text-xs text-[var(--app-text-muted)]">Um colega virtual responde em tempo real com você</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVsBotMode(!vsBotMode)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                vsBotMode ? "bg-blue-600" : "bg-[var(--app-border)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  vsBotMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleStartGame(false)}
            disabled={isLoadingIa}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-black text-sm tracking-wide shadow-lg transition transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoadingIa ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando perguntas inéditas de {selectedCategory}...</span>
              </>
            ) : (
              <>
                <span>Iniciar Partida de Conhecimento</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* PARTIDA ATIVA */}
      {gameState === "PLAYING" && currentQ && (
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
          {/* Placar & Cronômetro */}
          <div className="flex items-center justify-between gap-4">
            {/* Usuário */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--app-text)] truncate max-w-[100px]">{userName}</p>
                <p className="text-xs font-mono font-black text-blue-500">{userScore} pts</p>
              </div>
            </div>

            {/* Cronômetro Central */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black transition-colors ${
                  timeLeft <= 5 ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-blue-500/10 text-blue-500"
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                Questão {currentIndex + 1} de {questions.length}
              </span>
            </div>

            {/* Bot Oponente (se ativo) */}
            {vsBotMode ? (
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-xs font-bold text-[var(--app-text)]">Lumina Bot</p>
                  <p className="text-xs font-mono font-black text-purple-500">{botScore} pts</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-[10px] text-[var(--app-text-muted)] block">Combo</span>
                <span className="text-xs font-black font-mono text-amber-500">x{(1 + currentStreak * 0.2).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Barra de Tempo */}
          <div className="w-full bg-[var(--app-border)] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 5 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>

          {/* Card da Pergunta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--app-text-muted)]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                  {currentQ.category}
                </span>
                {(currentQ as any).topic && (
                  <span className="px-2 py-0.5 rounded-md bg-[var(--app-card-secondary)] border border-[var(--app-border)] font-semibold text-[11px]">
                    {(currentQ as any).topic}
                  </span>
                )}
                {isReviewMode && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                    Revisão de Ponto Fraco
                  </span>
                )}
              </div>
              <span className="uppercase tracking-wider font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
                {currentQ.difficulty}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[var(--app-text)] leading-relaxed">
              {currentQ.question}
            </h4>
          </div>

          {/* Alternativas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt: string, idx: number) => {
              let btnClass = "bg-[var(--app-card-secondary)]/60 border-[var(--app-border)] hover:border-blue-500/50 text-[var(--app-text)]";

              if (isAnswerRevealed) {
                if (idx === currentQ.correctIndex) {
                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30";
                } else if (idx === selectedAnswer) {
                  btnClass = "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400";
                } else {
                  btnClass = "opacity-40 border-[var(--app-border)] text-[var(--app-text-muted)]";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerRevealed}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between gap-3 ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[var(--app-border)]/60 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswerRevealed && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {isAnswerRevealed && idx === selectedAnswer && idx !== currentQ.correctIndex && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Próxima com Justificativa Pedagógica do IFES */}
          {isAnswerRevealed && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 via-[var(--app-card-secondary)] to-transparent border border-blue-500/30 space-y-3 animate-fade-in shadow-sm">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-[var(--app-text)] font-black text-xs uppercase tracking-wider">
                      Fundamentação Pedagógica IFES
                    </strong>
                    <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                      {currentQ.category}
                    </span>
                  </div>
                  <p className="leading-relaxed text-[var(--app-text-muted)]">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{currentIndex + 1 < questions.length ? "Próxima Questão" : "Ver Desempenho Final"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY / FIM DE JOGO */}
      {gameState === "SUMMARY" && (
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-black text-[var(--app-text)]">
              {vsBotMode && userScore > botScore
                ? "Vitória Conquistada!"
                : vsBotMode && userScore === botScore
                ? "Empate Disputado!"
                : vsBotMode
                ? "Partida Concluída!"
                : "Quiz Finalizado!"}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              {correctAnswersCount} acertos de {questions.length} questões ({Math.round((correctAnswersCount / questions.length) * 100)}% de precisão)
            </p>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider block">Pontuação</span>
              <span className="text-lg font-black font-mono text-blue-500">{userScore}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider block">Maior Streak</span>
              <span className="text-lg font-black font-mono text-amber-500">+{highestStreak}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider block">Recompensas</span>
              <div className="flex items-center justify-center gap-1 font-mono text-xs font-black text-emerald-500 mt-1">
                <span>🪙 +{Math.min(60, Math.floor(userScore / 15))}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleStartGame()}
              className="py-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:bg-[var(--app-border)]/50 text-[var(--app-text)] font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Jogar Novamente</span>
            </button>
            <button
              onClick={onExit}
              className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Voltar à Central de Jogos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
