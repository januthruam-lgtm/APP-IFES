import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Lock,
  Play,
  Trophy,
  Target,
  Award,
  History,
  Coins,
  Zap,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Brain,
  BookOpen,
  Puzzle,
  KeyRound,
  Leaf,
  Layers,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  MinigameId,
  MinigameDefinition,
  MINIGAMES_CONFIG,
  GameMatchRecord,
  GameMission,
  GameAchievement,
  GameLeaderboardEntry,
  UserGamesProfile,
} from "../types";
import {
  loadUserGamesProfile,
  startNewGameSession,
  completeGameSession,
  claimMissionReward,
  claimAchievementReward,
  fetchGameLeaderboard,
  getNextGameToUnlock,
  isGameUnlocked,
} from "../services/gamesService";
import { addEventPoints } from "../../events/services/eventService";
import { gameAudio } from "../audio";
import { UserProfile } from "../../../types";

// Minigames
import { QuizBattleGame } from "./minigames/QuizBattleGame";
import { MemoryCardsGame } from "./minigames/MemoryCardsGame";
import { WordMasterGame } from "./minigames/WordMasterGame";
import { MathRushGame } from "./minigames/MathRushGame";
import { BrainChallengeGame } from "./minigames/BrainChallengeGame";
import { CodeBreakerGame } from "./minigames/CodeBreakerGame";
import { EcoChallengeGame } from "./minigames/EcoChallengeGame";
import { BusinessTycoonGame } from "./minigames/BusinessTycoonGame";

interface GamesHubProps {
  user: UserProfile;
  onRewardCoins?: (amount: number) => void;
  onRewardXp?: (amount: number) => void;
  onNavigateToWallet?: () => void;
}

type GamesHubTab = "arena" | "jornada" | "missoes" | "rankings" | "conquistas" | "historico";

export const GamesHub: React.FC<GamesHubProps> = ({
  user,
  onRewardCoins,
  onRewardXp,
  onNavigateToWallet,
}) => {
  const userUid = user.id || user.uid || user.email || "local_user";
  const userLevel = user.level || 1;

  const [activeTab, setActiveTab] = useState<GamesHubTab>("arena");
  const [profile, setProfile] = useState<UserGamesProfile>(() =>
    loadUserGamesProfile(userUid, userLevel)
  );

  // Minigame ativo em execução
  const [activeMinigame, setActiveMinigame] = useState<MinigameDefinition | null>(null);
  const [activeSessionToken, setActiveSessionToken] = useState<string | null>(null);

  // Modal de celebração / recompensa
  const [rewardToast, setRewardToast] = useState<{
    coins: number;
    xp: number;
    message: string;
  } | null>(null);

  // Modal de celebração de desbloqueio de novo jogo
  const [celebrationGame, setCelebrationGame] = useState<MinigameDefinition | null>(null);

  // Rankings
  const [leaderboardFilter, setLeaderboardFilter] = useState<MinigameId | "all">("all");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"all_time" | "weekly">("all_time");
  const [leaderboardEntries, setLeaderboardEntries] = useState<GameLeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);

  // Efeito de Áudio
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  // Atualiza perfil quando o nível do usuário mudar
  useEffect(() => {
    const updated = loadUserGamesProfile(userUid, userLevel);
    setProfile(updated);
  }, [userUid, userLevel]);

  // Carrega Leaderboard quando a aba for selecionada
  useEffect(() => {
    if (activeTab === "rankings") {
      setIsLeaderboardLoading(true);
      fetchGameLeaderboard(leaderboardFilter, leaderboardPeriod)
        .then((data) => setLeaderboardEntries(data))
        .finally(() => setIsLeaderboardLoading(false));
    }
  }, [activeTab, leaderboardFilter, leaderboardPeriod]);

  // Checa se algum jogo acabou de ser desbloqueado recentemente
  useEffect(() => {
    try {
      const lastLevelChecked = Number(localStorage.getItem(`brain_games_last_lvl_${userUid}`) || 1);
      if (userLevel > lastLevelChecked) {
        // Encontra jogos que desbloqueiam entre lastLevelChecked e userLevel
        const newlyUnlocked = MINIGAMES_CONFIG.find(
          (g) => g.minLevel > lastLevelChecked && g.minLevel <= userLevel
        );
        if (newlyUnlocked) {
          setCelebrationGame(newlyUnlocked);
          gameAudio.playLevelUp();
        }
        localStorage.setItem(`brain_games_last_lvl_${userUid}`, String(userLevel));
      }
    } catch {}
  }, [userLevel, userUid]);

  const handleLaunchGame = async (gameDef: MinigameDefinition) => {
    if (!isGameUnlocked(gameDef.id, userLevel)) {
      gameAudio.playWrong();
      return;
    }
    gameAudio.playClick();
    const token = await startNewGameSession(userUid, gameDef.id);
    setActiveSessionToken(token);
    setActiveMinigame(gameDef);
  };

  const handleFinishMatch = async (payload: any) => {
    try {
      addEventPoints(25, `Vitória no jogo ${activeMinigame?.title || "Minigame"}`);
    } catch {}

    const res = await completeGameSession(
      userUid,
      user.name || "Estudante IFES",
      userLevel,
      payload,
      onRewardCoins,
      onRewardXp
    );

    // Atualiza estado local
    const freshProfile = loadUserGamesProfile(userUid, userLevel);
    setProfile(freshProfile);

    // Exibe notificação de recompensa
    if (res.coinsAwarded > 0 || res.xpAwarded > 0) {
      setRewardToast({
        coins: res.coinsAwarded,
        xp: res.xpAwarded,
        message: res.dailyLimitReached
          ? "Partida registrada! Limite diário de moedas atingido."
          : "Partida concluída e recompensas entregues com sucesso!",
      });
      setTimeout(() => setRewardToast(null), 4000);
    }
  };

  const handleClaimMission = async (missionId: string) => {
    gameAudio.playVictory();
    const result = await claimMissionReward(userUid, missionId, onRewardCoins, onRewardXp);
    if (result) {
      setProfile(loadUserGamesProfile(userUid, userLevel));
      setRewardToast({
        coins: result.coins,
        xp: result.xp,
        message: "Recompensa de missão resgatada com sucesso!",
      });
      setTimeout(() => setRewardToast(null), 3500);
    }
  };

  const handleClaimAchievement = async (achievementId: string) => {
    gameAudio.playVictory();
    const result = await claimAchievementReward(userUid, achievementId, onRewardCoins, onRewardXp);
    if (result) {
      setProfile(loadUserGamesProfile(userUid, userLevel));
      setRewardToast({
        coins: result.coins,
        xp: result.xp,
        message: "Conquista resgatada e creditada na carteira!",
      });
      setTimeout(() => setRewardToast(null), 3500);
    }
  };

  const getMinigameIcon = (iconName: string) => {
    switch (iconName) {
      case "Brain":
        return Brain;
      case "Sparkles":
        return Sparkles;
      case "BookOpen":
        return BookOpen;
      case "Zap":
        return Zap;
      case "Puzzle":
        return Puzzle;
      case "KeyRound":
        return KeyRound;
      case "Leaf":
        return Leaf;
      case "TrendingUp":
        return TrendingUp;
      default:
        return Gamepad2;
    }
  };

  const nextGame = getNextGameToUnlock(userLevel);

  // SE UM JOGO ESTIVER ATIVO, RENDERIZA O MINIGAME EM FOCO
  if (activeMinigame && activeSessionToken) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-full">
        {activeMinigame.id === "quiz_battle" && (
          <QuizBattleGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "memory_cards" && (
          <MemoryCardsGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "word_master" && (
          <WordMasterGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "math_rush" && (
          <MathRushGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "brain_challenge" && (
          <BrainChallengeGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "code_breaker" && (
          <CodeBreakerGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "eco_challenge" && (
          <EcoChallengeGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
        {activeMinigame.id === "business_tycoon" && (
          <BusinessTycoonGame
            userId={userUid}
            userName={user.name || "Estudante IFES"}
            sessionToken={activeSessionToken}
            onFinishGame={handleFinishMatch}
            onExit={() => {
              setActiveMinigame(null);
              setActiveSessionToken(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-12">
      {/* Toast de Recompensa Flutuante */}
      {rewardToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 animate-slide-up">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono font-black text-sm text-emerald-400">
              <span>+{rewardToast.coins} IF Coins</span>
              <span>•</span>
              <span className="text-blue-400">+{rewardToast.xp} XP</span>
            </div>
            <p className="text-xs text-slate-300">{rewardToast.message}</p>
          </div>
        </div>
      )}

      {/* Modal de Celebração de Novo Jogo Desbloqueado */}
      {celebrationGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--app-card)] border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                Novo Jogo Desbloqueado!
              </span>
              <h3 className="text-2xl font-black text-[var(--app-text)]">
                {celebrationGame.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
                {celebrationGame.description}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs font-medium text-[var(--app-text)]">
              {celebrationGame.rewardsDescription}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCelebrationGame(null)}
                className="flex-1 py-3 rounded-2xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
              >
                Depois
              </button>
              <button
                onClick={() => {
                  setCelebrationGame(null);
                  handleLaunchGame(celebrationGame);
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Jogar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Tecnológico da Central de Games */}
      <div className="relative overflow-hidden border-b border-[var(--app-border)] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white px-4 sm:px-8 py-8 sm:py-10">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/games_hub_banner_1793362260591.jpg"
            alt="Arena Games"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold tracking-wider uppercase">
                Área Games • APP-IFES
              </span>
              <span className="text-xs text-slate-400">8 Minigames Reais</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Arena Acadêmica de Jogos
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Desenvolva raciocínio, memória e conhecimento científico. Conquiste IF Coins na economia real do app e desbloqueie novos minigames conforme seu nível.
            </p>
          </div>

          {/* Cards de Status do Jogador */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Nível */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md flex items-center gap-3 min-w-[130px]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                N{userLevel}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Seu Nível</span>
                <span className="font-mono font-black text-sm text-white">Nível {userLevel}</span>
              </div>
            </div>

            {/* Saldo de IF Coins */}
            <div
              onClick={onNavigateToWallet}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md flex items-center gap-3 min-w-[140px] cursor-pointer hover:border-amber-500/50 transition"
              title="Ver carteira e extrato de moedas"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo IF Coins</span>
                <span className="font-mono font-black text-sm text-amber-300">
                  {user.coins ?? profile.coins} 🪙
                </span>
              </div>
            </div>

            {/* Botão de Som */}
            <button
              onClick={() => {
                const muted = gameAudio.toggleMute();
                setIsAudioMuted(muted);
              }}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isAudioMuted ? "Ativar som" : "Desativar som"}
            >
              {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Próximo Jogo a Desbloquear Banner (se houver) */}
      {nextGame && (
        <div className="bg-[var(--app-card-secondary)]/50 border-b border-[var(--app-border)] px-4 sm:px-8 py-3">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[var(--app-text)]">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Próximo jogo: <strong>{nextGame.title}</strong> (desbloqueia no{" "}
                <strong className="text-amber-500">Nível {nextGame.minLevel}</strong>). Faltam{" "}
                <strong>{nextGame.minLevel - userLevel}</strong> {nextGame.minLevel - userLevel === 1 ? "nível" : "níveis"}.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-48">
              <div className="flex-1 bg-[var(--app-border)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((userLevel / nextGame.minLevel) * 100))}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-[var(--app-text-muted)]">
                {Math.round((userLevel / nextGame.minLevel) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subnavegação da Central Games */}
      <div className="sticky top-0 z-20 bg-[var(--app-bg)]/95 backdrop-blur-md border-b border-[var(--app-border)] px-4 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "arena" as GamesHubTab, label: "Arena de Jogos", icon: Gamepad2 },
            { id: "jornada" as GamesHubTab, label: "Jornada de Níveis", icon: Layers },
            { id: "missoes" as GamesHubTab, label: "Missões", icon: Target },
            { id: "rankings" as GamesHubTab, label: "Rankings", icon: Trophy },
            { id: "conquistas" as GamesHubTab, label: "Conquistas", icon: Award },
            { id: "historico" as GamesHubTab, label: "Histórico", icon: History },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  gameAudio.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-8">
        {/* ABA 1: ARENA DE JOGOS (GRID DOS 8 MINIGAMES) */}
        {activeTab === "arena" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--app-text)]">Minigames Disponíveis</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Selecione um jogo para iniciar uma partida ranqueada.
                </p>
              </div>
              <div className="text-xs text-[var(--app-text-muted)] font-mono">
                {profile.unlockedGames.length} de {MINIGAMES_CONFIG.length} liberados
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MINIGAMES_CONFIG.map((game) => {
                const isUnlocked = isGameUnlocked(game.id, userLevel);
                const Icon = getMinigameIcon(game.iconName);
                const bestScore = profile.personalBests[game.id] || 0;

                return (
                  <div
                    key={game.id}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                      isUnlocked
                        ? "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)] hover:shadow-lg hover:-translate-y-1"
                        : "bg-[var(--app-card-secondary)]/40 border-[var(--app-border)]/60 opacity-70"
                    }`}
                  >
                    {/* Imagem do Card */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      <img
                        src={game.imageBanner}
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isUnlocked ? "hover:scale-105" : "grayscale opacity-50"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Tag de Categoria */}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                        {game.category}
                      </span>

                      {/* Badge de Nível / Status */}
                      <div className="absolute top-3 right-3">
                        {isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Liberado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Nível {game.minLevel}
                          </span>
                        )}
                      </div>

                      {/* Título na Imagem */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-black text-base text-white leading-tight drop-shadow-sm">
                          {game.title}
                        </h3>
                      </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 leading-relaxed">
                          {game.tagline}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px] text-[var(--app-text-muted)] font-mono">
                          <span>Recorde: <strong className="text-[var(--app-text)]">{bestScore} pts</strong></span>
                          <span>{game.estimatedDuration}</span>
                        </div>
                      </div>

                      {/* Ação */}
                      <div className="pt-2">
                        {isUnlocked ? (
                          <button
                            onClick={() => handleLaunchGame(game)}
                            className="w-full py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Jogar Agora</span>
                          </button>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text-muted)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Requer Nível {game.minLevel}</span>
                            </button>
                            <p className="text-[10px] text-center text-amber-500">
                              Faltam {game.minLevel - userLevel} níveis para liberar
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 2: JORNADA DE NÍVEIS (PROGRESSÃO VISUAL DO NÍVEL 1 AO 30) */}
        {activeTab === "jornada" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[var(--app-text)]">Jornada de Desbloqueio</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Veja o caminho de evolução do estudante e os próximos minigames na trilha acadêmica.
              </p>
            </div>

            <div className="relative border-l-2 border-[var(--app-border)] ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
              {MINIGAMES_CONFIG.map((game, idx) => {
                const isUnlocked = isGameUnlocked(game.id, userLevel);
                const Icon = getMinigameIcon(game.iconName);

                return (
                  <div key={game.id} className="relative group">
                    {/* Marcador na Linha */}
                    <div
                      className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isUnlocked
                          ? "bg-emerald-500 border-white text-white shadow-md"
                          : "bg-[var(--app-card)] border-[var(--app-border)] text-[var(--app-text-muted)]"
                      }`}
                    >
                      {isUnlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                    </div>

                    {/* Card da Etapa */}
                    <div
                      className={`p-5 rounded-3xl border transition ${
                        isUnlocked
                          ? "bg-[var(--app-card)] border-[var(--app-border)] shadow-xs"
                          : "bg-[var(--app-card-secondary)]/40 border-[var(--app-border)]/60 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                              isUnlocked ? "bg-emerald-500/15 text-emerald-500" : "bg-[var(--app-border)]/60 text-[var(--app-text-muted)]"
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Nível {game.minLevel}
                              </span>
                              <span className="text-xs text-[var(--app-text-muted)]">• {game.category}</span>
                            </div>
                            <h3 className="font-black text-base text-[var(--app-text)]">{game.title}</h3>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <button
                              onClick={() => handleLaunchGame(game)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Jogar</span>
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-amber-500 font-mono">
                              Bloqueado (Faltam {game.minLevel - userLevel} níveis)
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[var(--app-text-muted)] mt-2 leading-relaxed">
                        {game.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 3: MISSÕES (DIÁRIAS E SEMANAIS) */}
        {activeTab === "missoes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--app-text)]">Missões Disponíveis</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Cumpra objetivos nos minigames para conquistar IF Coins e bônus de XP.
                </p>
              </div>
              <span className="text-xs text-amber-500 font-bold font-mono">
                Limite Diário: {profile.dailyCoinsEarnedToday} / {profile.dailyCoinLimit} 🪙
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.activeMissions.map((mission) => {
                const progressPct = Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100));
                const canClaim = mission.status === "completed";
                const isClaimed = mission.status === "claimed";

                return (
                  <div
                    key={mission.id}
                    className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition ${
                      isClaimed
                        ? "bg-[var(--app-card-secondary)]/30 border-[var(--app-border)] opacity-60"
                        : canClaim
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-md"
                        : "bg-[var(--app-card)] border-[var(--app-border)]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text-muted)]">
                          {mission.category === "daily" ? "Missão Diária" : "Missão Semanal"}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-500">
                          <span>🪙 +{mission.rewardCoins}</span>
                          <span className="text-blue-500">• +{mission.rewardXp} XP</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[var(--app-text)]">{mission.title}</h3>
                      <p className="text-xs text-[var(--app-text-muted)]">{mission.description}</p>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] font-mono text-[var(--app-text-muted)]">
                        <span>Progresso</span>
                        <span>
                          {mission.currentValue} / {mission.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-[var(--app-border)] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            canClaim || isClaimed ? "bg-emerald-500" : "bg-[var(--app-primary)]"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      {isClaimed ? (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Recompensa Resgatada
                        </span>
                      ) : canClaim ? (
                        <button
                          onClick={() => handleClaimMission(mission.id)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                        >
                          Resgatar {mission.rewardCoins} IF Coins
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--app-text-muted)] italic block text-center">
                          Em andamento
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 4: RANKINGS */}
        {activeTab === "rankings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--app-text)]">Quadro de Líderes</h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Classificação acadêmica por desempenho e disciplina.
                </p>
              </div>

              {/* Filtros de Período e Minigame */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={leaderboardFilter}
                  onChange={(e) => setLeaderboardFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
                >
                  <option value="all">Todos os Minigames</option>
                  {MINIGAMES_CONFIG.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>

                <select
                  value={leaderboardPeriod}
                  onChange={(e) => setLeaderboardPeriod(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
                >
                  <option value="all_time">Geral de XP</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
            </div>

            {/* Tabela do Ranking */}
            <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--app-card-secondary)]/50 border-b border-[var(--app-border)] text-[var(--app-text-muted)] font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Pos.</th>
                    <th className="py-3 px-4">Estudante</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Campus</th>
                    <th className="py-3 px-4 text-center">Nível</th>
                    <th className="py-3 px-4 text-right">Pontuação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--app-border)]">
                  {leaderboardEntries.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-[var(--app-card-secondary)]/40 transition ${
                        entry.userId === userUid ? "bg-[var(--app-primary)]/10 font-bold" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center font-bold text-xs">
                            {entry.userName.charAt(0)}
                          </div>
                          <span className="font-bold text-[var(--app-text)]">{entry.userName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--app-text-muted)] hidden sm:table-cell">
                        {entry.campus || "IFES"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--app-text)]">
                        N{entry.level}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-[var(--app-primary)]">
                        {entry.score.toLocaleString()} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 5: CONQUISTAS */}
        {activeTab === "conquistas" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[var(--app-text)]">Galeria de Conquistas</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Complete marcos especiais em cada minigame para receber distintivos e prêmios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 transition ${
                    ach.isUnlocked
                      ? "bg-[var(--app-card)] border-emerald-500/50 shadow-sm"
                      : "bg-[var(--app-card-secondary)]/30 border-[var(--app-border)] opacity-60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          ach.isUnlocked ? "bg-emerald-500/20 text-emerald-500" : "bg-[var(--app-border)]/50 text-[var(--app-text-muted)]"
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-500">
                        🪙 +{ach.rewardCoins}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--app-text)]">{ach.title}</h4>
                    <p className="text-xs text-[var(--app-text-muted)]">{ach.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--app-border)]/50">
                    {ach.isUnlocked ? (
                      <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Desbloqueado!
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[var(--app-text-muted)]">
                        Requisito: {ach.requirement}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: HISTÓRICO DE PARTIDAS */}
        {activeTab === "historico" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[var(--app-text)]">Histórico de Partidas</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Registro de suas últimas 50 partidas jogadas nos minigames.
              </p>
            </div>

            {profile.history.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text-muted)] space-y-2">
                <History className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm">Nenhuma partida registrada ainda.</p>
                <p className="text-xs">Jogue sua primeira partida na Arena para registrar seu histórico!</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--app-card-secondary)]/50 border-b border-[var(--app-border)] text-[var(--app-text-muted)] font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Jogo</th>
                      <th className="py-3 px-4">Pontuação</th>
                      <th className="py-3 px-4">Recompensas</th>
                      <th className="py-3 px-4 hidden sm:table-cell">Duração</th>
                      <th className="py-3 px-4 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {profile.history.map((h) => (
                      <tr key={h.id} className="hover:bg-[var(--app-card-secondary)]/30 transition">
                        <td className="py-3 px-4 font-bold text-[var(--app-text)]">{h.gameTitle}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[var(--app-primary)]">{h.score} pts</td>
                        <td className="py-3 px-4 font-mono text-emerald-500 font-bold">
                          +{h.coinsEarned} 🪙 • +{h.xpEarned} XP
                        </td>
                        <td className="py-3 px-4 text-[var(--app-text-muted)] hidden sm:table-cell">
                          {h.durationSeconds}s
                        </td>
                        <td className="py-3 px-4 text-right text-[var(--app-text-muted)] font-mono text-[11px]">
                          {new Date(h.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
