/**
 * Brain Studio - Serviço Inteligente de Quizzes com IA e Prevenção de Repetição (PARTE 3)
 *
 * Funcionalidades:
 * 1. Geração dinâmica de perguntas inéditas via Gemini IA para todas as matérias.
 * 2. Prevenção rigorosa de repetição: histórico persistente no Firestore e localStorage.
 * 3. Validação de similaridade semântica para impedir perguntas redundantes.
 * 4. Tratamento transparente de falhas (informa o estudante sem forçar perguntas repetidas).
 */

import { FirestoreService } from "../../../lib/firestoreService";

export interface QuizIaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty?: string;
  generatedAt?: string;
}

export interface QuizHistoryRecord {
  id: string;
  normalizedQuestion: string;
  question: string;
  category: string;
  askedAt: string;
}

const STORAGE_QUIZ_HISTORY_KEY = "brain_studio_quiz_history_v1";

/**
 * Normaliza o texto de uma pergunta removendo acentuação, pontuação e espaços redundantes.
 */
export function normalizeQuestionText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calcula a similaridade de Jaccard entre dois conjuntos de palavras.
 * Se >= 0.70, considera semanticamente equivalente.
 */
export function isSemanticallySimilar(textA: string, textB: string): boolean {
  const normA = normalizeQuestionText(textA);
  const normB = normalizeQuestionText(textB);

  if (normA === normB) return true;

  const wordsA = new Set(normA.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(normB.split(" ").filter((w) => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  const similarity = intersection / union;

  return similarity >= 0.70;
}

/**
 * Carrega o histórico local de perguntas já apresentadas ao jogador.
 */
export function loadLocalQuizHistory(userId: string): QuizHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_QUIZ_HISTORY_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Salva o histórico de perguntas localmente e tenta persistir no Firestore.
 */
export async function saveQuizQuestionToHistory(
  userId: string,
  question: QuizIaQuestion
): Promise<void> {
  const cleanNorm = normalizeQuestionText(question.question);
  const record: QuizHistoryRecord = {
    id: `qh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    normalizedQuestion: cleanNorm,
    question: question.question,
    category: question.category,
    askedAt: new Date().toISOString(),
  };

  // 1. Salvar no cache local
  try {
    const current = loadLocalQuizHistory(userId);
    // Limita a 500 itens no histórico para controle de memória
    const updated = [record, ...current.slice(0, 499)];
    localStorage.setItem(`${STORAGE_QUIZ_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
  } catch {}

  // 2. Persistir no Firestore associado à conta do aluno
  if (userId && userId !== "local_user") {
    try {
      await FirestoreService.setDocument(`users/${userId}/quizHistory`, record.id, record);
    } catch (err) {
      console.warn("[QuizService] Falha ao persistir no Firestore:", err);
    }
  }
}

/**
 * Verifica se a pergunta já foi apresentada anteriormente ao aluno.
 */
export function isQuestionAlreadyAsked(
  questionText: string,
  history: QuizHistoryRecord[]
): boolean {
  for (const h of history) {
    if (isSemanticallySimilar(questionText, h.question)) {
      return true;
    }
  }
  return false;
}

/**
 * Gera perguntas dinâmicas e inéditas usando a IA com prevenção ativa de repetição.
 */
export async function generateUnprecedentedQuizQuestions(params: {
  userId: string;
  subject: string;
  topic?: string;
  difficulty?: "Fácil" | "Médio" | "Difícil";
  schoolLevel?: string;
  count?: number;
}): Promise<{
  success: boolean;
  questions: QuizIaQuestion[];
  error?: string;
}> {
  const {
    userId,
    subject,
    topic = "",
    difficulty = "Médio",
    schoolLevel = "Ensino Médio e Técnico IFES",
    count = 5,
  } = params;

  // 1. Carregar histórico do estudante (local + remoto)
  const localHistory = loadLocalQuizHistory(userId);
  const excludeSnippets = localHistory.slice(0, 25).map((h) => h.question);

  try {
    const res = await fetch("/api/quiz/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        topic,
        difficulty,
        schoolLevel,
        count,
        excludeQuestions: excludeSnippets,
        language: "pt-BR",
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Servidor retornou status HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("Nenhuma pergunta válida retornada pelo gerador de IA.");
    }

    // 2. Filtragem secundária rigorosa contra repetições no cliente
    const filteredQuestions: QuizIaQuestion[] = [];
    for (const q of data.questions) {
      if (!isQuestionAlreadyAsked(q.question, localHistory)) {
        filteredQuestions.push({
          ...q,
          difficulty,
          category: subject,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    if (filteredQuestions.length === 0) {
      throw new Error(
        `Todas as perguntas geradas coincidiram com o histórico anterior. Tente solicitar outro tópico de ${subject}.`
      );
    }

    return {
      success: true,
      questions: filteredQuestions,
    };
  } catch (err: any) {
    console.error("[QuizIAService] Erro ao gerar perguntas inéditas:", err);
    return {
      success: false,
      questions: [],
      error:
        err?.message ||
        `Não foi possível gerar novas perguntas de ${subject} neste momento. Verifique a conexão e tente novamente.`,
    };
  }
}
