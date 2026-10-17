import { PetType } from "../types";

export interface PetStageInfo {
  stageNumber: number;
  stageName: string;
  avatarEmoji: string;
  accessoryBadge: string;
  buffDescription: string;
  minLevel: number;
}

const PET_EMOJIS: Record<PetType, { base: string[]; names: string[] }> = {
  bunny: {
    base: ["🐰", "🐇", "✨🐰✨", "👑🐰👑"],
    names: ["Coelhinho Curioso", "Coelho Estudioso", "Lorde PomPom", "Coelho Ancestral Sábio"],
  },
  bird: {
    base: ["🐣", "🐥", "🦅", "🦉"],
    names: ["Pintinho Aprendiz", "Pássaro Leitor", "Águia Estrategista", "Coruja da Sabedoria"],
  },
  coruja: {
    base: ["🦉", "🦉✨", "👑🦉", "🏛️🦉🏛️"],
    names: ["Corujinha Curiosa", "Coruja Sábia", "Coruja da Sabedoria", "Coruja Erudita Ancestral"],
  },
  owl: {
    base: ["🦉", "🦉✨", "👑🦉", "🏛️🦉🏛️"],
    names: ["Corujinha Curiosa", "Coruja Sábia", "Coruja da Sabedoria", "Coruja Erudita Ancestral"],
  },
  raposa: {
    base: ["🦊", "🦊✨", "⚡🦊", "👑🦊👑"],
    names: ["Raposinha Ágil", "Raposa Astuta", "Estrategista Veloz", "Raposa Mística Lendária"],
  },
  fox: {
    base: ["🦊", "🦊✨", "⚡🦊", "👑🦊👑"],
    names: ["Raposinha Ágil", "Raposa Astuta", "Estrategista Veloz", "Raposa Mística Lendária"],
  },
  elephant: {
    base: ["🐘", "🐘✨", "👑🐘", "🐘💎"],
    names: ["Elefantinho da Memória", "Elefante Focado", "Guardião dos Registros", "Titã Gnosiológico"],
  },
  tiger: {
    base: ["🐯", "🐅", "⚡🐅", "🔥🐅🔥"],
    names: ["Tigrinho Veloz", "Tigre Persistente", "Guerreiro do Saber", "Predador de Desafios"],
  },
  gato_robo: {
    base: ["🐱", "🤖", "⚡🤖", "🚀🐱🤖"],
    names: ["Gatinho Aprendiz", "Gato-Robô Alfa", "Cibernético IFES", "Supercomputador Sentiente"],
  },
  cat: {
    base: ["🐱", "🤖", "⚡🤖", "🚀🐱🤖"],
    names: ["Gatinho Aprendiz", "Gato-Robô Alfa", "Cibernético IFES", "Supercomputador Sentiente"],
  },
  dragao_livro: {
    base: ["🦎", "🐉", "✨🐉✨", "🔥👑🐉👑🔥"],
    names: ["Dragãozinho de Biblioteca", "Dragão Guardião", "Dragão-Livro Mítico", "Soberano do Conhecimento"],
  },
  dragon: {
    base: ["🦎", "🐉", "✨🐉✨", "🔥👑🐉👑🔥"],
    names: ["Dragãozinho de Biblioteca", "Dragão Guardião", "Dragão-Livro Mítico", "Soberano do Conhecimento"],
  },
  custom: {
    base: ["🤖", "🚀", "🌟", "👑"],
    names: ["Mascote Sintético", "Androide Tutor", "Entidade Quântica", "Guardião Supremo"],
  },
};

export function getPetStageInfo(type: PetType = "bunny", level: number = 1): PetStageInfo {
  const category = PET_EMOJIS[type] || PET_EMOJIS.bunny;

  let stageIndex = 0;
  if (level >= 15) {
    stageIndex = 3;
  } else if (level >= 8) {
    stageIndex = 2;
  } else if (level >= 4) {
    stageIndex = 1;
  }

  const badges = ["🌱", "⭐", "🔮", "👑"];
  const buffs = [
    "+5% Ganho de XP em quizzes",
    "+10% Ganho de XP e +1 regeneração de energia",
    "+15% Ganho de XP e desconto na loja do app",
    "+25% XP, aura visual lendária e regeneração acelerada",
  ];

  return {
    stageNumber: stageIndex + 1,
    stageName: category.names[stageIndex] || "Companheiro Fiel",
    avatarEmoji: category.base[stageIndex] || "🐰",
    accessoryBadge: badges[stageIndex],
    buffDescription: buffs[stageIndex],
    minLevel: stageIndex === 0 ? 1 : stageIndex === 1 ? 4 : stageIndex === 2 ? 8 : 15,
  };
}
