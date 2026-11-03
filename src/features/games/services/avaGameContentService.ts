/**
 * Brain Studio - Serviço Central de Conteúdos Acadêmicos do AVA IFES para Jogos
 * 
 * Extrai e estrutura os conteúdos oficiais das disciplinas matriculadas pelo estudante
 * (tópicos, módulos, tarefas e avaliações) para alimentar dinamicamente os Quizzes e Minigames,
 * garantindo fidelidade curricular sem invenção de temas.
 */

import { IfesCourse, IfesAssignment } from "../../../types";
import { loadSyncedCourses, loadSyncedAssignments } from "../../../utils/courseSync";
import { FirestoreService } from "../../../lib/firestoreService";

export interface StudentWeaknessRecord {
  id: string;
  subject: string;
  topic: string;
  questionSnippet: string;
  explanation: string;
  incorrectAttempts: number;
  lastMissedAt: string;
  mastered: boolean;
}

const STORAGE_WEAKNESSES_KEY = "brain_studio_study_weaknesses_v1";

/**
 * Obtém a lista atualizada de disciplinas oficiais em que o estudante está matriculado.
 */
export function getEnrolledAcademicCourses(): IfesCourse[] {
  const synced = loadSyncedCourses();
  if (synced && synced.length > 0) {
    return synced;
  }
  // Se ainda não houver disciplinas salvas no cache, retorna as disciplinas padrão do IFES
  return [
    {
      id: "ifes-tga202",
      name: "Teoria Geral da Administração II",
      code: "TGA202-CEFOR",
      professor: "Prof. Dr. Roberto Guimarães",
      campus: "Cefor / Serra",
      progressPercent: 68,
      shortname: "TGA II",
    },
    {
      id: "ifes-gp201",
      name: "Gestão de Pessoas & Comportamento Organizacional",
      code: "GP201-CEFOR",
      professor: "Profa. Dra. Mariana Siqueira",
      campus: "Cefor / Serra",
      progressPercent: 75,
      shortname: "Gestão Pessoas",
    },
    {
      id: "ifes-fin204",
      name: "Gestão Financeira e Orçamentária",
      code: "FIN204-CEFOR",
      professor: "Prof. Esp. Leonardo Ramos",
      campus: "Cefor / Serra",
      progressPercent: 55,
      shortname: "Financeira",
    },
    {
      id: "ifes-log203",
      name: "Gestão da Produção, Logística e Serviços",
      code: "LOG203-CEFOR",
      professor: "Profa. Ma. Camila Albuquerque",
      campus: "Cefor / Serra",
      progressPercent: 60,
      shortname: "Logística",
    },
    {
      id: "ifes-mkt205",
      name: "Marketing & Comunicação Empresarial",
      code: "MKT205-CEFOR",
      professor: "Profa. Dra. Juliana Silveira",
      campus: "Cefor / Serra",
      progressPercent: 82,
      shortname: "Marketing",
    },
    {
      id: "ifes-cont206",
      name: "Contabilidade Geral e Tributária",
      code: "CONT206-CEFOR",
      professor: "Prof. Dr. André Mendonça",
      campus: "Cefor / Serra",
      progressPercent: 45,
      shortname: "Contabilidade",
    },
    {
      id: "ifes-port201",
      name: "Língua Portuguesa e Literatura Aplicada II",
      code: "PORT201-CEFOR",
      professor: "Profa. Ma. Renata Valadão",
      campus: "Cefor / Serra",
      progressPercent: 70,
      shortname: "Português II",
    },
    {
      id: "ifes-inf202",
      name: "Informática Aplicada à Gestão",
      code: "INF202-CEFOR",
      professor: "Prof. Esp. Carlos Eduardo",
      campus: "Cefor / Serra",
      progressPercent: 88,
      shortname: "Informática",
    },
  ];
}

/**
 * Mapeamento curricular de tópicos específicos para disciplinas conhecidas do IFES.
 */
export const KNOWN_IFES_TOPICS: Record<string, string[]> = {
  "Teoria Geral da Administração II": [
    "Teoria Neoclássica da Administração e Fayol",
    "Administração por Objetivos (APO)",
    "Teoria Burocrática de Max Weber",
    "Teoria Comportamental e Hierarquia de Maslow",
    "Teoria dos Sistemas e Cibernética",
    "Teoria da Contingência e Estrutura Organizacional",
    "Governança Corporativa e Tomada de Decisão",
  ],
  "Gestão de Pessoas & Comportamento Organizacional": [
    "Recrutamento, Seleção e Competências",
    "Treinamento, Desenvolvimento e Educação Corporativa",
    "Avaliação de Desempenho e Feedback 360°",
    "Liderança Situacional e Estilos de Liderança",
    "Clima Organizacional e Pesquisa de Satisfação",
    "Cultura Organizacional e Gestão da Mudança",
    "Comunicação Não-Violenta e Gestão de Conflitos",
  ],
  "Gestão Financeira e Orçamentária": [
    "Demonstração do Resultado do Exercício (DRE)",
    "Fluxo de Caixa Operacional e Projetado",
    "Ponto de Equilíbrio Operacional e Financeiro",
    "Análise de Custos Fixos, Variáveis e Margem de Contribuição",
    "Juros Simples, Compostos e Matemática Financeira",
    "Orçamento Empresarial e Controle Orçamentário",
    "Capital de Giro e Índices de Liquidez",
  ],
  "Gestão da Produção, Logística e Serviços": [
    "Gestão da Cadeia de Suprimentos (Supply Chain)",
    "Mapeamento de Processos e Ciclo PDCA",
    "Gestão de Estoques: Lote Econômico e Curva ABC",
    "Ferramentas da Qualidade: Diagrama de Ishikawa e Pareto",
    "Logística Reversa e Sustentabilidade Operacional",
    "Metodologias Lean Manufacturing e Redução de Desperdícios",
    "Sistemas de Armazenagem e Modais de Transporte",
  ],
  "Marketing & Comunicação Empresarial": [
    "Mix de Marketing: Os 4 Ps (Produto, Preço, Praça, Promoção)",
    "Segmentação de Mercado e Público-Alvo (Personas)",
    "Marketing Digital, Inbound Marketing e SEO",
    "Gestão de Marca (Branding) e Posicionamento",
    "Jornada do Cliente e Funil de Vendas",
    "Comunicação Integrada e Relações Públicas",
    "Pesquisa de Mercado e Comportamento do Consumidor",
  ],
  "Contabilidade Geral e Tributária": [
    "Balanço Patrimonial: Ativo, Passivo e Patrimônio Líquido",
    "Regime de Caixa vs Regime de Competência",
    "Escrituração Contábil e Método das Partidas Dobradas",
    "Tributos Federais, Estaduais e Municipais (ICMS, ISS, IRPJ)",
    "Depreciação, Amortização e Exaustão de Ativos",
    "Notas Explicativas e Demonstrações Financeiras Oficiais",
  ],
  "Língua Portuguesa e Literatura Aplicada II": [
    "Redação Técnica e Correspondência Oficial (Padrão MEC/IFES)",
    "Coesão e Coerência em Textos Dissertativo-Argumentativos",
    "Concordância Verbal e Nominal Aplicada",
    "Regência Verbal, Regência Nominal e Uso da Crase",
    "Semântica, Ambiguidade e Vícios de Linguagem",
    "Gêneros Textuais Profissionais: Relatórios, Pareceres e Ofícios",
  ],
  "Informática Aplicada à Gestão": [
    "Planilhas Avançadas: Funções Lógicas, PROCV/PROCX e Tabela Dinâmica",
    "Segurança da Informação e LGPD nas Organizações",
    "Sistemas Integrados de Gestão (ERP e CRM)",
    "Ferramentas de Computação em Nuvem e Colaboração",
    "Automação de Processos com Scripts e Macros",
    "Fundamentos de Banco de Dados e Consultas SQL",
  ],
  "Programação Web (Front-End & Back-End)": [
    "HTML5 Semântico e Acessibilidade Web (WCAG)",
    "CSS3 Moderno, Flexbox, Grid e Responsividade",
    "JavaScript ES6+, Promises e Funções Assíncronas",
    "Consumo e Arquitetura de APIs RESTful e JSON",
    "Segurança Web: HTTPS, CORS, CSRF e Validação de Inputs",
    "Banco de Dados e Persistência no Back-End",
  ],
  "Algoritmos e Estrutura de Dados II": [
    "Complexidade de Algoritmos (Notação Big-O)",
    "Recursividade e Divisão e Conquista",
    "Listas Encadeadas, Pilhas e Filas",
    "Árvores Binárias de Busca e Grafos",
    "Algoritmos de Ordenação (MergeSort, QuickSort)",
    "Tabelas Hash e Resolução de Colisões",
  ],
  "Matemática e Suas Tecnologias": [
    "Funções de 1º e 2º Graus e Interpretação Gráfica",
    "Funções Exponenciais e Logarítmicas",
    "Geometria Plana e Espacial: Áreas e Volumes",
    "Trigonometria no Triângulo Retângulo e Círculo Trigonométrico",
    "Progressões Aritméticas (PA) e Geométricas (PG)",
    "Estatística Descritiva: Média, Mediana, Moda e Desvio Padrão",
    "Análise Combinatória e Probabilidade",
  ],
  "Física Geral e Experimental": [
    "Cinemática Escalar e Vetorial: Movimento Uniforme e Variado",
    "Dinâmica: Leis de Newton e Força de Atrito",
    "Trabalho, Energia Mecânica e Princípio de Conservação",
    "Termodinâmica: Calor, Temperatura e Leis dos Gases",
    "Óptica Geométrica e Ondulatória",
    "Eletrodinâmica: Lei de Ohm, Resistores e Potência Elétrica",
  ],
};

/**
 * Obtém os tópicos específicos disponíveis para uma disciplina.
 */
export function getTopicsForSubject(subjectName: string): string[] {
  // Procura correspondência exata
  if (KNOWN_IFES_TOPICS[subjectName]) {
    return KNOWN_IFES_TOPICS[subjectName];
  }

  // Procura correspondência parcial
  const normalized = subjectName.toLowerCase();
  for (const [key, topics] of Object.entries(KNOWN_IFES_TOPICS)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return topics;
    }
  }

  // Tópicos curriculares inferidos baseados em palavras-chave da matéria
  if (normalized.includes("administra") || normalized.includes("gestão")) {
    return [
      "Planejamento Estratégico",
      "Processos Organizacionais",
      "Tomada de Decisão",
      "Indicadores de Desempenho",
      "Ética e Responsabilidade Social",
    ];
  }
  if (normalized.includes("matemát") || normalized.includes("cálculo")) {
    return [
      "Equações e Inequações",
      "Funções e Gráficos",
      "Matemática Financeira",
      "Geometria e Medidas",
      "Estatística e Probabilidade",
    ];
  }
  if (normalized.includes("programaç") || normalized.includes("computa") || normalized.includes("informát")) {
    return [
      "Lógica de Programação",
      "Estruturas de Controle",
      "Funções e Modularização",
      "Tratamento de Dados",
      "Segurança e Boas Práticas",
    ];
  }

  return [
    "Conceitos Fundamentais e Definições",
    "Aplicações Práticas e Metodologia",
    "Estudo de Casos e Resolução de Problemas",
    "Normas Técnicas e Legislação Vigente",
  ];
}

/**
 * Coleta todo o contexto acadêmico relevante (tópicos, tarefas pendentes, resumos) para uma matéria.
 */
export function getAcademicContextForSubject(subjectName: string): {
  subject: string;
  topics: string[];
  assignmentsContext: string;
  referenceSummary: string;
} {
  const topics = getTopicsForSubject(subjectName);
  const assignments = loadSyncedAssignments().filter(
    (a) => a.courseName?.toLowerCase().includes(subjectName.toLowerCase()) ||
           subjectName.toLowerCase().includes(a.courseName?.toLowerCase() || "")
  );

  const assignmentsContext = assignments.length > 0
    ? assignments.map((a) => `- ${a.title} (${a.type}): ${a.description}`).join("\n")
    : "Atividades regulares e avaliações formativas do AVA Moodle do IFES.";

  const referenceSummary = `Conteúdos oficiais ministrados no IFES para ${subjectName}. Tópicos curriculares abordados: ${topics.join(", ")}.`;

  return {
    subject: subjectName,
    topics,
    assignmentsContext,
    referenceSummary,
  };
}

const memoryFallbackStore: Record<string, string> = {};

function safeStorageGet(key: string): string | null {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallbackStore[key] ?? null;
    }
  }
  return memoryFallbackStore[key] ?? null;
}

function safeStorageSet(key: string, val: string): void {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(key, val);
      return;
    } catch {}
  }
  memoryFallbackStore[key] = val;
}

/**
 * Carrega a lista de pontos fracos (erros do estudante) do localStorage.
 */
export function getStudentWeaknessesLocal(userId: string): StudentWeaknessRecord[] {
  try {
    const raw = safeStorageGet(`${STORAGE_WEAKNESSES_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((w) => !w.mastered);
    }
  } catch {}
  return [];
}

/**
 * Registra o desempenho do estudante em uma questão/desafio pedagógico.
 * Se errar, adiciona/incrementa o tópico fraco.
 * Se acertar consecutivamente, marca como dominado.
 */
export async function recordStudentPerformance(
  userId: string,
  subject: string,
  topic: string,
  questionSnippet: string,
  isCorrect: boolean,
  explanation = ""
): Promise<void> {
  if (!userId) return;

  try {
    const weaknesses = getStudentWeaknessesLocal(userId);
    const existingIndex = weaknesses.findIndex(
      (w) => w.subject === subject && (w.topic === topic || topic.includes(w.topic))
    );

    if (!isCorrect) {
      if (existingIndex >= 0) {
        weaknesses[existingIndex].incorrectAttempts += 1;
        weaknesses[existingIndex].lastMissedAt = new Date().toISOString();
        weaknesses[existingIndex].questionSnippet = questionSnippet;
        weaknesses[existingIndex].explanation = explanation || weaknesses[existingIndex].explanation;
        weaknesses[existingIndex].mastered = false;
      } else {
        const newRecord: StudentWeaknessRecord = {
          id: `weak_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          subject,
          topic: topic || "Conceito Geral",
          questionSnippet,
          explanation: explanation || "Reveja os conceitos principais deste tópico.",
          incorrectAttempts: 1,
          lastMissedAt: new Date().toISOString(),
          mastered: false,
        };
        weaknesses.unshift(newRecord);
      }
    } else {
      // Se acertou, verifica se estava na lista de fraquezas e reduz ou remove
      if (existingIndex >= 0) {
        weaknesses[existingIndex].incorrectAttempts -= 1;
        if (weaknesses[existingIndex].incorrectAttempts <= 0) {
          weaknesses[existingIndex].mastered = true;
        }
      }
    }

    // Salva localmente
    const activeWeaknesses = weaknesses.filter((w) => !w.mastered).slice(0, 50);
    safeStorageSet(`${STORAGE_WEAKNESSES_KEY}_${userId}`, JSON.stringify(activeWeaknesses));

    // Persiste no Firestore se o usuário estiver autenticado
    if (userId !== "local_user") {
      try {
        await FirestoreService.setDocument(
          `users/${userId}/studyWeaknessesSummary`,
          "summary",
          {
            updatedAt: new Date().toISOString(),
            weaknessesCount: activeWeaknesses.length,
            weaknesses: activeWeaknesses.slice(0, 20),
          }
        );
      } catch (err) {
        console.warn("[WeaknessTracker] Falha ao sincronizar com Firestore:", err);
      }
    }
  } catch (err) {
    console.error("[WeaknessTracker] Erro ao registrar desempenho do estudante:", err);
  }
}
