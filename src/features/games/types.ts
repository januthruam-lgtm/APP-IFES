export type MinigameId =
  | "quiz_battle"
  | "memory_cards"
  | "word_master"
  | "math_rush"
  | "brain_challenge"
  | "code_breaker"
  | "eco_challenge"
  | "business_tycoon";

export interface MinigameDefinition {
  id: MinigameId;
  title: string;
  tagline: string;
  minLevel: number;
  iconName: string;
  category: "Conhecimento" | "Memória" | "Linguagem" | "Exatas" | "Lógica" | "Dedução" | "Estratégia" | "Gestão";
  accentColor: string;
  bgGradient: string;
  imageBanner: string;
  description: string;
  howToPlay: string[];
  rewardsDescription: string;
  estimatedDuration: string;
}

export const MINIGAMES_CONFIG: MinigameDefinition[] = [
  {
    id: "quiz_battle",
    title: "Quiz Battle",
    tagline: "Batalha de perguntas e respostas com categorias acadêmicas",
    minLevel: 1,
    iconName: "Brain",
    category: "Conhecimento",
    accentColor: "#3B82F6",
    bgGradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    imageBanner: "/src/assets/images/game_quiz_battle_1793362261465.jpg",
    description: "Teste seus conhecimentos em 9 disciplinas com perguntas de múltipla escolha, bônus de sequência (streak) e cronômetro desafiador.",
    howToPlay: [
      "Escolha sua categoria preferida ou modo geral.",
      "Responda a 10 perguntas antes que o tempo esgote.",
      "Acertos consecutivos multiplicam sua pontuação e moedas ganhas.",
    ],
    rewardsDescription: "Até 60 IF Coins e 80 XP por vitória perfeita",
    estimatedDuration: "2 - 3 min",
  },
  {
    id: "memory_cards",
    title: "Memory Cards",
    tagline: "Associação e memória de conceitos, fórmulas e teorias",
    minLevel: 3,
    iconName: "Sparkles",
    category: "Memória",
    accentColor: "#8B5CF6",
    bgGradient: "from-purple-600/20 via-purple-500/10 to-transparent",
    imageBanner: "/src/assets/images/game_memory_cards_1793362261932.jpg",
    description: "Encontre os pares correspondentes entre conceitos científicos e suas fórmulas, definições e autores em menor tempo e jogadas.",
    howToPlay: [
      "Vire duas cartas por vez para encontrar os pares conceituais.",
      "Memorize posições de teorias, fórmulas e termos técnicos.",
      "Complete a fase no menor número de movimentos para bater recordes.",
    ],
    rewardsDescription: "Até 50 IF Coins e 70 XP por fase",
    estimatedDuration: "2 min",
  },
  {
    id: "word_master",
    title: "Word Master",
    tagline: "Anagramas, termos secretos acadêmicos e caça-palavras",
    minLevel: 5,
    iconName: "BookOpen",
    category: "Linguagem",
    accentColor: "#EC4899",
    bgGradient: "from-pink-600/20 via-pink-500/10 to-transparent",
    imageBanner: "/src/assets/images/games_hub_banner_1793362260591.jpg",
    description: "Desafie seu vocabulário acadêmico em português, inglês e administração em 3 modos interativos: anagramas, termo secreto e caça-palavras.",
    howToPlay: [
      "No modo Anagrama: ordene as letras embaralhadas para formar o termo científico.",
      "No modo Termo Secreto: descubra a palavra misteriosa usando pistas e tentativas.",
      "No modo Caça-Palavras: localize os termos técnicos escondidos na matriz.",
    ],
    rewardsDescription: "Até 65 IF Coins e 85 XP",
    estimatedDuration: "3 min",
  },
  {
    id: "math_rush",
    title: "Math Rush",
    tagline: "Operações matemáticas e equações contra o relógio",
    minLevel: 8,
    iconName: "Zap",
    category: "Exatas",
    accentColor: "#F59E0B",
    bgGradient: "from-amber-600/20 via-amber-500/10 to-transparent",
    imageBanner: "/src/assets/images/games_hub_banner_1793362260591.jpg",
    description: "Resolva equações de 1º grau, porcentagens, funções e matemática financeira com tempo dinâmico: cada acerto adiciona segundos ao cronômetro!",
    howToPlay: [
      "Resolva as operações matemáticas o mais rápido possível.",
      "Acertos adicionam tempo extra (+3s) e aumentam o multiplicador de combo.",
      "Erros reduzem o tempo em 5s. Mantenha o fluxo de foco!",
    ],
    rewardsDescription: "Até 75 IF Coins e 100 XP",
    estimatedDuration: "2 - 4 min",
  },
  {
    id: "brain_challenge",
    title: "Brain Challenge",
    tagline: "Bateria de desafios lógicos, sequências e raciocínio espacial",
    minLevel: 12,
    iconName: "Puzzle",
    category: "Lógica",
    accentColor: "#10B981",
    bgGradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    imageBanner: "/src/assets/images/games_hub_banner_1793362260591.jpg",
    description: "Exercite seu cérebro com sequências numéricas complexas, matrizes de memória padrão, quebra-cabeças de associação e teste de padrões.",
    howToPlay: [
      "Identifique a regra que rege as sequências numéricas e geométricas.",
      "Repita padrões luminosos na matriz de memória visual.",
      "Supere as 5 fases com velocidade e precisão para pontuação máxima.",
    ],
    rewardsDescription: "Até 90 IF Coins e 120 XP",
    estimatedDuration: "3 - 5 min",
  },
  {
    id: "code_breaker",
    title: "Code Breaker",
    tagline: "Decifrador de códigos secretos com dedução e eliminação",
    minLevel: 16,
    iconName: "KeyRound",
    category: "Dedução",
    accentColor: "#6366F1",
    bgGradient: "from-indigo-600/20 via-indigo-500/10 to-transparent",
    imageBanner: "/src/assets/images/games_hub_banner_1793362260591.jpg",
    description: "Descubra o código secreto de 4 a 5 dígitos com pistas precisas de posições exatas e parciais. Use seu bloco de anotações para eliminar dígitos.",
    howToPlay: [
      "Insira um palpite de 4 a 5 dígitos numéricos sem repetição.",
      "Verifique as pistas: Verde = dígito e posição corretos; Amarelo = dígito existe mas posição errada.",
      "Use as notas de eliminação e quebre o código em até 8 tentativas.",
    ],
    rewardsDescription: "Até 100 IF Coins e 140 XP",
    estimatedDuration: "3 - 5 min",
  },
  {
    id: "eco_challenge",
    title: "Eco Challenge",
    tagline: "Simulador de administração sustentável da cidade e campus",
    minLevel: 22,
    iconName: "Leaf",
    category: "Estratégia",
    accentColor: "#059669",
    bgGradient: "from-teal-600/20 via-teal-500/10 to-transparent",
    imageBanner: "/src/assets/images/game_eco_challenge_1793362262383.jpg",
    description: "Administre um campus e cidade sustentável por 10 anos. Equilibre finanças, matriz energética limpa, conservação ecológica e transporte público.",
    howToPlay: [
      "Avalie 3 propostas de projetos socioambientais a cada ano/turno.",
      "Gerencie o orçamento público sem deixar os indicadores críticos caírem.",
      "Reaja a eventos climáticos e crises para atingir a meta de sustentabilidade.",
    ],
    rewardsDescription: "Até 130 IF Coins e 180 XP",
    estimatedDuration: "5 - 8 min",
  },
  {
    id: "business_tycoon",
    title: "Business Tycoon",
    tagline: "Simulador completo de gestão empresarial e empreendedorismo",
    minLevel: 30,
    iconName: "TrendingUp",
    category: "Gestão",
    accentColor: "#D97706",
    bgGradient: "from-orange-600/20 via-orange-500/10 to-transparent",
    imageBanner: "/src/assets/images/game_business_tycoon_1793362262524.jpg",
    description: "Fundada com R$ 15.000 fictícios, lidere sua empresa por 12 meses: precificação, contratações, maquinário, P&D, marketing e DRE contábil.",
    howToPlay: [
      "Defina o preço de venda e invista em campanhas de marketing.",
      "Compre matéria-prima, controle o estoque e contrate colaboradores especializados.",
      "Invista em P&D para aumentar o valuation da sua empresa ao longo do ano fiscal.",
    ],
    rewardsDescription: "Até 160 IF Coins e 220 XP",
    estimatedDuration: "6 - 10 min",
  },
];

export interface GameMatchRecord {
  id: string;
  gameId: MinigameId;
  gameTitle: string;
  userId: string;
  userName: string;
  score: number;
  coinsEarned: number;
  xpEarned: number;
  durationSeconds: number;
  completedAt: string;
  details: {
    accuracyPercent?: number;
    movesCount?: number;
    highestStreak?: number;
    phasesCompleted?: number;
    valuationFicticio?: number;
    extraNote?: string;
  };
}

export interface GameMission {
  id: string;
  title: string;
  description: string;
  category: "daily" | "weekly" | "special";
  gameId?: MinigameId | "any";
  targetType: "matches_played" | "score_reached" | "streak_reached" | "distinct_games";
  targetValue: number;
  currentValue: number;
  rewardCoins: number;
  rewardXp: number;
  status: "active" | "completed" | "claimed";
  expiresAt: string;
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  requirement: string;
  currentProgress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardXp: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface GameLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  campus?: string;
  score: number;
  level: number;
  coins?: number;
  gameId: MinigameId | "all";
}

export interface UserGamesProfile {
  userId: string;
  userName: string;
  level: number;
  xp: number;
  coins: number;
  totalMatches: number;
  unlockedGames: MinigameId[];
  personalBests: Record<MinigameId, number>;
  dailyCoinsEarnedToday: number;
  dailyCoinLimit: number;
  lastDailyResetDate: string;
  history: GameMatchRecord[];
  activeMissions: GameMission[];
  achievements: GameAchievement[];
}
