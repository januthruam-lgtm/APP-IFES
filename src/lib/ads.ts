// Camada de Abstração para Anúncios Premiados (Rewarded Ads)
// Implementação "fake" controlada para desenvolvimento, respeitando limite de 3/dia.
import { getFeatureFlags } from "./flags";

const ADS_STORAGE_KEY = "brain_studio_rewarded_ads_v1";
const MAX_DAILY_ADS = 3;

interface AdsState {
  date: string;
  watchedCount: number;
}

function getTodayString(): string {
  // Data no fuso America/Sao_Paulo
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function readAdsState(): AdsState {
  const today = getTodayString();
  if (typeof window === "undefined") return { date: today, watchedCount: 0 };
  try {
    const raw = localStorage.getItem(ADS_STORAGE_KEY);
    if (!raw) return { date: today, watchedCount: 0 };
    const parsed = JSON.parse(raw);
    if (parsed.date === today) return parsed;
    return { date: today, watchedCount: 0 };
  } catch {
    return { date: today, watchedCount: 0 };
  }
}

function saveAdsState(state: AdsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export interface RewardedAdResult {
  success: boolean;
  rewardType: "energy" | "xp";
  rewardAmount: number;
  remainingAdsToday: number;
  message: string;
}

export async function showRewardedAd(
  rewardType: "energy" | "xp" = "energy"
): Promise<RewardedAdResult> {
  const flags = getFeatureFlags();
  if (!flags.REWARDED_ADS_ENABLED) {
    return {
      success: false,
      rewardType,
      rewardAmount: 0,
      remainingAdsToday: 0,
      message: "Anúncios premiados desativados no momento.",
    };
  }

  const state = readAdsState();
  if (state.watchedCount >= MAX_DAILY_ADS) {
    return {
      success: false,
      rewardType,
      rewardAmount: 0,
      remainingAdsToday: 0,
      message: "Limite diário de 3 anúncios atingido. Volte amanhã!",
    };
  }

  // Simula o tempo de reprodução do anúncio premiado (1.5 segundos)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const newCount = state.watchedCount + 1;
  saveAdsState({ date: state.date, watchedCount: newCount });

  const rewardAmount = rewardType === "energy" ? 15 : 40;

  return {
    success: true,
    rewardType,
    rewardAmount,
    remainingAdsToday: Math.max(0, MAX_DAILY_ADS - newCount),
    message: `Parabéns! Você ganhou +${rewardAmount} ${rewardType === "energy" ? "Energia ⚡" : "XP ⭐"}!`,
  };
}

export function getRemainingAdsToday(): number {
  const state = readAdsState();
  return Math.max(0, MAX_DAILY_ADS - state.watchedCount);
}
