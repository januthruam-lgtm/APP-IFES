import { UserProfile, UserPet, CourseDefinition } from "../types";

export const INITIAL_PET: UserPet = {
  name: "Corujinha Byte",
  type: "owl",
  level: 1,
  exp: 0,
  experience: 0,
  maxExp: 100,
  happiness: 85,
  hunger: 10,
  energy: 100,
  totalMeals: 3,
  lastFedTimestamp: new Date().toISOString(),
  lastFed: new Date().toISOString(),
  unlockedPets: ["owl", "bunny"],
};

export function createBlankUser(name?: string, email?: string): UserProfile {
  return {
    email: email || "aluno@ifes.edu.br",
    name: name || "Estudante IFES",
    xp: 250,
    coins: 100,
    level: 1,
    energy: 50,
    maxEnergy: 50,
    lastEnergyRecharge: new Date().toISOString(),
    streakDays: 1,
    lastActiveDate: new Date().toISOString(),
    selectedCourseId: "empty-course",
    teamId: null,
    activeTheme: "cyber_green",
    unlockedThemes: ["cyber_green", "paper_focus", "sakura_warm", "sunset_amber"],
    pet: INITIAL_PET,
    equippedBadge: "calouro_ifes",
    unlockedBadges: ["calouro_ifes"],
    unlockedCards: ["card-1", "card-2"],
    completedModules: [],
    stats: {
      socraticInteractions: 0,
      quizzesAnswered: 0,
      correctQuizzes: 0,
      battlesWon: 0,
      battlesTotal: 0,
      flashcardsReviewed: 0,
    },
  };
}

export const INITIAL_USER: UserProfile = createBlankUser();

export const COURSES_CATALOG: CourseDefinition[] = [
  {
    id: "algoritmos-1",
    name: "Algoritmos e Estruturas de Dados",
    icon: "💻",
    category: "Informática",
    description: "Lógica de programação, matrizes, ordenação e estruturas dinâmicas.",
    color: "#22c55e",
    accentBg: "rgba(34, 197, 94, 0.15)",
    tags: ["Programação", "IFES", "Algoritmos"],
    modules: [],
  },
  {
    id: "matematica-1",
    name: "Matemática Aplicada",
    icon: "📐",
    category: "Exatas",
    description: "Funções, limites, trigonometria e cálculo vetorial.",
    color: "#3b82f6",
    accentBg: "rgba(59, 130, 246, 0.15)",
    tags: ["Matemática", "Cálculo", "IFES"],
    modules: [],
  },
];
