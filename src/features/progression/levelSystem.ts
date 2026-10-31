// Sistema de Progressão Geral de 100 Níveis do APP-IFES
// Requisitos progressivos de XP, títulos acadêmicos e desbloqueios graduais de recursos.

export interface LevelMilestone {
  level: number;
  xpRequired: number; // XP acumulado total necessário para atingir este nível
  title: string;
  category: "Iniciante" | "Intermediário" | "Avançado" | "Mestre" | "Lendário";
  icon: string;
  color: string;
  unlockedFeatures: string[];
  rewardDescription: string;
  coinsReward: number;
  freePackReward?: "comum" | "raro" | "epico" | "lendario" | "dourado";
  chestReward?: "madeira" | "prata" | "ouro" | "epico" | "lendario" | "mitico";
}

// Geração progressiva balanceada dos 100 níveis
export const LEVELS_CONFIG: LevelMilestone[] = (() => {
  const milestones: LevelMilestone[] = [];

  const TITLES_MAP: { [lvl: number]: { title: string; category: LevelMilestone["category"]; icon: string; color: string; unlocks?: string[] } } = {
    1: { title: "Calouro Curioso", category: "Iniciante", icon: "🌱", color: "#3B82F6", unlocks: ["Quiz Battle", "Álbum Coleção 1 (Grandes Cientistas)", "Central IFES Live Events"] },
    2: { title: "Aprendiz de Laboratório", category: "Iniciante", icon: "🔬", color: "#3B82F6" },
    3: { title: "Explorador da Memória", category: "Iniciante", icon: "🧠", color: "#8B5CF6", unlocks: ["Memory Cards", "Mercado de Trocas Básicas"] },
    4: { title: "Bolsista Dedicado", category: "Iniciante", icon: "📚", color: "#8B5CF6" },
    5: { title: "Mestre dos Vocábulos", category: "Iniciante", icon: "✍️", color: "#EC4899", unlocks: ["Word Master", "Torneio de Conhecimento", "Coleção 2 (Universo da Matemática)"] },
    6: { title: "Pesquisador Voluntário", category: "Iniciante", icon: "🔍", color: "#EC4899" },
    7: { title: "Calculador Ágil", category: "Iniciante", icon: "📐", color: "#F59E0B" },
    8: { title: "Velocista dos Números", category: "Iniciante", icon: "⚡", color: "#F59E0B", unlocks: ["Math Rush", "Baú de Prata Permanente"] },
    9: { title: "Monitor de Disciplina", category: "Iniciante", icon: "🎓", color: "#10B981" },
    10: { title: "Explorador Científico", category: "Iniciante", icon: "🧭", color: "#10B981", unlocks: ["Liga Prata", "Coleção 3 (Descobertas da Física)"] },
    12: { title: "Estrategista Mental", category: "Intermediário", icon: "🧩", color: "#6366F1", unlocks: ["Brain Challenge", "Eventos de Progressão por Marcos"] },
    15: { title: "Competidor Nato", category: "Intermediário", icon: "⚔️", color: "#6366F1", unlocks: ["Torneio Relâmpago", "Baú de Ouro"] },
    16: { title: "Criptógrafo Acadêmico", category: "Intermediário", icon: "💻", color: "#14B8A6", unlocks: ["Code Breaker", "Coleção 4 (História da Humanidade)"] },
    20: { title: "Cientista Promissor", category: "Intermediário", icon: "🔭", color: "#14B8A6", unlocks: ["Liga Ouro", "Coleção 5 (Biologia e Natureza)"] },
    22: { title: "Guardião Sustentável", category: "Intermediário", icon: "🌿", color: "#10B981", unlocks: ["Eco Challenge", "Torneio de Minigames"] },
    25: { title: "Pesquisador IFES", category: "Intermediário", icon: "🏆", color: "#F59E0B", unlocks: ["Coleção 6 (Geografia Mundial)", "Forja de Fragmentos Estelares"] },
    30: { title: "Magnata do Conhecimento", category: "Avançado", icon: "🏛️", color: "#F59E0B", unlocks: ["Business Tycoon", "Coleção 7 (Grandes Invenções)", "Liga Platina"] },
    35: { title: "Líder de Equipes", category: "Avançado", icon: "🛡️", color: "#8B5CF6", unlocks: ["Batalhas de Equipe Avançadas", "Baú Épico"] },
    40: { title: "Filósofo Contemporâneo", category: "Avançado", icon: "📖", color: "#8B5CF6", unlocks: ["Coleção 8 (Literatura e Pensamento)"] },
    45: { title: "Arquiteto de Saberes", category: "Avançado", icon: "🏗️", color: "#EC4899" },
    50: { title: "Mestre Acadêmico", category: "Avançado", icon: "👑", color: "#EC4899", unlocks: ["Liga Diamante", "Coleção 9 (Civilizações Antigas)", "Baú Lendário"] },
    60: { title: "Doutor Honoris Causa", category: "Mestre", icon: "🎖️", color: "#6366F1" },
    65: { title: "Visionário Tecnológico", category: "Mestre", icon: "🚀", color: "#6366F1", unlocks: ["Coleção 10 (Tecnologia & Inovação)"] },
    75: { title: "Cientista Emérito IFES", category: "Mestre", icon: "🌟", color: "#F59E0B", unlocks: ["Liga Mestre"] },
    85: { title: "Titã do Saber Capixaba", category: "Lendário", icon: "🌌", color: "#8B5CF6" },
    90: { title: "Luminar dos Oceanos", category: "Lendário", icon: "💠", color: "#14B8A6", unlocks: ["Baú Mítico Garantido"] },
    95: { title: "Vanguarda Cósmica", category: "Lendário", icon: "🪐", color: "#F43F5E" },
    100: { title: "Grão-Mestre Lendário do IFES", category: "Lendário", icon: "👑✨", color: "#FBBF24", unlocks: ["Liga Lendária", "Troféu Perpétuo do IFES", "Cartas Míticas Douradas Exclusivas"] },
  };

  let cumulativeXp = 0;
  for (let lvl = 1; lvl <= 100; lvl++) {
    // Curva suave e recompensadora de XP:
    // Nível 1: 0 XP
    // Nível 2: 300 XP
    // Nível 10: ~3.500 XP
    // Nível 30: ~25.000 XP
    // Nível 100: ~250.000 XP
    if (lvl > 1) {
      const step = Math.floor(250 + (lvl - 1) * 45 + Math.pow(lvl, 1.35) * 8);
      cumulativeXp += step;
    }

    const custom = TITLES_MAP[lvl];
    const category: LevelMilestone["category"] =
      custom?.category || (lvl < 15 ? "Iniciante" : lvl < 35 ? "Intermediário" : lvl < 60 ? "Avançado" : lvl < 85 ? "Mestre" : "Lendário");

    const fallbackTitle =
      lvl < 15
        ? `Estudante Nível ${lvl}`
        : lvl < 35
        ? `Pesquisador Nível ${lvl}`
        : lvl < 60
        ? `Especialista Nível ${lvl}`
        : lvl < 85
        ? `Mestre Nível ${lvl}`
        : `Lendário Nível ${lvl}`;

    const coinsReward = lvl === 1 ? 0 : 50 + lvl * 15 + (lvl % 10 === 0 ? 300 : lvl % 5 === 0 ? 100 : 0);
    const freePack =
      lvl === 100
        ? "dourado"
        : lvl % 20 === 0
        ? "lendario"
        : lvl % 10 === 0
        ? "epico"
        : lvl % 5 === 0
        ? "raro"
        : undefined;

    const chest =
      lvl === 100
        ? "mitico"
        : lvl % 25 === 0
        ? "lendario"
        : lvl % 10 === 0
        ? "ouro"
        : lvl % 5 === 0
        ? "prata"
        : undefined;

    milestones.push({
      level: lvl,
      xpRequired: cumulativeXp,
      title: custom?.title || fallbackTitle,
      category,
      icon: custom?.icon || (lvl % 5 === 0 ? "⭐" : "📘"),
      color: custom?.color || (lvl < 20 ? "#3B82F6" : lvl < 50 ? "#8B5CF6" : lvl < 80 ? "#EC4899" : "#F59E0B"),
      unlockedFeatures: custom?.unlocks || [],
      rewardDescription: `+${coinsReward} IF Coins${freePack ? ` • Pacote ${freePack.toUpperCase()}` : ""}${chest ? ` • Baú de ${chest}` : ""}`,
      coinsReward,
      freePackReward: freePack,
      chestReward: chest,
    });
  }

  return milestones;
})();

/**
 * Calcula o nível exato e o progresso percentual até o próximo nível com base no XP total do usuário.
 */
export function calculateLevelFromXp(xp: number): {
  level: number;
  currentMilestone: LevelMilestone;
  nextMilestone: LevelMilestone;
  currentLevelXp: number;
  neededForNextLevel: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  const safeXp = Math.max(0, xp || 0);

  let currentLevel = 1;
  for (let i = 0; i < LEVELS_CONFIG.length; i++) {
    if (safeXp >= LEVELS_CONFIG[i].xpRequired) {
      currentLevel = LEVELS_CONFIG[i].level;
    } else {
      break;
    }
  }

  const currentMilestone = LEVELS_CONFIG[currentLevel - 1] || LEVELS_CONFIG[0];
  const nextMilestone = LEVELS_CONFIG[Math.min(currentLevel, LEVELS_CONFIG.length - 1)];
  const isMaxLevel = currentLevel >= 100;

  const currentLevelBaseXp = currentMilestone.xpRequired;
  const nextLevelTargetXp = isMaxLevel ? currentMilestone.xpRequired : nextMilestone.xpRequired;
  const span = Math.max(1, nextLevelTargetXp - currentLevelBaseXp);
  const currentInLevel = Math.max(0, safeXp - currentLevelBaseXp);
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.floor((currentInLevel / span) * 100));

  return {
    level: currentLevel,
    currentMilestone,
    nextMilestone,
    currentLevelXp: currentInLevel,
    neededForNextLevel: Math.max(0, nextLevelTargetXp - safeXp),
    progressPercent,
    isMaxLevel,
  };
}

export function getLevelMilestone(level: number): LevelMilestone {
  const safe = Math.min(100, Math.max(1, level));
  return LEVELS_CONFIG[safe - 1] || LEVELS_CONFIG[0];
}
