import { UserProfile, UserPet } from "../types";

export const INITIAL_PET: UserPet = {
  id: "coruja",
  type: "coruja",
  activePetId: "coruja",
  name: "Athena",
  level: 1,
  exp: 0,
  maxExp: 100,
  happiness: 95,
  hunger: 90,
  energy: 100,
  totalMeals: 0,
  lastFedTimestamp: new Date().toISOString(),
  unlockedPets: ["coruja"],
  customAccessory: "none",
  customSpeciesName: "Coruja da Sabedoria",
};

export const createBlankUser = (name?: string, email?: string): UserProfile => ({
  email: email?.trim() || "",
  name: name?.trim() || "Estudante",
  xp: 150,
  coins: 75,
  level: 1,
  energy: 50,
  maxEnergy: 50,
  lastEnergyRecharge: new Date().toISOString(),
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  streakHistory: [
    {
      date: new Date().toISOString().split("T")[0],
      activitiesCount: 1,
      xpGained: 50,
    },
  ],
  selectedCourseId: "adm-101",
  teamId: null,
  activeTheme: "paper",
  unlockedThemes: ["default", "paper", "solar", "emerald", "cyberpunk", "nordic", "dark"],
  pet: INITIAL_PET,
  unlockedCards: ["card-socrates-01", "card-focus-boost"],
  equippedBadge: "🎓 Ingressante IFES",
  unlockedBadges: ["🎓 Ingressante IFES", "⚡ Primeiro Passo"],
  completedModules: [],
  stats: {
    socraticInteractions: 0,
    quizzesAnswered: 0,
    correctQuizzes: 0,
    battlesWon: 0,
    battlesTotal: 0,
    flashcardsReviewed: 0,
    energyDonated: 0,
  },
  notificationPreferences: {
    enabled: true,
    enableNewContent: true,
    enableTeamMessages: true,
    enableDeadlines: true,
    leadTimePreset: "1h",
    customLeadTimeValue: 1,
    customLeadTimeUnit: "hours",
    webPushSubscribed: false,
  },
});

export const INITIAL_USER: UserProfile = createBlankUser();
