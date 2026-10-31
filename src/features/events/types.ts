import { CardPackType } from "../cards/types";
import { ChestType } from "../chests/types";

export type EventType =
  | "milestone"
  | "tournament"
  | "card_festival"
  | "team_challenge"
  | "season"
  | "surprise_boost";

export type EventPointsMetric =
  | "quizzes"
  | "minigames"
  | "cards"
  | "construction"
  | "all_activities";

export interface EventMilestone {
  step: number; // 1 a 10
  pointsRequired: number;
  rewardType: "coins" | "xp" | "pack" | "chest" | "shards" | "badge";
  rewardAmount: number;
  rewardLabel: string;
  packType?: CardPackType;
  chestType?: ChestType;
  badgeTitle?: string;
  icon: string;
  color: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  type: EventType;
  bannerGradient: string;
  accentColor: string;
  startsAt: number; // Timestamp UNIX
  endsAt: number; // Timestamp UNIX
  durationHours: number;
  pointsMetric: EventPointsMetric;
  metricDescription: string;
  milestones: EventMilestone[];
  activeMultipliers?: {
    xp?: number;
    coins?: number;
  };
}

export interface SurpriseBoost {
  id: string;
  title: string;
  description: string;
  multiplier: number; // ex: 2 (para 2x)
  metric: "xp" | "coins" | "event_points";
  endsAt: number;
  icon: string;
  color: string;
}

export interface UserEventParticipation {
  eventId: string;
  uid: string;
  points: number;
  claimedMilestones: number[]; // array com os números dos steps já reivindicados
  lastUpdatedAt: number;
}
