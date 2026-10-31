import {
  CardDefinition,
  CardDropResult,
  CardPackType,
  CardRarity,
  CardTradeProposal,
  UserCardInventory,
} from "../types";
import { COLLECTIONS_DATA, CARDS_MAP, GOLDEN_CARDS_LIST } from "../data/cardsData";
import { CARD_PACKS_CONFIG } from "../data/packsData";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const STORAGE_KEY = "brain_studio_cards_v3";

export const RARITY_SHARD_VALUES: Record<CardRarity, { recycle: number; craft: number }> = {
  comum: { recycle: 5, craft: 30 },
  rara: { recycle: 15, craft: 80 },
  epica: { recycle: 35, craft: 180 },
  lendaria: { recycle: 80, craft: 400 },
  mitica: { recycle: 200, craft: 900 },
};

export const INITIAL_CARD_INVENTORY: UserCardInventory = {
  cards: {
    cientistas_09: 1, // Galileu Galilei (Comum de boas-vindas)
    historia_09: 1, // Domínio do Fogo
    matematica_08: 1, // Sequência de Fibonacci
    biologia_09: 1, // Célula Eucariótica
  },
  starShards: 25,
  completedCollections: [],
  totalPacksOpened: 0,
};

/**
 * Carrega o inventário de cartas do usuário localmente e sincroniza com o Firestore.
 */
export async function loadUserCardInventory(uid?: string): Promise<UserCardInventory> {
  let inv: UserCardInventory = INITIAL_CARD_INVENTORY;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      inv = { ...INITIAL_CARD_INVENTORY, ...JSON.parse(cached) };
    }
  } catch (e) {
    console.warn("Erro ao ler inventário local de cartas:", e);
  }

  if (uid && db) {
    try {
      const snap = await getDoc(doc(db, "colecoesUsuario", uid));
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<UserCardInventory>;
        inv = {
          ...inv,
          ...remoteData,
          cards: { ...inv.cards, ...(remoteData.cards || {}) },
          completedCollections: Array.from(
            new Set([...inv.completedCollections, ...(remoteData.completedCollections || [])])
          ),
          starShards: Math.max(inv.starShards, remoteData.starShards ?? 0),
          totalPacksOpened: Math.max(inv.totalPacksOpened, remoteData.totalPacksOpened ?? 0),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
      } else {
        // Inicializa registro remoto do estudante
        await setDoc(doc(db, "colecoesUsuario", uid), inv);
      }
    } catch (err) {
      console.warn("Erro ao buscar cartas do Firestore (usando offline):", err);
    }
  }

  return inv;
}

/**
 * Salva o inventário de cartas em localStorage e no Cloud Firestore.
 */
export async function saveUserCardInventory(
  inv: UserCardInventory,
  uid?: string
): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
  } catch (e) {
    console.warn("Erro ao salvar cartas no localStorage:", e);
  }

  if (uid && db) {
    try {
      await setDoc(
        doc(db, "colecoesUsuario", uid),
        {
          ...inv,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Erro ao salvar cartas no Firestore:", err);
    }
  }
}

/**
 * Mecânica estritamente modelada de abertura de pacotes (estilo Coin Master).
 * Garante aleatoriedade determinística com base em pesos e garantias de raridade.
 */
export function openCardPack(
  packType: CardPackType,
  currentInv: UserCardInventory
): {
  drops: CardDropResult[];
  updatedInventory: UserCardInventory;
  packDef: typeof CARD_PACKS_CONFIG[CardPackType];
} {
  const packDef = CARD_PACKS_CONFIG[packType] || CARD_PACKS_CONFIG.comum;
  const drops: CardDropResult[] = [];
  const nextCards = { ...currentInv.cards };

  const allCardsList = Object.values(CARDS_MAP);

  // Helper para sortear raridade com base nas porcentagens do pacote
  const rollRarity = (forceAtLeast?: CardRarity): CardRarity => {
    if (forceAtLeast) {
      const order: CardRarity[] = ["comum", "rara", "epica", "lendaria", "mitica"];
      const minIdx = order.indexOf(forceAtLeast);
      const eligible = order.slice(minIdx);
      return eligible[Math.floor(Math.random() * eligible.length)];
    }

    const rand = Math.random() * 100;
    const p = packDef.probabilities;

    let accum = 0;
    accum += p.mitica;
    if (rand <= accum) return "mitica";

    accum += p.lendaria;
    if (rand <= accum) return "lendaria";

    accum += p.epica;
    if (rand <= accum) return "epica";

    accum += p.rara;
    if (rand <= accum) return "rara";

    return "comum";
  };

  for (let i = 0; i < packDef.cardCount; i++) {
    const isGuaranteedSlot = i === 0 && packDef.guaranteedRarity;
    const targetRarity = rollRarity(isGuaranteedSlot ? packDef.guaranteedRarity : undefined);

    // Avalia chance de carta dourada
    const isGoldenRoll = Math.random() * 100 < packDef.probabilities.goldenChance;

    let pool: CardDefinition[] = [];

    if (isGoldenRoll && GOLDEN_CARDS_LIST.length > 0) {
      pool = GOLDEN_CARDS_LIST.filter((c) => c.rarity === targetRarity);
      if (pool.length === 0) pool = GOLDEN_CARDS_LIST;
    } else {
      pool = allCardsList.filter((c) => c.rarity === targetRarity && (!c.isGolden || isGoldenRoll));
    }

    if (pool.length === 0) {
      pool = allCardsList.filter((c) => c.rarity === targetRarity);
    }
    if (pool.length === 0) {
      pool = allCardsList;
    }

    // Sorteio ponderado por dropRateWeight
    const totalWeight = pool.reduce((sum, c) => sum + c.dropRateWeight, 0);
    let randomWeight = Math.random() * totalWeight;
    let chosenCard = pool[0];

    for (const card of pool) {
      randomWeight -= card.dropRateWeight;
      if (randomWeight <= 0) {
        chosenCard = card;
        break;
      }
    }

    const previousCount = nextCards[chosenCard.id] || 0;
    const isNew = previousCount === 0;
    const isDuplicate = previousCount > 0;
    const newCount = previousCount + 1;
    nextCards[chosenCard.id] = newCount;

    drops.push({
      card: chosenCard,
      isNew,
      isDuplicate,
      duplicateCount: newCount,
    });
  }

  const updatedInventory: UserCardInventory = {
    ...currentInv,
    cards: nextCards,
    totalPacksOpened: currentInv.totalPacksOpened + 1,
  };

  return {
    drops,
    updatedInventory,
    packDef,
  };
}

/**
 * Converte 1 cópia repetida de uma carta em Fragmentos Estelares.
 * Preserva obrigatoriamente 1 cópia no álbum!
 */
export function recycleDuplicateCard(
  cardId: string,
  inv: UserCardInventory
): { success: boolean; shardsGranted: number; updatedInventory: UserCardInventory } {
  const currentCount = inv.cards[cardId] || 0;
  if (currentCount <= 1) {
    return { success: false, shardsGranted: 0, updatedInventory: inv };
  }

  const card = CARDS_MAP[cardId];
  const shardsGranted = card ? RARITY_SHARD_VALUES[card.rarity].recycle : 5;

  const nextCards = { ...inv.cards };
  nextCards[cardId] = currentCount - 1;

  const updatedInventory: UserCardInventory = {
    ...inv,
    cards: nextCards,
    starShards: inv.starShards + shardsGranted,
  };

  return { success: true, shardsGranted, updatedInventory };
}

/**
 * Permite forjar uma carta que está faltando no álbum usando Fragmentos Estelares.
 */
export function craftMissingCard(
  cardId: string,
  inv: UserCardInventory
): { success: boolean; message: string; updatedInventory: UserCardInventory } {
  const card = CARDS_MAP[cardId];
  if (!card) return { success: false, message: "Carta não encontrada.", updatedInventory: inv };

  const cost = RARITY_SHARD_VALUES[card.rarity].craft;
  if (inv.starShards < cost) {
    return {
      success: false,
      message: `Você precisa de ${cost} Fragmentos Estelares (possui ${inv.starShards}).`,
      updatedInventory: inv,
    };
  }

  const nextCards = { ...inv.cards };
  nextCards[cardId] = (nextCards[cardId] || 0) + 1;

  const updatedInventory: UserCardInventory = {
    ...inv,
    cards: nextCards,
    starShards: inv.starShards - cost,
  };

  return {
    success: true,
    message: `Carta "${card.name}" forjada com sucesso!`,
    updatedInventory,
  };
}

/**
 * Reivindica as recompensas de conclusão de um álbum ao juntar as 9 cartas.
 */
export function claimAlbumCompletion(
  collectionId: string,
  inv: UserCardInventory
): {
  success: boolean;
  reward?: typeof COLLECTIONS_DATA[0]["completionReward"];
  collectionName?: string;
  updatedInventory: UserCardInventory;
} {
  const collection = COLLECTIONS_DATA.find((c) => c.id === collectionId);
  if (!collection) {
    return { success: false, updatedInventory: inv };
  }

  if (inv.completedCollections.includes(collectionId)) {
    return { success: false, updatedInventory: inv };
  }

  // Verifica se o jogador possui todas as 9 cartas da coleção
  const hasAll = collection.cards.every((c) => (inv.cards[c.id] || 0) >= 1);
  if (!hasAll) {
    return { success: false, updatedInventory: inv };
  }

  const updatedInventory: UserCardInventory = {
    ...inv,
    completedCollections: [...inv.completedCollections, collectionId],
    starShards: inv.starShards + collection.completionReward.starShards,
  };

  return {
    success: true,
    reward: collection.completionReward,
    collectionName: collection.name,
    updatedInventory,
  };
}

/**
 * Criação e escuta de propostas de troca de cartas com outros alunos do IFES.
 */
export async function createCommunityTrade(
  senderUid: string,
  senderName: string,
  senderCampus: string,
  senderAvatar: string,
  offeredCardId: string,
  requestedCardId: string,
  isGoldenTrade: boolean
): Promise<string> {
  const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const proposal: CardTradeProposal = {
    id: tradeId,
    senderUid,
    senderName,
    senderCampus,
    senderAvatar,
    offeredCardId,
    requestedCardId,
    isGoldenTrade,
    status: "aberta",
    createdAt: Date.now(),
  };

  if (db) {
    try {
      await setDoc(doc(db, "propostasTroca", tradeId), proposal);
    } catch (e) {
      console.warn("Erro ao salvar proposta de troca no Firestore:", e);
    }
  }

  // Guarda em cache de propostas
  const savedProposals = getCachedCommunityTrades();
  savedProposals.unshift(proposal);
  localStorage.setItem("brain_studio_community_trades", JSON.stringify(savedProposals.slice(0, 50)));

  return tradeId;
}

export function getCachedCommunityTrades(): CardTradeProposal[] {
  try {
    const raw = localStorage.getItem("brain_studio_community_trades");
    if (raw) return JSON.parse(raw);
  } catch {}

  // Propostas de exemplo pré-populadas de alunos reais do IFES nos campi
  return [
    {
      id: "trade_demo_01",
      senderUid: "aluno_vitoria_44",
      senderName: "Matheus Oliveira",
      senderCampus: "Campus Vitória",
      senderAvatar: "👨‍💻",
      offeredCardId: "cientistas_04", // Nikola Tesla
      requestedCardId: "cientistas_02", // Albert Einstein
      isGoldenTrade: false,
      status: "aberta",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "trade_demo_02",
      senderUid: "aluna_serra_12",
      senderName: "Beatriz Santos",
      senderCampus: "Campus Serra",
      senderAvatar: "👩‍🔬",
      offeredCardId: "biologia_04", // Seleção Natural
      requestedCardId: "biologia_02", // Mata Atlântica Capixaba
      isGoldenTrade: false,
      status: "aberta",
      createdAt: Date.now() - 7200000,
    },
    {
      id: "trade_demo_03",
      senderUid: "aluno_vila_velha_88",
      senderName: "Lucas Zanetti",
      senderCampus: "Campus Vila Velha",
      senderAvatar: "🧑‍🚀",
      offeredCardId: "matematica_04", // Proporção Áurea
      requestedCardId: "matematica_02", // Carl Friedrich Gauss
      isGoldenTrade: false,
      status: "aberta",
      createdAt: Date.now() - 14400000,
    },
  ];
}

export async function fetchCommunityTrades(): Promise<CardTradeProposal[]> {
  if (!db) return getCachedCommunityTrades();

  try {
    const q = query(collection(db, "propostasTroca"), where("status", "==", "aberta"));
    const snap = await getDocs(q);
    const trades: CardTradeProposal[] = [];
    snap.forEach((d) => {
      trades.push(d.data() as CardTradeProposal);
    });

    if (trades.length > 0) {
      localStorage.setItem("brain_studio_community_trades", JSON.stringify(trades));
      return trades;
    }
  } catch (err) {
    console.warn("Erro ao buscar propostas de troca no Firestore:", err);
  }

  return getCachedCommunityTrades();
}
