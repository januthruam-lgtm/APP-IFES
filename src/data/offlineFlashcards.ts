export interface DeckInfo {
  id: string;
  title: string;
  category: string;
  cardsCount: number;
  cardCount?: number;
  icon?: string;
  subjectName?: string;
  description: string;
  cards: {
    question: string;
    answer: string;
  }[];
}

export const OFFLINE_DECKS: DeckInfo[] = [
  {
    id: "deck-alg-1",
    title: "Estruturas de Dados e Algoritmos",
    category: "Informática",
    cardsCount: 12,
    cardCount: 12,
    icon: "💻",
    subjectName: "Algoritmos e Dados",
    description: "Conceitos de Pilhas, Filas, Listas Encadeadas, Árvores Binárias e Complexidade Big-O.",
    cards: [
      { question: "O que é uma Pilha (Stack) e qual sua política de acesso?", answer: "É uma estrutura LIFO (Last In, First Out). O último elemento inserido é o primeiro a ser removido." },
      { question: "Qual a diferença de complexidade entre busca binária e linear?", answer: "Busca linear tem complexidade O(n), enquanto a busca binária em vetor ordenado tem complexidade O(log n)." },
      { question: "O que caracteriza uma Fila (Queue)?", answer: "Política FIFO (First In, First Out) onde elementos entram no fim e saem do início." },
    ],
  },
  {
    id: "deck-calc-1",
    title: "Cálculo Diferencial e Integral",
    category: "Matemática",
    cardsCount: 14,
    cardCount: 14,
    icon: "📐",
    subjectName: "Cálculo I",
    description: "Derivadas, Regra da Cadeia, Limites fundamentais e Integrais imediatas.",
    cards: [
      { question: "Qual é a derivada de f(x) = e^(2x)?", answer: "Pela regra da cadeia: f'(x) = 2 * e^(2x)." },
      { question: "O que representa geometricamente a derivada em um ponto?", answer: "Representa a inclinação da reta tangente à curva da função naquele ponto." },
    ],
  },
  {
    id: "deck-redes-1",
    title: "Redes e Protocolos de Comunicação",
    category: "Informática",
    cardsCount: 10,
    cardCount: 10,
    icon: "🌐",
    subjectName: "Redes de Computadores",
    description: "Modelo OSI, TCP/IP, DNS, HTTP/HTTPS e roteamento.",
    cards: [
      { question: "Quantas camadas tem o modelo OSI?", answer: "Possui 7 camadas: Física, Enlace, Rede, Transporte, Sessão, Apresentação e Aplicação." },
      { question: "Qual a diferença principal entre TCP e UDP?", answer: "TCP é orientado a conexão e garante entrega; UDP é não orientado a conexão, priorizando baixa latência." },
    ],
  },
];
