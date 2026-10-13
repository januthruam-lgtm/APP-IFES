import { FlashcardItem } from "../types";

export interface DeckInfo {
  id: string;
  title: string;
  description: string;
  courseName: string;
  subjectName?: string;
  cardCount: number;
  icon?: string;
  category?: string;
}

export const DEFAULT_OFFLINE_DECKS: DeckInfo[] = [
  {
    id: "deck-adm-geral",
    title: "Teorias da Administração & Taylorismo",
    description: "Conceitos fundamentais da Teoria Clássica, Científica e Burocracia de Weber.",
    courseName: "Introdução à Administração",
    subjectName: "Introdução à Administração",
    cardCount: 12,
    icon: "📈",
    category: "Administração",
  },
  {
    id: "deck-logica-prog",
    title: "Estruturas de Dados & Algoritmos IFES",
    description: "Vetores, matrizes, funções, recursividade e complexidade assintótica.",
    courseName: "Lógica de Programação",
    subjectName: "Lógica de Programação",
    cardCount: 15,
    icon: "💻",
    category: "Informática",
  },
  {
    id: "deck-portugues-inst",
    title: "Comunicação Oficial & Coesão Textual",
    description: "Normas de redação técnica, concordância e conectivos argumentativos.",
    courseName: "Português Instrumental",
    subjectName: "Português Instrumental",
    cardCount: 10,
    icon: "✍️",
    category: "Comunicação",
  },
  {
    id: "deck-gestao-qualidade",
    title: "Ciclo PDCA, 5S e Ferramentas da Qualidade",
    description: "Diagrama de Ishikawa, Pareto, Diagrama de Dispersão e Filosofia Kaizen.",
    courseName: "Gestão da Qualidade",
    subjectName: "Gestão da Qualidade",
    cardCount: 14,
    icon: "🎯",
    category: "Gestão",
  },
];

export const DEFAULT_OFFLINE_FLASHCARDS: FlashcardItem[] = [
  {
    id: "fc-adm-1",
    deckId: "deck-adm-geral",
    front: "O que preconiza a Teoria da Administração Científica de Taylor?",
    back: "Foco na eficiência operacional através da divisão do trabalho, padronização de tarefas e estudo dos tempos e movimentos.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "fc-adm-2",
    deckId: "deck-adm-geral",
    front: "Quais são as 4 funções administrativas clássicas segundo Fayol?",
    back: "Planejar, Organizar, Dirigir (Comandar/Coordenar) e Controlar (PODC).",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "fc-prog-1",
    deckId: "deck-logica-prog",
    front: "Qual a diferença entre uma variável e uma constante?",
    back: "A variável armazena valores mutáveis durante a execução do programa, enquanto uma constante tem valor imutável após sua inicialização.",
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split("T")[0],
  },
];
