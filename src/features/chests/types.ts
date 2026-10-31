import { CardPackType } from "../cards/types";

export type ChestType = "madeira" | "prata" | "ouro" | "epico" | "lendario" | "mitico";

export interface ChestDefinition {
  id: ChestType;
  name: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  coinsRange: [number, number];
  xpRange: [number, number];
  guaranteedPacks: CardPackType[];
  bonusShardsRange: [number, number];
  specialBadgeTitle?: string;
  description: string;
}

export interface ChestDropResult {
  chestType: ChestType;
  coins: number;
  xp: number;
  packs: CardPackType[];
  starShards: number;
  badgeAwarded?: string;
}
