export interface QuizQuestion {
  id: string;
  category: "Matemática" | "Português" | "História" | "Geografia" | "Física" | "Química" | "Administração" | "Economia" | "Conhecimentos Gerais";
  difficulty: "facil" | "medio" | "dificil";
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // MATEMÁTICA
  {
    id: "mat_1",
    category: "Matemática",
    difficulty: "facil",
    question: "Qual é o valor de x na equação linear 3x - 12 = 0?",
    options: ["2", "3", "4", "6"],
    correctIndex: 2,
    explanation: "3x = 12 => x = 12 / 3 = 4.",
  },
  {
    id: "mat_2",
    category: "Matemática",
    difficulty: "facil",
    question: "Quanto é 15% de 300?",
    options: ["30", "45", "50", "60"],
    correctIndex: 1,
    explanation: "15% de 300 = 0.15 * 300 = 45.",
  },
  {
    id: "mat_3",
    category: "Matemática",
    difficulty: "medio",
    question: "Em um triângulo retângulo com catetos medindo 6 cm e 8 cm, quanto mede a hipotenusa?",
    options: ["10 cm", "12 cm", "14 cm", "16 cm"],
    correctIndex: 0,
    explanation: "Teorema de Pitágoras: h² = 6² + 8² = 36 + 64 = 100 => h = 10 cm.",
  },
  {
    id: "mat_4",
    category: "Matemática",
    difficulty: "dificil",
    question: "Qual é a derivada da função f(x) = 3x² + 5x - 7 em relação a x?",
    options: ["6x + 5", "3x + 5", "6x² + 5", "6x - 7"],
    correctIndex: 0,
    explanation: "Regra do tombo: d/dx(3x²) = 6x e d/dx(5x) = 5.",
  },

  // PORTUGUÊS
  {
    id: "port_1",
    category: "Português",
    difficulty: "facil",
    question: "Qual das palavras abaixo é proparoxítona?",
    options: ["Café", "Lâmpada", "Fácil", "Papel"],
    correctIndex: 1,
    explanation: "Proparoxítonas têm a antepenúltima sílaba tônica (LÂM-pa-da). Todas são acentuadas.",
  },
  {
    id: "port_2",
    category: "Português",
    difficulty: "medio",
    question: "Na frase 'Os alunos estudaram muito ontem', qual é a função sintática de 'ontem'?",
    options: ["Objeto direto", "Adjunto adnominal", "Adjunto adverbial de tempo", "Predicativo do sujeito"],
    correctIndex: 2,
    explanation: "'Ontem' indica a circunstância temporal da ação verbal, sendo adjunto adverbial de tempo.",
  },
  {
    id: "port_3",
    category: "Português",
    difficulty: "dificil",
    question: "Qual figura de linguagem consiste na aproximação de termos com sentidos opostos, como 'tristeza e alegria'?",
    options: ["Metonímia", "Antítese", "Catacrese", "Prosopopeia"],
    correctIndex: 1,
    explanation: "Antítese é a figura que contrapõe palavras ou ideias de sentidos contrários.",
  },

  // HISTÓRIA
  {
    id: "hist_1",
    category: "História",
    difficulty: "facil",
    question: "Em que ano foi proclamada a Independência do Brasil?",
    options: ["1500", "1808", "1822", "1889"],
    correctIndex: 2,
    explanation: "D. Pedro I proclamou a Independência do Brasil em 7 de setembro de 1822.",
  },
  {
    id: "hist_2",
    category: "História",
    difficulty: "medio",
    question: "Qual movimento histórico e cultural dos séculos XIV a XVI marcou a transição da Idade Média para a Moderna?",
    options: ["Iluminismo", "Renascimento", "Revolução Industrial", "Feudalismo"],
    correctIndex: 1,
    explanation: "O Renascimento cultural e humanista valorizou as ciências, as artes e a razão.",
  },
  {
    id: "hist_3",
    category: "História",
    difficulty: "dificil",
    question: "A criação das Escolas de Aprendizes Artífices em 1909 por Nilo Peçanha deu origem a qual rede educacional?",
    options: ["Rede Federal de Educação Profissional e Tecnológica (IFs)", "Sistema S", "Universidades Comunitárias", "Escolas Militares"],
    correctIndex: 0,
    explanation: "O Decreto nº 7.566 de 1909 criou as Escolas de Aprendizes Artífices, embrião dos Institutos Federais (IFES).",
  },

  // GEOGRAFIA
  {
    id: "geo_1",
    category: "Geografia",
    difficulty: "facil",
    question: "Qual é o maior bioma brasileiro em extensão territorial?",
    options: ["Cerrado", "Mata Atlântica", "Amazônia", "Caatinga"],
    correctIndex: 2,
    explanation: "A Amazônia ocupa quase metade do território brasileiro (cerca de 49%).",
  },
  {
    id: "geo_2",
    category: "Geografia",
    difficulty: "medio",
    question: "Qual estado brasileiro abriga o Instituto Federal do Espírito Santo (IFES)?",
    options: ["Minas Gerais", "Rio de Janeiro", "Espírito Santo", "Bahia"],
    correctIndex: 2,
    explanation: "O IFES tem seus campi distribuídos pelo estado do Espírito Santo.",
  },
  {
    id: "geo_3",
    category: "Geografia",
    difficulty: "dificil",
    question: "Qual fenômeno climático consiste no aquecimento anômalo das águas do Oceano Pacífico Equatorial?",
    options: ["La Niña", "El Niño", "Monções", "Inversão Térmica"],
    correctIndex: 1,
    explanation: "El Niño é o aquecimento anômalo das águas equatoriais do Pacífico, alterando padrões de chuvas globais.",
  },

  // FÍSICA
  {
    id: "fis_1",
    category: "Física",
    difficulty: "facil",
    question: "De acordo com a Primeira Lei de Newton (Inércia), um corpo em movimento retilíneo uniforme tende a:",
    options: ["Parar imediatamente", "Acelerar constantemente", "Manter sua velocidade constante na ausência de forças resultantes", "Mudar de direção"],
    correctIndex: 2,
    explanation: "Um corpo em repouso ou em MRU permanece nesse estado a menos que uma força resultante atue sobre ele.",
  },
  {
    id: "fis_2",
    category: "Física",
    difficulty: "medio",
    question: "Qual é a fórmula fundamental da Segunda Lei de Newton?",
    options: ["F = m * a", "E = m * c²", "P = V * I", "V = deltaS / deltaT"],
    correctIndex: 0,
    explanation: "A força resultante é o produto da massa pela aceleração: F = m * a.",
  },
  {
    id: "fis_3",
    category: "Física",
    difficulty: "dificil",
    question: "Qual grandeza física é medida em Watts (W) no Sistema Internacional de Unidades?",
    options: ["Energia", "Potência", "Pressão", "Campo elétrico"],
    correctIndex: 1,
    explanation: "Potência é a taxa de transferência de energia por unidade de tempo (1 Watt = 1 Joule por segundo).",
  },

  // QUÍMICA
  {
    id: "qui_1",
    category: "Química",
    difficulty: "facil",
    question: "Qual é a fórmula molecular da água?",
    options: ["CO2", "H2O", "NaCl", "CH4"],
    correctIndex: 1,
    explanation: "A molécula de água é composta por dois átomos de hidrogênio e um de oxigênio (H2O).",
  },
  {
    id: "qui_2",
    category: "Química",
    difficulty: "medio",
    question: "Uma substância com pH igual a 3 é classificada como:",
    options: ["Neutra", "Ácida", "Básica/Alcalina", "Inerte"],
    correctIndex: 1,
    explanation: "Soluções com pH abaixo de 7 são ácidas; pH 7 é neutro e acima de 7 é básico.",
  },
  {
    id: "qui_3",
    category: "Química",
    difficulty: "dificil",
    question: "Qual é a ligação química formada pelo compartilhamento de pares de elétrons entre átomos?",
    options: ["Ligação iônica", "Ligação covalente", "Ligação metálica", "Ponte de hidrogênio"],
    correctIndex: 1,
    explanation: "A ligação covalente ocorre pelo compartilhamento mútuo de elétrons de valência.",
  },

  // ADMINISTRAÇÃO
  {
    id: "adm_1",
    category: "Administração",
    difficulty: "facil",
    question: "Quais são as quatro funções clássicas do processo administrativo (PODC)?",
    options: [
      "Produzir, Operar, Dirigir, Cobrar",
      "Planejar, Organizar, Dirigir, Controlar",
      "Pesquisar, Orçar, Distribuir, Capacitar",
      "Promover, Otimizar, Deliberar, Contratar",
    ],
    correctIndex: 1,
    explanation: "As quatro funções essenciais descritas por Fayol são Planejamento, Organização, Direção e Controle.",
  },
  {
    id: "adm_2",
    category: "Administração",
    difficulty: "medio",
    question: "A matriz SWOT/FOFA avalia fatores internos e externos. Quais são os fatores externos?",
    options: ["Forças e Fraquezas", "Oportunidades e Ameaças", "Custos e Receitas", "Qualidade e Produção"],
    correctIndex: 1,
    explanation: "Oportunidades e Ameaças vêm do ambiente externo; Forças e Fraquezas são fatores internos.",
  },
  {
    id: "adm_3",
    category: "Administração",
    difficulty: "dificil",
    question: "Qual método ágil organiza o fluxo de trabalho visualmente através de colunas 'A Fazer', 'Em Progresso' e 'Concluído'?",
    options: ["Kanban", "Six Sigma", "Benchmarking", "Taylorismo"],
    correctIndex: 0,
    explanation: "Kanban é um sistema visual de cartões originado na Toyota para controle de fluxo e capacidade.",
  },

  // ECONOMIA
  {
    id: "eco_1",
    category: "Economia",
    difficulty: "facil",
    question: "Como se chama o fenômeno do aumento generalizado e contínuo dos preços na economia?",
    options: ["Deflação", "Inflação", "Superávit", "Liquidez"],
    correctIndex: 1,
    explanation: "Inflação é a alta persistente e generalizada nos preços de bens e serviços.",
  },
  {
    id: "eco_2",
    category: "Economia",
    difficulty: "medio",
    question: "Qual índice mede o valor monetário de todos os bens e serviços finais produzidos em um país em determinado período?",
    options: ["IPCA", "Selic", "PIB (Produto Interno Bruto)", "CDI"],
    correctIndex: 2,
    explanation: "O PIB sintetiza o fluxo da produção econômica nacional.",
  },
  {
    id: "eco_3",
    category: "Economia",
    difficulty: "dificil",
    question: "O conceito de 'Custo de Oportunidade' na teoria econômica refere-se a:",
    options: [
      "O valor monetário gasto na compra de um ativo",
      "O custo do melhor benefício que se renuncia ao fazer uma escolha",
      "O desconto concedido em uma transação comercial",
      "A taxa de juros cobrada pelos bancos centrais",
    ],
    correctIndex: 1,
    explanation: "Custo de oportunidade é o valor da melhor alternativa preterida ao tomar uma decisão.",
  },

  // CONHECIMENTOS GERAIS
  {
    id: "gen_1",
    category: "Conhecimentos Gerais",
    difficulty: "facil",
    question: "Qual é o lema que consta na bandeira do Brasil?",
    options: ["Liberdade, Igualdade e Fraternidade", "Ordem e Progresso", "União e Força", "Paz e Prosperidade"],
    correctIndex: 1,
    explanation: "O lema 'Ordem e Progresso' é inspirado no positivismo de Auguste Comte.",
  },
  {
    id: "gen_2",
    category: "Conhecimentos Gerais",
    difficulty: "medio",
    question: "Qual órgão oficial é responsável pelo ensino profissionalizante e tecnológico federal no estado do Espírito Santo?",
    options: ["UFES", "IFES", "SENAI", "FAPES"],
    correctIndex: 1,
    explanation: "O Instituto Federal do Espírito Santo (IFES) é a instituição federal de educação técnica e superior.",
  },
  {
    id: "gen_3",
    category: "Conhecimentos Gerais",
    difficulty: "dificil",
    question: "Quem foi a primeira mulher a ganhar um Prêmio Nobel (e a única a ganhar em duas categorias científicas diferentes)?",
    options: ["Rosalind Franklin", "Marie Curie", "Ada Lovelace", "Jane Goodall"],
    correctIndex: 1,
    explanation: "Marie Curie foi laureada em Física (1903) e Química (1911) por suas descobertas sobre radioatividade.",
  },
];
