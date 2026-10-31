import { SeasonDefinition, SeasonTierReward } from "../types";

const now = Date.now();
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const seasonStart = Math.floor(now / MONTH_MS) * MONTH_MS;
const seasonEnd = seasonStart + MONTH_MS;

const generateSeasonTiers = (): SeasonTierReward[] => {
  const tiers: SeasonTierReward[] = [];

  for (let i = 1; i <= 30; i++) {
    const xpRequired = i * 200;

    let reward: SeasonTierReward["freeReward"];

    if (i === 30) {
      reward = {
        type: "pack",
        amount: 1,
        packType: "dourado",
        chestType: "mitico",
        badgeTitle: "Mestre da Temporada 1",
        label: "Pacote Dourado Imperial + Baú Mítico + Insígnia!",
        icon: "👑✨",
      };
    } else if (i % 10 === 0) {
      reward = {
        type: "chest",
        amount: 1,
        chestType: i === 20 ? "lendario" : "ouro",
        packType: "lendario",
        label: i === 20 ? "Baú Lendário" : "Baú de Ouro",
        icon: "🏆",
      };
    } else if (i % 5 === 0) {
      reward = {
        type: "pack",
        amount: 1,
        packType: "epico",
        label: "Pacote Épico",
        icon: "💎",
      };
    } else if (i % 3 === 0) {
      reward = {
        type: "pack",
        amount: 1,
        packType: "raro",
        label: "Pacote Raro",
        icon: "🃏",
      };
    } else if (i % 2 === 0) {
      reward = {
        type: "coins",
        amount: 100 + i * 10,
        label: `${100 + i * 10} IF Coins`,
        icon: "🪙",
      };
    } else {
      reward = {
        type: "xp",
        amount: 150 + i * 15,
        label: `${150 + i * 15} XP`,
        icon: "⚡",
      };
    }

    tiers.push({
      level: i,
      xpRequired,
      freeReward: reward,
    });
  }

  return tiers;
};

export const CURRENT_SEASON: SeasonDefinition = {
  id: "season_01_jornada_conhecimento",
  number: 1,
  title: "Temporada 1: Jornada do Conhecimento",
  theme: "Expedição Científica & Tecnológica dos Institutos Federais",
  description: "Avance nos 30 níveis da temporada respondendo quizzes, jogando minigames e construindo nas Vilas do Saber. 100% gratuito!",
  bannerGradient: "from-indigo-600 via-purple-700 to-pink-600",
  startsAt: seasonStart,
  endsAt: seasonEnd,
  totalTiers: 30,
  tiers: generateSeasonTiers(),
  seasonBadge: "Luminar da Temporada 1",
};
