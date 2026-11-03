/**
 * Brain Studio - Serviço Dinâmico de Desafios Acadêmicos com IA (Fase 8)
 * 
 * Alimenta Minigames (Memória, Palavras, Matemática e Lógica) com conteúdos
 * reais das disciplinas do AVA IFES e prevenção ativa de repetição.
 */

import { getAcademicContextForSubject } from "./avaGameContentService";

export interface MemoryPair {
  id: string;
  termA: string;
  termB: string;
  hint: string;
  subject?: string;
}

export interface AcademicTerm {
  id: string;
  word: string;
  hint: string;
  category?: string;
  explanation: string;
}

export interface AcademicMathProblem {
  id: string;
  equation: string;
  options: number[];
  correctAnswer: number;
  type: "Financeira" | "Equação" | "Porcentagem" | "Função" | "Aritmética";
  explanation: string;
}

export interface AcademicLogicChallenge {
  id: string;
  title: string;
  instruction: string;
  question: string;
  options: (string | number)[];
  correctAnswer: string | number;
  explanation: string;
}

const STORAGE_CHALLENGE_HISTORY_KEY = "brain_challenge_excludes_v1";
const memoryChallengeStore: Record<string, string> = {};

function safeStorageGet(key: string): string | null {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryChallengeStore[key] ?? null;
    }
  }
  return memoryChallengeStore[key] ?? null;
}

function safeStorageSet(key: string, val: string): void {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(key, val);
      return;
    } catch {}
  }
  memoryChallengeStore[key] = val;
}

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.API_BASE_URL || "http://localhost:3000";
}

function loadExcludedItems(gameType: string, userId: string): string[] {
  try {
    const raw = safeStorageGet(`${STORAGE_CHALLENGE_HISTORY_KEY}_${gameType}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveExcludedItem(gameType: string, userId: string, item: string): void {
  if (!item) return;
  try {
    const current = loadExcludedItems(gameType, userId);
    const updated = [item, ...current.filter((x) => x !== item)].slice(0, 100);
    safeStorageSet(`${STORAGE_CHALLENGE_HISTORY_KEY}_${gameType}_${userId}`, JSON.stringify(updated));
  } catch {}
}

/**
 * GERAÇÃO DINÂMICA DE PARES DE MEMÓRIA (MemoryCardsGame)
 */
export async function fetchAcademicMemoryPairs(params: {
  userId: string;
  subject: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}): Promise<MemoryPair[]> {
  const { userId, subject, topic = "", difficulty = "Médio", count = 6 } = params;
  const excludes = loadExcludedItems("memory", userId);
  const context = getAcademicContextForSubject(subject);

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/games/generate-challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "memory_pairs",
        subject,
        topic: topic || (context.topics[0] || ""),
        difficulty,
        count,
        academicContext: context.referenceSummary,
        excludeItems: excludes.slice(0, 20),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.pairs) && json.data.pairs.length >= 3) {
        json.data.pairs.forEach((p: MemoryPair) => saveExcludedItem("memory", userId, p.termA));
        return json.data.pairs;
      }
    }
  } catch (err) {
    console.warn("[ChallengeService] Falha na IA de memória, usando base curricular do IFES:", err);
  }

  // Fallback baseado nos conteúdos reais do IFES
  const fallbackPool: Record<string, MemoryPair[]> = {
    "Administração": [
      { id: "p1", termA: "Fayol", termB: "14 Princípios e Funções Administrativas (POCCC)", hint: "Pai da Teoria Clássica" },
      { id: "p2", termA: "Ciclo PDCA", termB: "Planejar, Desenvolver, Checar e Agir", hint: "Método de melhoria contínua da qualidade" },
      { id: "p3", termA: "Ishikawa", termB: "Diagrama de Causa e Efeito (Espinha de Peixe)", hint: "Identificação dos 6Ms" },
      { id: "p4", termA: "Maslow", termB: "Hierarquia das Necessidades Humanas", hint: "Pirâmide de motivação" },
      { id: "p5", termA: "Matriz SWOT", termB: "Forças, Oportunidades, Fraquezas e Ameaças", hint: "Ferramenta de diagnóstico estratégico" },
      { id: "p6", termA: "Ponto de Equilíbrio", termB: "Receitas totais iguais aos Custos totais", hint: "Lucro zero" },
      { id: "p7", termA: "Curva ABC", termB: "Classificação de estoques por valor de demanda", hint: "Princípio de Pareto 80/20" },
      { id: "p8", termA: "Burocracia", termB: "Max Weber: impessoalidade, hierarquia e regras", hint: "Estrutura formal racional" },
    ],
    "Finanças": [
      { id: "p9", termA: "Margem de Contribuição", termB: "Preço de Venda menos Custos Variáveis", hint: "Cobre os custos fixos" },
      { id: "p10", termA: "DRE", termB: "Demonstração do Resultado do Exercício", hint: "Relatório de lucro ou prejuízo líquido" },
      { id: "p11", termA: "Capital de Giro", termB: "Ativo Circulante menos Passivo Circulante", hint: "Recurso para operações do dia a dia" },
      { id: "p12", termA: "Juros Compostos", termB: "Juros calculados sobre o montante acumulado", hint: "Juros sobre juros" },
      { id: "p13", termA: "Liquidez Corrente", termB: "Capacidade de honrar compromissos no curto prazo", hint: "Ativo Circulante / Passivo Circulante" },
      { id: "p14", termA: "Depreciação", termB: "Perda de valor de bens tangíveis pelo uso ou tempo", hint: "Ajuste patrimonial contábil" },
    ],
    "Informática": [
      { id: "p15", termA: "Big-O", termB: "Classificação de complexidade e tempo de algoritmos", hint: "Eficiência de código" },
      { id: "p16", termA: "Pilha (Stack)", termB: "LIFO: Último a entrar é o primeiro a sair", hint: "Operações push e pop" },
      { id: "p17", termA: "Fila (Queue)", termB: "FIFO: Primeiro a entrar é o primeiro a sair", hint: "Enqueue e Dequeue" },
      { id: "p18", termA: "REST API", termB: "Protocolo stateless baseado em verbos HTTP", hint: "GET, POST, PUT, DELETE" },
      { id: "p19", termA: "Chave Primária", termB: "Identificador único de uma tupla em banco relacional", hint: "Primary Key sem duplicatas" },
      { id: "p20", termA: "Recursão", termB: "Função que invoca a si mesma com caso base", hint: "Divisão do problema" },
    ],
  };

  const pool = fallbackPool[subject] || fallbackPool["Administração"];
  return pool.slice(0, count);
}

/**
 * GERAÇÃO DINÂMICA DE TERMOS PARA MESTRE DAS PALAVRAS (WordMasterGame)
 */
export async function fetchAcademicWordMasterTerms(params: {
  userId: string;
  subject: string;
  topic?: string;
  count?: number;
}): Promise<AcademicTerm[]> {
  const { userId, subject, topic = "", count = 6 } = params;
  const excludes = loadExcludedItems("wordmaster", userId);

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/games/generate-challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "academic_terms",
        subject,
        topic,
        count,
        excludeItems: excludes.slice(0, 20),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.terms) && json.data.terms.length >= 2) {
        json.data.terms.forEach((t: AcademicTerm) => saveExcludedItem("wordmaster", userId, t.word));
        return json.data.terms;
      }
    }
  } catch (err) {
    console.warn("[ChallengeService] Erro ao buscar termos de IA, usando base de contingência:", err);
  }

  // Fallback didático
  return [
    {
      id: "term_fb1",
      word: "ESTOQUE",
      hint: "Conjunto de mercadorias ou insumos armazenados para produção ou venda.",
      category: subject,
      explanation: "A gestão de estoques é fundamental para evitar rupturas produtivas e excesso de custos de capital parado.",
    },
    {
      id: "term_fb2",
      word: "BALANCO",
      hint: "Demonstração contábil que evidencia o patrimônio da organização em dada data.",
      category: subject,
      explanation: "O balanço patrimonial reflete a posição financeira da entidade dividida em ativos, passivos e patrimônio líquido.",
    },
    {
      id: "term_fb3",
      word: "METODOS",
      hint: "Conjunto sistemático de procedimentos e técnicas para atingir metas.",
      category: subject,
      explanation: "Métodos estruturados garantem repetibilidade, eficiência e confiabilidade aos processos produtivos.",
    },
    {
      id: "term_fb4",
      word: "LOGISTICA",
      hint: "Área da administração responsável pelo fluxo de materiais e informações.",
      category: subject,
      explanation: "A logística abrange compras, armazenagem, transporte e logística reversa agregando valor de lugar e tempo.",
    },
  ];
}

/**
 * GERAÇÃO DINÂMICA DE PROBLEMAS MATEMÁTICOS CONTEXTUALIZADOS (MathRushGame)
 */
export async function fetchAcademicMathProblems(params: {
  userId: string;
  subject: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}): Promise<AcademicMathProblem[]> {
  const { userId, subject, topic = "", difficulty = "Médio", count = 5 } = params;
  const excludes = loadExcludedItems("math", userId);

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/games/generate-challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "math_problems",
        subject,
        topic,
        difficulty,
        count,
        excludeItems: excludes.slice(0, 15),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.problems) && json.data.problems.length >= 3) {
        json.data.problems.forEach((p: AcademicMathProblem) => saveExcludedItem("math", userId, p.equation));
        return json.data.problems;
      }
    }
  } catch (err) {
    console.warn("[ChallengeService] Erro ao buscar problemas de matemática:", err);
  }

  // Fallback contextualizado no IFES
  return [
    {
      id: "mp_1",
      equation: "Custo Fixo = R$ 12.000, Preço = R$ 80, Custo Variável = R$ 50. Qual o Ponto de Equilíbrio em unidades?",
      options: [300, 400, 500, 600],
      correctAnswer: 400,
      type: "Financeira",
      explanation: "Margem de Contribuição = 80 - 50 = R$ 30. PE = 12.000 / 30 = 400 unidades.",
    },
    {
      id: "mp_2",
      equation: "Um capital de R$ 5.000 aplicado a juros simples de 2% ao mês durante 6 meses renderá de juros:",
      options: [500, 600, 720, 800],
      correctAnswer: 600,
      type: "Financeira",
      explanation: "J = C × i × t = 5.000 × 0,02 × 6 = R$ 600.",
    },
    {
      id: "mp_3",
      equation: "Dada a função de receita R(x) = 25x e custo C(x) = 15x + 800, para qual quantidade o lucro é nulo?",
      options: [60, 70, 80, 100],
      correctAnswer: 80,
      type: "Função",
      explanation: "R(x) = C(x) => 25x = 15x + 800 => 10x = 800 => x = 80.",
    },
  ];
}

/**
 * GERAÇÃO DINÂMICA DE DESAFIOS DE LÓGICA (BrainChallengeGame)
 */
export async function fetchAcademicBrainChallenges(params: {
  userId: string;
  subject: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}): Promise<AcademicLogicChallenge[]> {
  const { userId, subject, topic = "", difficulty = "Médio", count = 4 } = params;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/games/generate-challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "logic_challenges",
        subject,
        topic,
        difficulty,
        count,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.challenges) && json.data.challenges.length >= 2) {
        return json.data.challenges;
      }
    }
  } catch (err) {
    console.warn("[ChallengeService] Erro ao buscar desafios de lógica:", err);
  }

  // Fallback
  return [
    {
      id: "ch_fb1",
      title: "Lógica Algorítmica & Notação",
      instruction: "Qual valor a variável soma terá ao final do laço:",
      question: "soma = 0; Para i de 1 até 4: soma = soma + (i * 2); FimPara. soma = ?",
      options: [16, 20, 24, 28],
      correctAnswer: 20,
      explanation: "i=1 => soma=2; i=2 => soma=2+4=6; i=3 => soma=6+6=12; i=4 => soma=12+8=20.",
    },
    {
      id: "ch_fb2",
      title: "Tabela-Verdade e Condicionais",
      instruction: "Dadas as premissas P (Verdadeiro) e Q (Falso), qual a validade de (P e não Q):",
      question: "P = V, Q = F. Qual é o resultado de (P ∧ ¬Q)?",
      options: ["Verdadeiro", "Falso", "Indeterminado", "Contradição Total"],
      correctAnswer: "Verdadeiro",
      explanation: "Se Q é Falso, ¬Q é Verdadeiro. Como P é Verdadeiro, V ∧ V resulta em Verdadeiro.",
    },
  ];
}
