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
import { movimentarMoedas } from "../../economia/services/extratoService";
import { creditCoins, creditXp } from "../../gamificacao/economyService";

const STORAGE_GAMES_PROFILE_KEY = "brain_games_profile_v2";
const STORAGE_SESSION_TOKEN_KEY = "brain_games_active_session";

export const INITIAL_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: "first_game",
    title: "Primeiro Jogo",
    description: "Complete sua primeira partida em qualquer minigame do IFES.",
    iconName: "Gamepad2",
    requirement: "1 partida concluída",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 25,
    rewardXp: 40,
    isUnlocked: false,
  },
  {
    id: "quick_mind",
    title: "Mente Rápida",
    description: "Obtenha mais de 80% de precisão em uma partida de Quiz Battle.",
    iconName: "Zap",
    requirement: "80% de acertos no Quiz",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 40,
    rewardXp: 60,
    isUnlocked: false,
  },
  {
    id: "memory_master",
    title: "Mestre da Memória",
    description: "Vença uma partida de Memory Cards em menos de 18 movimentos.",
    iconName: "Sparkles",
    requirement: "Menos de 18 movimentos",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 45,
    rewardXp: 70,
    isUnlocked: false,
  },
  {
    id: "math_genius",
    title: "Gênio Matemático",
    description: "Atinja um combo de pelo menos 8 acertos no Math Rush.",
    iconName: "Calculator",
    requirement: "Combo de 8 no Math Rush",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 50,
    rewardXp: 80,
    isUnlocked: false,
  },
  {
    id: "word_scholar",
    title: "Mestre das Palavras",
    description: "Descubra 3 termos secretos ou complete o caça-palavras no Word Master.",
    iconName: "BookOpen",
    requirement: "3 palavras resolvidas",
    currentProgress: 0,
    maxProgress: 3,
    rewardCoins: 50,
    rewardXp: 80,
    isUnlocked: false,
  },
  {
    id: "code_cracker",
    title: "Decifrador de Códigos",
    description: "Descubra o código secreto no Code Breaker em 5 tentativas ou menos.",
    iconName: "KeyRound",
    requirement: "Quebrar código em ≤ 5 tentativas",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 60,
    rewardXp: 100,
    isUnlocked: false,
  },
  {
    id: "sustainable_leader",
    title: "Líder Sustentável",
    description: "Conclua uma simulação no Eco Challenge mantendo todos os indicadores acima de 70%.",
    iconName: "Leaf",
    requirement: "Indicadores > 70% no ano 10",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 80,
    rewardXp: 120,
    isUnlocked: false,
  },
  {
    id: "business_tycoon_pro",
    title: "Grande Empresário",
    description: "Alcance um valuation superior a R$ 100.000 no Business Tycoon.",
    iconName: "TrendingUp",
    requirement: "Valuation > R$ 100.000",
    currentProgress: 0,
    maxProgress: 1,
    rewardCoins: 100,
    rewardXp: 150,
    isUnlocked: false,
  },
  {
    id: "polymath",
    title: "Polímata do IFES",
    description: "Jogue e registre pontuação em pelo menos 5 minigames diferentes.",
    iconName: "Award",
    requirement: "5 jogos distintos jogados",
    currentProgress: 0,
    maxProgress: 5,
    rewardCoins: 120,
    rewardXp: 200,
    isUnlocked: false,
  },
];

export const INITIAL_MISSIONS: GameMission[] = [
  {
    id: "m_daily_1",
    title: "Primeiros Desafios do Dia",
    description: "Jogue 2 partidas em qualquer minigame.",
    category: "daily",
    gameId: "any",
    targetType: "matches_played",
    targetValue: 2,
    currentValue: 0,
    rewardCoins: 35,
    rewardXp: 50,
    status: "active",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "m_daily_2",
    title: "Agilidade Mental",
    description: "Acerte pelo menos 5 perguntas consecutivas no Quiz Battle ou 5 cálculos no Math Rush.",
    category: "daily",
    gameId: "quiz_battle",
    targetType: "streak_reached",
    targetValue: 5,
    currentValue: 0,
    rewardCoins: 40,
    rewardXp: 60,
    status: "active",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "m_weekly_1",
    title: "Maratona Multidisciplinar",
    description: "Jogue partidas em pelo menos 3 minigames diferentes esta semana.",
    category: "weekly",
    gameId: "any",
    targetType: "distinct_games",
    targetValue: 3,
    currentValue: 0,
    rewardCoins: 80,
    rewardXp: 120,
    status: "active",
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    id: "m_weekly_2",
    title: "Mestre dos Recordes",
    description: "Alcance uma pontuação de pelo menos 500 pontos em qualquer minigame.",
    category: "weekly",
    gameId: "any",
    targetType: "score_reached",
    targetValue: 500,
    currentValue: 0,
    rewardCoins: 90,
    rewardXp: 140,
    status: "active",
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
];

export function getUnlockedGamesForLevel(userLevel: number): MinigameId[] {
  return MINIGAMES_CONFIG.filter((game) => userLevel >= game.minLevel).map((g) => g.id);
}

export function isGameUnlocked(gameId: MinigameId, userLevel: number): boolean {
  const game = MINIGAMES_CONFIG.find((g) => g.id === gameId);
  if (!game) return false;
  return userLevel >= game.minLevel;
}

export function getNextGameToUnlock(userLevel: number): MinigameDefinition | null {
  const locked = MINIGAMES_CONFIG.filter((g) => g.minLevel > userLevel);
  if (locked.length === 0) return null;
  return locked.sort((a, b) => a.minLevel - b.minLevel)[0];
}

export function loadUserGamesProfile(userId: string, currentLevel: number): UserGamesProfile {
  const todayStr = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem(`${STORAGE_GAMES_PROFILE_KEY}_${userId}`);
    if (raw) {
      const parsed: UserGamesProfile = JSON.parse(raw);
      // Reset daily rewards if day changed
      if (parsed.lastDailyResetDate !== todayStr) {
        parsed.dailyCoinsEarnedToday = 0;
        parsed.lastDailyResetDate = todayStr;
      }
      parsed.level = currentLevel;
      parsed.unlockedGames = getUnlockedGamesForLevel(currentLevel);
      return parsed;
    }
  } catch (err) {
    console.warn("Aviso ao carregar perfil de jogos:", err);
  }

  // Novo perfil padrão
  return {
    userId,
    userName: "Estudante IFES",
    level: currentLevel,
    xp: 0,
    coins: 250,
    totalMatches: 0,
    unlockedGames: getUnlockedGamesForLevel(currentLevel),
    personalBests: {
      quiz_battle: 0,
      memory_cards: 0,
      word_master: 0,
      math_rush: 0,
      brain_challenge: 0,
      code_breaker: 0,
      eco_challenge: 0,
      business_tycoon: 0,
    },
    dailyCoinsEarnedToday: 0,
    dailyCoinLimit: 400, // Limite diário equilibrado para evitar farm infinito
    lastDailyResetDate: todayStr,
    history: [],
    activeMissions: INITIAL_MISSIONS,
    achievements: INITIAL_ACHIEVEMENTS,
  };
}

export function saveUserGamesProfile(profile: UserGamesProfile) {
  try {
    localStorage.setItem(
      `${STORAGE_GAMES_PROFILE_KEY}_${profile.userId}`,
      JSON.stringify(profile)
    );
  } catch (err) {
    console.warn("Aviso ao salvar perfil de jogos:", err);
  }
}

// Anti-Cheat Session Management
interface ActiveSession {
  token: string;
  userId: string;
  gameId: MinigameId;
  startTime: number;
}

export async function startNewGameSession(userId: string, gameId: MinigameId): Promise<string> {
  const startTime = Date.now();
  const token = `sess_${gameId}_${startTime}_${Math.random().toString(36).substring(2, 8)}`;
  const session: ActiveSession = { token, userId, gameId, startTime };

  try {
    sessionStorage.setItem(STORAGE_SESSION_TOKEN_KEY, JSON.stringify(session));
  } catch {}

  // Inform backend session started (non-blocking)
  fetch("/api/games/session/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, gameId, token, timestamp: startTime }),
  }).catch(() => {});

  return token;
}

export interface SessionResultPayload {
  sessionToken: string;
  gameId: MinigameId;
  score: number;
  accuracyPercent?: number;
  highestStreak?: number;
  movesCount?: number;
  phasesCompleted?: number;
  valuationFicticio?: number;
  extraNote?: string;
}

export async function completeGameSession(
  userId: string,
  userName: string,
  userLevel: number,
  payload: SessionResultPayload,
  onRewardCoins?: (amount: number) => void,
  onRewardXp?: (amount: number) => void
): Promise<{
  success: boolean;
  match: GameMatchRecord;
  coinsAwarded: number;
  xpAwarded: number;
  unlockedAchievements: GameAchievement[];
  completedMissions: GameMission[];
  dailyLimitReached: boolean;
}> {
  let sessionData: ActiveSession | null = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_SESSION_TOKEN_KEY);
    if (raw) sessionData = JSON.parse(raw);
  } catch {}

  const now = Date.now();
  const startTime = sessionData?.startTime || now - 60000;
  const durationSeconds = Math.max(5, Math.round((now - startTime) / 1000));

  // Anti-Cheat: Cálculo balanceado de moedas e XP no servidor/cliente
  const gameDef = MINIGAMES_CONFIG.find((g) => g.id === payload.gameId);
  const baseCoins = Math.min(60, Math.floor(payload.score / 15));
  const baseBonus = (payload.highestStreak && payload.highestStreak > 3) ? 10 : 0;
  let rawCoins = Math.max(5, baseCoins + baseBonus);
  let rawXp = Math.max(10, Math.floor(payload.score / 8) + 15);

  const profile = loadUserGamesProfile(userId, userLevel);

  // Limite diário de IF Coins
  const remainingDaily = Math.max(0, profile.dailyCoinLimit - profile.dailyCoinsEarnedToday);
  const coinsAwarded = Math.min(rawCoins, remainingDaily);
  const xpAwarded = rawXp;
  const dailyLimitReached = coinsAwarded < rawCoins;

  // Atualiza saldo no perfil local
  profile.dailyCoinsEarnedToday += coinsAwarded;
  profile.totalMatches += 1;
  profile.coins += coinsAwarded;
  profile.xp += xpAwarded;

  // Atualiza recorde pessoal
  if ((payload.score || 0) > (profile.personalBests[payload.gameId] || 0)) {
    profile.personalBests[payload.gameId] = payload.score;
  }

  // Cria registro de partida
  const match: GameMatchRecord = {
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gameId: payload.gameId,
    gameTitle: gameDef?.title || payload.gameId,
    userId,
    userName,
    score: payload.score,
    coinsEarned: coinsAwarded,
    xpEarned: xpAwarded,
    durationSeconds,
    completedAt: new Date().toISOString(),
    details: {
      accuracyPercent: payload.accuracyPercent,
      movesCount: payload.movesCount,
      highestStreak: payload.highestStreak,
      phasesCompleted: payload.phasesCompleted,
      valuationFicticio: payload.valuationFicticio,
      extraNote: payload.extraNote,
    },
  };

  profile.history = [match, ...profile.history.slice(0, 49)];

  // Avaliação de Missões
  const completedMissions: GameMission[] = [];
  const distinctGames = new Set(profile.history.map((h) => h.gameId)).size;

  profile.activeMissions = profile.activeMissions.map((m) => {
    if (m.status !== "active") return m;

    let updatedVal = m.currentValue;
    if (m.targetType === "matches_played") {
      if (m.gameId === "any" || m.gameId === payload.gameId) {
        updatedVal += 1;
      }
    } else if (m.targetType === "streak_reached" && payload.highestStreak) {
      if (m.gameId === "any" || m.gameId === payload.gameId) {
        updatedVal = Math.max(updatedVal, payload.highestStreak);
      }
    } else if (m.targetType === "score_reached") {
      if (m.gameId === "any" || m.gameId === payload.gameId) {
        updatedVal = Math.max(updatedVal, payload.score);
      }
    } else if (m.targetType === "distinct_games") {
      updatedVal = distinctGames;
    }

    if (updatedVal >= m.targetValue) {
      completedMissions.push({ ...m, currentValue: updatedVal, status: "completed" });
      return { ...m, currentValue: updatedVal, status: "completed" };
    }
    return { ...m, currentValue: updatedVal };
  });

  // Avaliação de Conquistas
  const newlyUnlockedAchievements: GameAchievement[] = [];
  profile.achievements = profile.achievements.map((ach) => {
    if (ach.isUnlocked) return ach;

    let unlocked = false;
    if (ach.id === "first_game" && profile.totalMatches >= 1) unlocked = true;
    if (ach.id === "quick_mind" && payload.gameId === "quiz_battle" && (payload.accuracyPercent ?? 0) >= 80) unlocked = true;
    if (ach.id === "memory_master" && payload.gameId === "memory_cards" && (payload.movesCount ?? 99) <= 18) unlocked = true;
    if (ach.id === "math_genius" && payload.gameId === "math_rush" && (payload.highestStreak ?? 0) >= 8) unlocked = true;
    if (ach.id === "word_scholar" && payload.gameId === "word_master") {
      const cur = Math.min(ach.maxProgress, ach.currentProgress + 1);
      if (cur >= ach.maxProgress) unlocked = true;
      ach.currentProgress = cur;
    }
    if (ach.id === "code_cracker" && payload.gameId === "code_breaker" && (payload.movesCount ?? 99) <= 5) unlocked = true;
    if (ach.id === "sustainable_leader" && payload.gameId === "eco_challenge" && (payload.accuracyPercent ?? 0) >= 70) unlocked = true;
    if (ach.id === "business_tycoon_pro" && payload.gameId === "business_tycoon" && (payload.valuationFicticio ?? 0) >= 100000) unlocked = true;
    if (ach.id === "polymath" && distinctGames >= 5) unlocked = true;

    if (unlocked) {
      ach.isUnlocked = true;
      ach.unlockedAt = new Date().toISOString();
      ach.currentProgress = ach.maxProgress;
      newlyUnlockedAchievements.push(ach);
    }
    return ach;
  });

  saveUserGamesProfile(profile);
  sessionStorage.removeItem(STORAGE_SESSION_TOKEN_KEY);

  // Credita na carteira oficial do app e registra no livro-razão (extrato)
  if (coinsAwarded > 0) {
    if (onRewardCoins) onRewardCoins(coinsAwarded);
    creditCoins(userId, coinsAwarded, `Minigame: ${gameDef?.title || payload.gameId}`).catch(() => {});
    movimentarMoedas(
      userId,
      coinsAwarded,
      "games",
      match.id,
      `games_${match.id}`,
      `Recompensa: ${gameDef?.title} (${payload.score} pts)`
    ).catch(() => {});
  }

  if (xpAwarded > 0) {
    if (onRewardXp) onRewardXp(xpAwarded);
    creditXp(userId, xpAwarded, `Minigame: ${gameDef?.title}`).catch(() => {});
  }

  // Notifica o backend com registro seguro da partida e ranking
  fetch("/api/games/session/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match,
      coinsAwarded,
      xpAwarded,
    }),
  }).catch(() => {});

  return {
    success: true,
    match,
    coinsAwarded,
    xpAwarded,
    unlockedAchievements: newlyUnlockedAchievements,
    completedMissions,
    dailyLimitReached,
  };
}

export async function claimMissionReward(
  userId: string,
  missionId: string,
  onRewardCoins?: (amount: number) => void,
  onRewardXp?: (amount: number) => void
): Promise<{ coins: number; xp: number } | null> {
  const profile = loadUserGamesProfile(userId, 1);
  const mission = profile.activeMissions.find((m) => m.id === missionId && m.status === "completed");
  if (!mission) return null;

  mission.status = "claimed";
  profile.coins += mission.rewardCoins;
  profile.xp += mission.rewardXp;
  saveUserGamesProfile(profile);

  if (onRewardCoins) onRewardCoins(mission.rewardCoins);
  if (onRewardXp) onRewardXp(mission.rewardXp);

  creditCoins(userId, mission.rewardCoins, `Missão: ${mission.title}`).catch(() => {});
  movimentarMoedas(
    userId,
    mission.rewardCoins,
    "missao",
    mission.id,
    `mission_${mission.id}`,
    `Missão Concluída: ${mission.title}`
  ).catch(() => {});
  creditXp(userId, mission.rewardXp, `Missão: ${mission.title}`).catch(() => {});

  fetch("/api/games/missions/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, missionId }),
  }).catch(() => {});

  return { coins: mission.rewardCoins, xp: mission.rewardXp };
}

export async function claimAchievementReward(
  userId: string,
  achievementId: string,
  onRewardCoins?: (amount: number) => void,
  onRewardXp?: (amount: number) => void
): Promise<{ coins: number; xp: number } | null> {
  const profile = loadUserGamesProfile(userId, 1);
  const ach = profile.achievements.find((a) => a.id === achievementId && a.isUnlocked);
  if (!ach) return null;

  profile.coins += ach.rewardCoins;
  profile.xp += ach.rewardXp;
  saveUserGamesProfile(profile);

  if (onRewardCoins) onRewardCoins(ach.rewardCoins);
  if (onRewardXp) onRewardXp(ach.rewardXp);

  creditCoins(userId, ach.rewardCoins, `Conquista: ${ach.title}`).catch(() => {});
  movimentarMoedas(
    userId,
    ach.rewardCoins,
    "games",
    ach.id,
    `ach_${ach.id}`,
    `Conquista Desbloqueada: ${ach.title}`
  ).catch(() => {});
  creditXp(userId, ach.rewardXp, `Conquista: ${ach.title}`).catch(() => {});

  return { coins: ach.rewardCoins, xp: ach.rewardXp };
}

export async function fetchGameLeaderboard(
  gameId: MinigameId | "all" = "all",
  category: "all_time" | "weekly" = "all_time"
): Promise<GameLeaderboardEntry[]> {
  try {
    const res = await fetch(`/api/games/leaderboard?gameId=${gameId}&category=${category}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leaderboard)) {
        return data.leaderboard;
      }
    }
  } catch {}

  // Fallback seguro mock/local para visualização rica imediata
  return [
    { rank: 1, userId: "u1", userName: "Lívia Vasconcelos", campus: "IFES Vitória", score: 1420, level: 28, gameId },
    { rank: 2, userId: "u2", userName: "Gabriel Rocha", campus: "IFES Serra", score: 1280, level: 24, gameId },
    { rank: 3, userId: "u3", userName: "Marina Esteves", campus: "IFES Vila Velha", score: 1150, level: 21, gameId },
    { rank: 4, userId: "u4", userName: "Matheus Pinheiro", campus: "IFES Cariacica", score: 980, level: 18, gameId },
    { rank: 5, userId: "u5", userName: "Beatriz Lima", campus: "IFES Linhares", score: 870, level: 15, gameId },
  ];
}
