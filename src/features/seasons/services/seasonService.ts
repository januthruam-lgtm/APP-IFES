import { CURRENT_SEASON } from "../data/seasonsData";
import { SeasonTierReward, UserSeasonProgress } from "../types";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SEASON_STORAGE_KEY = "brain_studio_season_progress_v3";

export function loadUserSeasonProgress(
  seasonId: string = CURRENT_SEASON.id,
  uid?: string
): UserSeasonProgress {
  try {
    const raw = localStorage.getItem(`${SEASON_STORAGE_KEY}_${seasonId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  return {
    seasonId,
    currentTier: 4, // Nível 4 inicial para já ter tiers desbloqueados
    seasonXp: 950,
    claimedTiers: [1, 2], // Níveis 1 e 2 pré-reivindicados
  };
}

export function saveUserSeasonProgress(prog: UserSeasonProgress, uid?: string): void {
  try {
    localStorage.setItem(`${SEASON_STORAGE_KEY}_${prog.seasonId}`, JSON.stringify(prog));
  } catch {}

  if (db && uid && uid !== "local_student") {
    try {
      const docRef = doc(db, "temporadaUsuario", uid);
      setDoc(docRef, { ...prog, updatedAt: Date.now() }, { merge: true }).catch(() => {});
    } catch {}
  }
}

export function addSeasonXp(amount: number, prog: UserSeasonProgress): UserSeasonProgress {
  const newXp = prog.seasonXp + amount;
  // Calcula o nível da temporada (cada 200 XP = 1 nível, até 30)
  const newTier = Math.min(30, Math.floor(newXp / 200) + 1);

  const updated = {
    ...prog,
    seasonXp: newXp,
    currentTier: newTier,
  };

  saveUserSeasonProgress(updated);
  return updated;
}

export function claimSeasonTier(
  tierLevel: number,
  prog: UserSeasonProgress
): {
  success: boolean;
  reward?: SeasonTierReward["freeReward"];
  updatedProgress: UserSeasonProgress;
} {
  const tier = CURRENT_SEASON.tiers.find((t) => t.level === tierLevel);
  if (!tier) return { success: false, updatedProgress: prog };

  if (prog.claimedTiers.includes(tierLevel)) {
    return { success: false, updatedProgress: prog };
  }

  if (prog.currentTier < tierLevel) {
    return { success: false, updatedProgress: prog };
  }

  const updatedProgress: UserSeasonProgress = {
    ...prog,
    claimedTiers: [...prog.claimedTiers, tierLevel],
  };

  saveUserSeasonProgress(updatedProgress);

  return {
    success: true,
    reward: tier.freeReward,
    updatedProgress,
  };
}
