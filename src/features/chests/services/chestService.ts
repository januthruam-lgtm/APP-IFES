import { ChestDefinition, ChestDropResult, ChestType } from "../types";

export const CHESTS_CONFIG: Record<ChestType, ChestDefinition> = {
  madeira: {
    id: "madeira",
    name: "Baú de Madeira Rústica",
    subtitle: "Recompensa Inicial de Missões",
    icon: "📦",
    accentColor: "#A16207",
    glowColor: "rgba(161, 98, 7, 0.4)",
    bgGradient: "from-amber-900 via-stone-900 to-slate-950",
    coinsRange: [40, 90],
    xpRange: [50, 100],
    guaranteedPacks: ["comum"],
    bonusShardsRange: [5, 12],
    description: "Baú acadêmico simples contendo moedas de estudos e 1 Pacote Comum.",
  },
  prata: {
    id: "prata",
    name: "Baú de Prata Esculpida",
    subtitle: "Conquista de Torneios Intermediários",
    icon: "🪙",
    accentColor: "#94A3B8",
    glowColor: "rgba(148, 163, 184, 0.5)",
    bgGradient: "from-slate-600 via-slate-800 to-slate-950",
    coinsRange: [100, 200],
    xpRange: [120, 250],
    guaranteedPacks: ["raro"],
    bonusShardsRange: [15, 30],
    description: "Baú de prata contendo IF Coins generosas e 1 Pacote Raro garantido.",
  },
  ouro: {
    id: "ouro",
    name: "Baú de Ouro Nobre",
    subtitle: "Recompensa de Grandes Desafios",
    icon: "👑",
    accentColor: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.6)",
    bgGradient: "from-amber-500 via-yellow-700 to-slate-950",
    coinsRange: [250, 450],
    xpRange: [300, 500],
    guaranteedPacks: ["raro", "epico"],
    bonusShardsRange: [35, 60],
    specialBadgeTitle: "Buscador de Ouro",
    description: "Baú resplandecente contendo moedas em abundância, Pacote Raro e Pacote Épico.",
  },
  epico: {
    id: "epico",
    name: "Baú Épico Ametista",
    subtitle: "Glória dos Campeões Acadêmicos",
    icon: "💎",
    accentColor: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.7)",
    bgGradient: "from-purple-600 via-fuchsia-900 to-slate-950",
    coinsRange: [500, 800],
    xpRange: [600, 1000],
    guaranteedPacks: ["epico", "evento"],
    bonusShardsRange: [70, 120],
    specialBadgeTitle: "Vanguarda Épica",
    description: "Tesouro de grande valor com Pacote Épico e Pacote Especial de Evento.",
  },
  lendario: {
    id: "lendario",
    name: "Baú Lendário Dourado",
    subtitle: "Triunfo dos Melhores do IFES",
    icon: "🏆",
    accentColor: "#EAB308",
    glowColor: "rgba(234, 179, 8, 0.8)",
    bgGradient: "from-yellow-400 via-amber-600 to-slate-950",
    coinsRange: [900, 1500],
    xpRange: [1200, 2000],
    guaranteedPacks: ["lendario", "epico"],
    bonusShardsRange: [140, 220],
    specialBadgeTitle: "Lenda do Instituto Federal",
    description: "Cofre lendário reluzente! Garante 1 Pacote Lendário com cartas de raridade máxima.",
  },
  mitico: {
    id: "mitico",
    name: "Baú Mítico Cósmico",
    subtitle: "O Tesouro Supremo dos Deuses do Saber",
    icon: "🌌",
    accentColor: "#EC4899",
    glowColor: "rgba(236, 72, 153, 0.9)",
    bgGradient: "from-fuchsia-600 via-rose-700 to-indigo-950",
    coinsRange: [2000, 3500],
    xpRange: [2500, 4500],
    guaranteedPacks: ["dourado", "lendario"],
    bonusShardsRange: [300, 500],
    specialBadgeTitle: "Grão-Mestre Cósmico",
    description: "A maior recompensa existente em todo o APP-IFES: Pacote Dourado Imperial e milhares de moedas!",
  },
};

const CHESTS_STORAGE_KEY = "brain_studio_chests_vault_v3";

export interface UserChestsVault {
  chests: Record<ChestType, number>;
  totalChestsOpened: number;
}

export const INITIAL_CHESTS_VAULT: UserChestsVault = {
  chests: {
    madeira: 2, // 2 baús de madeira de boas-vindas
    prata: 1,
    ouro: 0,
    epico: 0,
    lendario: 0,
    mitico: 0,
  },
  totalChestsOpened: 0,
};

export function loadUserChests(): UserChestsVault {
  try {
    const raw = localStorage.getItem(CHESTS_STORAGE_KEY);
    if (raw) return { ...INITIAL_CHESTS_VAULT, ...JSON.parse(raw) };
  } catch {}
  return INITIAL_CHESTS_VAULT;
}

export function saveUserChests(vault: UserChestsVault): void {
  try {
    localStorage.setItem(CHESTS_STORAGE_KEY, JSON.stringify(vault));
  } catch {}
}

export function addChestToVault(chestType: ChestType, vault: UserChestsVault): UserChestsVault {
  const current = vault.chests[chestType] || 0;
  const updated = {
    ...vault,
    chests: {
      ...vault.chests,
      [chestType]: current + 1,
    },
  };
  saveUserChests(updated);
  return updated;
}

export function openChest(
  chestType: ChestType,
  vault: UserChestsVault
): {
  success: boolean;
  dropResult?: ChestDropResult;
  updatedVault: UserChestsVault;
} {
  const count = vault.chests[chestType] || 0;
  if (count <= 0) {
    return { success: false, updatedVault: vault };
  }

  const def = CHESTS_CONFIG[chestType] || CHESTS_CONFIG.madeira;

  const coins =
    Math.floor(Math.random() * (def.coinsRange[1] - def.coinsRange[0] + 1)) + def.coinsRange[0];
  const xp =
    Math.floor(Math.random() * (def.xpRange[1] - def.xpRange[0] + 1)) + def.xpRange[0];
  const starShards =
    Math.floor(Math.random() * (def.bonusShardsRange[1] - def.bonusShardsRange[0] + 1)) +
    def.bonusShardsRange[0];

  const dropResult: ChestDropResult = {
    chestType,
    coins,
    xp,
    packs: [...def.guaranteedPacks],
    starShards,
    badgeAwarded: def.specialBadgeTitle,
  };

  const updatedVault: UserChestsVault = {
    ...vault,
    chests: {
      ...vault.chests,
      [chestType]: count - 1,
    },
    totalChestsOpened: vault.totalChestsOpened + 1,
  };

  saveUserChests(updatedVault);

  return {
    success: true,
    dropResult,
    updatedVault,
  };
}
