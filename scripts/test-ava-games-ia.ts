/**
 * Teste Automatizado de Integração Curricular AVA IFES para Quizzes e Minigames
 */

import {
  getEnrolledAcademicCourses,
  getTopicsForSubject,
  getAcademicContextForSubject,
  recordStudentPerformance,
  getStudentWeaknessesLocal,
} from "../src/features/games/services/avaGameContentService";

import {
  normalizeQuestionText,
  isSemanticallySimilar,
  isQuestionAlreadyAsked,
  QuizHistoryRecord,
} from "../src/features/games/services/quizIaService";

import {
  fetchAcademicMemoryPairs,
  fetchAcademicWordMasterTerms,
  fetchAcademicMathProblems,
} from "../src/features/games/services/challengeIaService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHOU: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSOU: ${message}`);
  }
}

async function runTests() {
  console.log("🧪 Iniciando Testes de Quizzes e Games com Conteúdos Reais do AVA IFES...\n");

  // TESTE 1: Disciplinas Reais Matriculadas
  console.log("1. Validação de Disciplinas Matriculadas:");
  const enrolled = getEnrolledAcademicCourses();
  assert(Array.isArray(enrolled) && enrolled.length > 0, "Lista de matérias matriculadas carregada com sucesso");
  assert(enrolled.some((c) => c.name.includes("Administração") || c.name.includes("Gestão")), "Possui matérias do curso do IFES");
  assert(!enrolled.some((c) => c.name.toLowerCase().includes("placeholder") || c.name.toLowerCase().includes("mock")), "Sem matérias fictícias ou mockadas");

  // TESTE 2: Tópicos Curriculares Específicos
  console.log("\n2. Mapeamento de Tópicos e Ementas por Disciplina:");
  const tgaTopics = getTopicsForSubject("Teoria Geral da Administração II");
  assert(tgaTopics.length >= 4, "TGA II possui tópicos curriculares detalhados");
  assert(tgaTopics.some((t) => t.includes("Fayol") || t.includes("Neoclássica")), "Tópico sobre Teoria Neoclássica e Fayol presente");

  const finTopics = getTopicsForSubject("Gestão Financeira e Orçamentária");
  assert(finTopics.some((t) => t.includes("Ponto de Equilíbrio") || t.includes("DRE")), "Tópicos de Finanças (DRE, Ponto de Equilíbrio) mapeados");

  const progTopics = getTopicsForSubject("Programação Web (Front-End & Back-End)");
  assert(progTopics.some((t) => t.includes("HTML5") || t.includes("JavaScript")), "Tópicos de Computação Web mapeados com precisão");

  // TESTE 3: Contexto Acadêmico Real
  console.log("\n3. Contexto Acadêmico Agregado (Aulas + Tarefas):");
  const tgaContext = getAcademicContextForSubject("Teoria Geral da Administração II");
  assert(Boolean(tgaContext.referenceSummary), "Resumo de referência curricular estruturado");
  assert(Array.isArray(tgaContext.topics) && tgaContext.topics.length > 0, "Lista de tópicos vinculada ao contexto");

  // TESTE 4: Prevenção Ativa de Repetição (Normalização e Similaridade Semântica)
  console.log("\n4. Eliminação de Perguntas Repetidas (Jaccard Semântico):");
  const q1 = "Qual é o objetivo principal do ciclo PDCA na gestão da qualidade?";
  const q2 = "Qual o objetivo primordial do ciclo PDCA na gestão da qualidade?";
  const q3 = "Como calcular o ponto de equilíbrio operacional em contabilidade de custos?";

  assert(normalizeQuestionText(q1) === "qual e o objetivo principal do ciclo pdca na gestao da qualidade", "Texto normalizado com remoção de acentos e pontuação");
  assert(isSemanticallySimilar(q1, q2), "Detecta redundância semântica entre enunciados similares");
  assert(!isSemanticallySimilar(q1, q3), "Diferencia perguntas com temas distintos");

  const mockHistory: QuizHistoryRecord[] = [
    {
      id: "h1",
      normalizedQuestion: normalizeQuestionText(q1),
      question: q1,
      category: "Administração",
      askedAt: new Date().toISOString(),
    },
  ];
  assert(isQuestionAlreadyAsked(q2, mockHistory), "Identifica questão repetida no histórico do aluno");
  assert(!isQuestionAlreadyAsked(q3, mockHistory), "Permite questão inédita");

  // TESTE 5: Registro e Modo Revisão Inteligente (Pontos Fracos)
  console.log("\n5. Sistema de Registro de Desempenho e Revisão Inteligente:");
  const testUserId = "test_student_unit_v1";

  // Simula erro em um tópico específico
  await recordStudentPerformance(
    testUserId,
    "Gestão Financeira e Orçamentária",
    "Ponto de Equilíbrio",
    "Qual a fórmula do PE em unidades?",
    false,
    "PE = Custos Fixos / Margem de Contribuição."
  );

  const weaknessesAfterError = getStudentWeaknessesLocal(testUserId);
  assert(weaknessesAfterError.length > 0, "Ponto fraco registrado após resposta incorreta");
  assert(weaknessesAfterError[0].topic === "Ponto de Equilíbrio", "Tópico com erro identificado corretamente");
  assert(!weaknessesAfterError[0].mastered, "Status indica pendência de aprendizado ativa");

  // Simula acerto no mesmo tópico
  await recordStudentPerformance(
    testUserId,
    "Gestão Financeira e Orçamentária",
    "Ponto de Equilíbrio",
    "Qual a fórmula do PE em unidades?",
    true
  );

  const weaknessesAfterCorrect = getStudentWeaknessesLocal(testUserId);
  assert(weaknessesAfterCorrect.length === 0, "Ponto fraco superado e removido após acerto");

  // TESTE 6: Desafios dos Minigames (Pares de Memória, Palavras e Matemática)
  console.log("\n6. Fallbacks Curriculares Autênticos dos Minigames:");
  const memoryPairs = await fetchAcademicMemoryPairs({
    userId: testUserId,
    subject: "Administração",
    count: 4,
  });
  assert(memoryPairs.length >= 3, "Pares de memória carregados com termos reais da disciplina");
  assert(Boolean(memoryPairs[0].termA && memoryPairs[0].termB), "Estrutura termo <-> definição válida");

  const wordTerms = await fetchAcademicWordMasterTerms({
    userId: testUserId,
    subject: "Administração",
    count: 4,
  });
  assert(wordTerms.length >= 2, "Termos acadêmicos para Mestre das Palavras gerados");
  assert(Boolean(wordTerms[0].explanation), "Termo possui explicação educativa associada");

  const mathProblems = await fetchAcademicMathProblems({
    userId: testUserId,
    subject: "Finanças",
    count: 3,
  });
  assert(mathProblems.length >= 2, "Problemas matemáticos contextualizados gerados");
  assert(mathProblems[0].options.includes(mathProblems[0].correctAnswer), "Opção correta presente nas alternativas");
  assert(Boolean(mathProblems[0].explanation), "Resolução pedagógica passo a passo presente");

  console.log("\n🎉 TODOS OS TESTES DE INTEGRAÇÃO CURRICULAR AVA IFES PASSARAM COM 100% DE SUCESSO!");
}

runTests().catch((err) => {
  console.error("Erro fatal durante execução dos testes:", err);
  process.exit(1);
});
