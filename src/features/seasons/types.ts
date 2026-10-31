import { CardPackType } from "../cards/types";
import { ChestType } from "../chests/types";

export interface SeasonTierReward {
  level: number;
  xpRequired: number;
  freeReward: {
    type: "coins" | "xp" | "pack" | "chest" | "shards" | "badge";
    amount: number;
    label: string;
    packType?: CardPackType;
    chestType?: ChestType;
    badgeTitle?: string;
    icon: string;
  };
}

export interface SeasonDefinition {
  id: string;
  number: number;
  title: string;
  theme: string;
  description: string;
  bannerGradient: string;
  startsAt: number;
  endsAt: number;
  totalTiers: number;
  tiers: SeasonTierReward[];
  seasonBadge: string;
}

export interface UserSeasonProgress {
  seasonId: string;
  currentTier: number;
  seasonXp: number;
  claimedTiers: number[];
}
