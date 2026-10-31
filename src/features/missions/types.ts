import { CardPackType } from "../cards/types";
import { ChestType } from "../chests/types";

export type MissionType = "diaria" | "semanal" | "colecao" | "temporada";

export interface MissionDefinition {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardXp: number;
  rewardPack?: CardPackType;
  rewardChest?: ChestType;
  isClaimed: boolean;
  icon: string;
}
