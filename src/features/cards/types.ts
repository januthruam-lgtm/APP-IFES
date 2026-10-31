export type CardRarity = "comum" | "rara" | "epica" | "lendaria" | "mitica";

export interface CardDefinition {
  id: string; // Ex: "cientistas_01"
  collectionId: string; // Ex: "grandes_cientistas"
  collectionName: string;
  name: string;
  subtitle: string;
  rarity: CardRarity;
  isGolden: boolean; // Carta Dourada especial ultra-rara
  emoji: string;
  description: string;
  triviaFact: string; // Fato histórico/educacional
  eraOrField: string; // Ex: "Física Nuclear • Século XX"
  primaryColor: string;
  glowColor: string;
  dropRateWeight: number; // Peso relativo para cálculos de sorteio
}

export interface CardAlbumCollection {
  id: string;
  name: string;
  theme: string;
  category: "Ciências" | "Humanidades" | "Exatas" | "Tecnologia" | "Natureza";
  icon: string;
  description: string;
  unlockLevel: number;
  bannerGradient: string;
  totalCards: number; // Sempre 9 cartas por álbum (estilo Coin Master)
  cards: CardDefinition[];
  completionReward: {
    coins: number;
    xp: number;
    starShards: number;
    badgeTitle: string;
    chestType: "prata" | "ouro" | "epico" | "lendario" | "mitico";
  };
}

export type CardPackType =
  | "comum"
  | "raro"
  | "epico"
  | "lendario"
  | "evento"
  | "dourado";

export interface CardPackDefinition {
  id: CardPackType;
  name: string;
  tagline: string;
  cardCount: number; // Quantidade de cartas reveladas no pacote
  costCoins: number; // Custo em IF Coins (ou 0 se obtido apenas em eventos/missões)
  canBuyWithCoins: boolean;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  probabilities: {
    comum: number; // Porcentagem (ex: 70%)
    rara: number; // Porcentagem (ex: 22%)
    epica: number; // Porcentagem (ex: 6%)
    lendaria: number; // Porcentagem (ex: 1.8%)
    mitica: number; // Porcentagem (ex: 0.2%)
    goldenChance: number; // Chance extra de vir carta dourada (ex: 5%)
  };
  guaranteedRarity?: CardRarity;
  description: string;
}

export interface UserCardInventory {
  cards: Record<string, number>; // cardId -> quantidade de cópias possuídas (1 = carta ativa no álbum, 2+ = repetidas)
  starShards: number; // Fragmentos Estelares acumulados via reciclagem de repetidas
  completedCollections: string[]; // IDs de coleções finalizadas e já recompensadas
  claimedMilestones?: string[];
  totalPacksOpened: number;
  lastGoldenTradeDate?: string;
}

export interface CardTradeProposal {
  id: string;
  senderUid: string;
  senderName: string;
  senderCampus: string;
  senderAvatar: string;
  offeredCardId: string;
  requestedCardId: string;
  isGoldenTrade: boolean;
  status: "aberta" | "aceita" | "cancelada";
  createdAt: number;
  acceptedByUid?: string;
  acceptedByName?: string;
}

export interface CardDropResult {
  card: CardDefinition;
  isDuplicate: boolean;
  isNew: boolean;
  duplicateCount: number;
  shardsGrantedIfRecycled?: number;
}
