export interface AnagramWord {
  id: string;
  word: string;
  category: "Português" | "Inglês" | "Administração" | "Conhecimentos Gerais";
  hint: string;
}

export interface SecretTermWord {
  id: string;
  word: string; // Caixa alta, sem acento para digitação
  displayWord: string; // Exibição com acentos
  category: "Português" | "Inglês" | "Administração" | "Conhecimentos Gerais";
  clue: string;
  context: string;
}

export interface WordSearchGridDefinition {
  id: string;
  title: string;
  category: string;
  gridSize: number; // ex: 10x10
  gridLetters: string[][];
  targetWords: { word: string; start: [number, number]; end: [number, number] }[];
}

export const ANAGRAM_WORDS: AnagramWord[] = [
  { id: "an_1", word: "CIENCIA", category: "Conhecimentos Gerais", hint: "Investigação sistemática da realidade" },
  { id: "an_2", word: "METODO", category: "Administração", hint: "Caminho ordenado para atingir um objetivo" },
  { id: "an_3", word: "ESTUDO", category: "Português", hint: "Dedicação para aquisição de conhecimentos" },
  { id: "an_4", word: "GESTAO", category: "Administração", hint: "Arte de planejar, liderar e coordenar recursos" },
  { id: "an_5", word: "CAMPUS", category: "Conhecimentos Gerais", hint: "Espaço universitário e acadêmico do IFES" },
  { id: "an_6", word: "LOGICA", category: "Conhecimentos Gerais", hint: "Coerência do pensamento racional" },
  { id: "an_7", word: "SYSTEM", category: "Inglês", hint: "Conjunto integrado de elementos interdependentes" },
  { id: "an_8", word: "LEADER", category: "Inglês", hint: "Pessoa que inspira e orienta uma equipe" },
  { id: "an_9", word: "PROJETO", category: "Administração", hint: "Esforço temporário para criar um resultado único" },
  { id: "an_10", word: "INCLUSAO", category: "Português", hint: "Garantia de participação e direitos a todos" },
];

export const SECRET_TERMS: SecretTermWord[] = [
  {
    id: "sec_1",
    word: "MOODLE",
    displayWord: "Moodle",
    category: "Conhecimentos Gerais",
    clue: "Ambiente virtual de aprendizagem utilizado pelo IFES",
    context: "Plataforma de ensino a distância e envio de atividades.",
  },
  {
    id: "sec_2",
    word: "KANBAN",
    displayWord: "Kanban",
    category: "Administração",
    clue: "Sistema visual de cartões originado na manufatura enxuta",
    context: "Usado em metodologias ágeis com colunas de tarefas.",
  },
  {
    id: "sec_3",
    word: "PYTHON",
    displayWord: "Python",
    category: "Inglês",
    clue: "Linguagem de programação de alto nível muito usada em IA e ciência de dados",
    context: "Sintaxe limpa e foco em legibilidade de código.",
  },
  {
    id: "sec_4",
    word: "SWOT",
    displayWord: "SWOT",
    category: "Administração",
    clue: "Acrônimo inglês para forças, fraquezas, oportunidades e ameaças",
    context: "Análise estratégica desenvolvida em Harvard e Stanford.",
  },
  {
    id: "sec_5",
    word: "PROXIMA",
    displayWord: "Próxima",
    category: "Português",
    clue: "Adjetivo para aquilo que está perto ou iminente",
    context: "Palavra paroxítona com acento agudo.",
  },
  {
    id: "sec_6",
    word: "SPRINT",
    displayWord: "Sprint",
    category: "Inglês",
    clue: "Período de tempo delimitado no framework ágil Scrum",
    context: "Ciclo de trabalho com duração típica de 1 a 4 semanas.",
  },
  {
    id: "sec_7",
    word: "FEEDBACK",
    displayWord: "Feedback",
    category: "Administração",
    clue: "Retorno crítico construtivo sobre o desempenho de alguém",
    context: "Essencial para a comunicação e melhoria contínua de equipes.",
  },
];

export const SAMPLE_WORD_SEARCH: WordSearchGridDefinition = {
  id: "ws_adm",
  title: "Termos de Administração & IFES",
  category: "Administração",
  gridSize: 10,
  gridLetters: [
    ["K", "A", "N", "B", "A", "N", "X", "P", "L", "A"],
    ["F", "O", "C", "O", "T", "E", "A", "M", "S", "D"],
    ["I", "F", "E", "S", "M", "E", "T", "A", "S", "M"],
    ["C", "I", "E", "N", "C", "I", "A", "O", "B", "I"],
    ["L", "U", "C", "R", "O", "P", "I", "B", "A", "N"],
    ["P", "L", "A", "N", "O", "E", "X", "I", "T", "O"],
    ["E", "T", "I", "C", "A", "V", "A", "L", "O", "R"],
    ["S", "W", "O", "T", "E", "S", "T", "U", "D", "O"],
    ["G", "E", "S", "T", "A", "O", "R", "U", "S", "H"],
    ["B", "R", "A", "I", "N", "S", "K", "I", "L", "L"],
  ],
  targetWords: [
    { word: "KANBAN", start: [0, 0], end: [0, 5] },
    { word: "IFES", start: [2, 0], end: [2, 3] },
    { word: "METAS", start: [2, 4], end: [2, 8] },
    { word: "CIENCIA", start: [3, 0], end: [3, 6] },
    { word: "LUCRO", start: [4, 0], end: [4, 4] },
    { word: "PLANO", start: [5, 0], end: [5, 4] },
    { word: "ETICA", start: [6, 0], end: [6, 4] },
    { word: "SWOT", start: [7, 0], end: [7, 3] },
    { word: "ESTUDO", start: [7, 4], end: [7, 9] },
    { word: "GESTAO", start: [8, 0], end: [8, 5] },
  ],
};
