import { CardPackType } from "../cards/types";
import { ChestType } from "../chests/types";

export type TournamentType =
  | "xp"
  | "conhecimento"
  | "colecionadores"
  | "construcao"
  | "relampago"
  | "minigames";

export type LeagueTier =
  | "bronze"
  | "prata"
  | "ouro"
  | "platina"
  | "diamante"
  | "mestre"
  | "lendario";

export interface LeagueTierConfig {
  id: LeagueTier;
  name: string;
  minPoints: number;
  icon: string;
  badgeColor: string;
  borderColor: string;
  promotionTopPercent: number; // Ex: Top 20% sobem de liga
  demotionBottomPercent: number; // Ex: Bottom 10% caem de liga
}

export interface TournamentLeaderboardEntry {
  rank: number;
  uid: string;
  name: string;
  avatar: string;
  matricula: string;
  campus: string;
  points: number;
  league: LeagueTier;
  changeDirection?: "up" | "down" | "same";
}

export interface TournamentDefinition {
  id: string;
  type: TournamentType;
  title: string;
  subtitle: string;
  tagline: string;
  icon: string;
  bannerGradient: string;
  accentColor: string;
  startsAt: number;
  endsAt: number;
  durationHours: number;
  userRank: number;
  userPoints: number;
  prizes: {
    top1: { coins: number; xp: number; chest: ChestType; pack: CardPackType; title: string };
    top2_3: { coins: number; xp: number; chest: ChestType; pack: CardPackType };
    top4_10: { coins: number; xp: number; chest: ChestType; pack: CardPackType };
    top11_50: { coins: number; xp: number; pack: CardPackType };
  };
}
