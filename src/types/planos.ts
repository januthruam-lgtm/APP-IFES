export type PlanoId = "gratuito" | "pro_mensal" | "pro_anual";

export interface PlanoConfig {
  id: PlanoId;
  nome: string;
  preco: string;
  recorrencia: string;
  popular?: boolean;
  limites: {
    luminaPerguntasDiarias: number; // Gratuito = 10, Pro = ilimitado (-1)
    quizzesPorArquivoMensal: number; // Gratuito = 3, Pro = ilimitado (-1)
    perguntasPorQuizArquivo: number; // Gratuito = 5, Pro = 20
    armazenamentoBibliotecaMb: number; // Gratuito = 50MB, Pro = 1000MB
    vozesPremium: boolean;
    modoOfflineIlimitado: boolean;
  };
  beneficios: string[];
}

export const PLANOS: PlanoConfig[] = [
  {
    id: "gratuito",
    nome: "Brain Gratuito",
    preco: "R$ 0",
    recorrencia: "/mês",
    limites: {
      luminaPerguntasDiarias: 10,
      quizzesPorArquivoMensal: 3,
      perguntasPorQuizArquivo: 5,
      armazenamentoBibliotecaMb: 50,
      vozesPremium: false,
      modoOfflineIlimitado: false,
    },
    beneficios: [
      "10 perguntas diárias com a Lumina IA",
      "Acesso completo ao AVA Moodle IFES",
      "Biblioteca virtual de obras em domínio público",
      "Dicionário inteligente e flashcards Anki",
      "3 gerações de quiz por arquivo/mês",
    ],
  },
  {
    id: "pro_mensal",
    nome: "Brain Pro Mensal",
    preco: "R$ 19,90",
    recorrencia: "/mês",
    popular: true,
    limites: {
      luminaPerguntasDiarias: -1, // Ilimitado
      quizzesPorArquivoMensal: -1, // Ilimitado
      perguntasPorQuizArquivo: 20,
      armazenamentoBibliotecaMb: 1000,
      vozesPremium: true,
      modoOfflineIlimitado: true,
    },
    beneficios: [
      "Perguntas ilimitadas com a Lumina IA",
      "Geração ilimitada de quizzes por arquivo (PDF, DOCX, TXT, Imagens)",
      "Até 20 questões detalhadas com justificativa pedagógica por quiz",
      "Memória contínua e personalizada da Lumina",
      "Download offline ilimitado de obras e cursos",
      "Vozes neurais ultrarrealistas sem limite",
      "Acesso antecipado a novos simulados",
    ],
  },
  {
    id: "pro_anual",
    nome: "Brain Pro Anual (Desconto 35%)",
    preco: "R$ 12,90",
    recorrencia: "/mês (R$ 154,80/ano)",
    limites: {
      luminaPerguntasDiarias: -1,
      quizzesPorArquivoMensal: -1,
      perguntasPorQuizArquivo: 20,
      armazenamentoBibliotecaMb: 2000,
      vozesPremium: true,
      modoOfflineIlimitado: true,
    },
    beneficios: [
      "Todos os benefícios do plano Pro Mensal",
      "Economia de 35% ao ano",
      "Mascote 3D lendário exclusivo 'Coruja Mística Dourada'",
      "500 Moedas 🪙 de bônus imediato",
      "Suporte acadêmico prioritário",
    ],
  },
];
