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

interface QuizBattleGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

export const QuizBattleGame: React.FC<QuizBattleGameProps> = ({
  userName,
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [vsBotMode, setVsBotMode] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  // Game state
  const [gameState, setGameState] = useState<"LOBBY" | "PLAYING" | "SUMMARY">("LOBBY");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  // Scores & metrics
  const [userScore, setUserScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  const timerRef = useRef<any>(null);

  const categories = [
    "Todas",
    "Matemática",
    "Português",
    "História",
    "Geografia",
    "Física",
    "Química",
    "Administração",
    "Economia",
    "Conhecimentos Gerais",
  ];

  const handleStartGame = () => {
    gameAudio.playClick();
    let filtered = [...QUIZ_QUESTIONS];
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }
    // Embaralha as perguntas e seleciona até 10
    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
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
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setTimeLeft(20);
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
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Quiz Battle</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 1 • Batalha Acadêmica</span>
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
          <div className="text-center max-w-md mx-auto space-y-2">
            <h4 className="text-xl font-black text-[var(--app-text)]">Pronto para a Batalha?</h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Responda a 10 perguntas acadêmicas cronometradas. Quanto mais rápido e assertivo, maior seu combo de IF Coins e XP!
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider block">
              Escolha a Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-[var(--app-card-secondary)]/50 text-[var(--app-text)] border-[var(--app-border)] hover:border-blue-500/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-[var(--app-text)]">Desafiar Lumina Bot IFES</p>
                <p className="text-xs text-[var(--app-text-muted)]">Um colega virtual responde em tempo real com você</p>
              </div>
            </div>
            <button
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
            onClick={handleStartGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm tracking-wide shadow-md transition transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Iniciar Partida</span>
            <ChevronRight className="w-4 h-4" />
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
            <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
              <span className="px-2 py-0.5 rounded-md bg-[var(--app-card-secondary)] border border-[var(--app-border)] font-semibold">
                {currentQ.category}
              </span>
              <span className="uppercase tracking-wider font-mono text-[10px]">
                {currentQ.difficulty}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[var(--app-text)] leading-relaxed">
              {currentQ.question}
            </h4>
          </div>

          {/* Alternativas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              let btnClass = "bg-[var(--app-card-secondary)]/60 border-[var(--app-border)] hover:border-blue-500/50 text-[var(--app-text)]";

              if (isAnswerRevealed) {
                if (idx === currentQ.correctIndex) {
                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold";
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

          {/* Feedback & Próxima */}
          {isAnswerRevealed && (
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3 animate-fade-in">
              <div className="flex items-start gap-2 text-xs text-[var(--app-text-muted)]">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed"><strong className="text-[var(--app-text)]">Explicação: </strong>{currentQ.explanation}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{currentIndex + 1 < questions.length ? "Próxima Questão" : "Ver Resultado"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={handleStartGame}
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
