import type { PetType } from "../../types";

export interface StarterPetOption {
  type: PetType;
  defaultName: string;
  emoji: string;
  badge: string;
  description: string;
  trait: string;
}

export const STARTER_PETS: StarterPetOption[] = [
  {
    type: "coruja",
    defaultName: "Athena",
    emoji: "🦉",
    badge: "Sabedoria & Síntese",
    description: "Símbolo ancestral da sabedoria acadêmica do IFES. Vigia com carinho cada sessão noturna de estudos.",
    trait: "+10% de ganho de XP em tarefas",
  },
  {
    type: "bunny",
    defaultName: "Bolin",
    emoji: "🐰",
    badge: "Agilidade & Foco",
    description: "Rápido nas revisões de flashcards e sempre alerta para sessões de estudo focadas.",
    trait: "+10% de agilidade em revisões",
  },
  {
    type: "raposa",
    defaultName: "Foxy",
    emoji: "🦊",
    badge: "Astúcia & Lógica",
    description: "Veloz e perspicaz na resolução de problemas matemáticos e exercícios práticos.",
    trait: "+15% de velocidade de resposta",
  },
  {
    type: "bird",
    defaultName: "Piu",
    emoji: "🐦",
    badge: "Visão & Síntese",
    description: "Perspicaz e com visão panorâmica sobre módulos longos e mapas conceituais.",
    trait: "+10% de absorção de leitura",
  },
  {
    type: "elephant",
    defaultName: "Pipoca",
    emoji: "🐘",
    badge: "Memória Lendária",
    description: "Guarda todos os conceitos na memória de longo prazo para as provas do semestre.",
    trait: "+20% de retenção de conceitos",
  },
  {
    type: "tiger",
    defaultName: "Tigrão",
    emoji: "🐯",
    badge: "Garra & Força",
    description: "Determinado e competitivo, adora questionários difíceis e desafios lógicos.",
    trait: "+15% de precisão em simulados",
  },
  {
    type: "gato_robo",
    defaultName: "Byte",
    emoji: "🤖",
    badge: "Precisão & Cálculo",
    description: "Forjado nos laboratórios de informática do IFES. Otimiza cada ciclo de aprendizado.",
    trait: "Economiza energia em sessões de estudo",
  },
  {
    type: "dragao_livro",
    defaultName: "Draco",
    emoji: "🐉",
    badge: "Mestria Ancestral",
    description: "Guardião místico dos acervos bibliotecários do IFES. Inspira foco e concentração profunda.",
    trait: "+25% de bônus de XP em leituras densas",
  },
];