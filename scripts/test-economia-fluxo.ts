/**
 * Brain Studio - Testes de Fluxo da Economia Acadêmica (Fase 4)
 * Testa abertura dos 15 baús, missões, congelamento e sumidouros.
 */

import {
  abrirProximoBauEquipe,
  getProgressoMissoesDiarias,
  resgatarRecompensaMissao,
  comprarCongelamentoOfensiva,
  comprarItemLojaAcademica,
  getDiaEconomiaAtual,
  salvarEconomiaDiariaLocal,
} from "../src/utils/economyManager";
import { UserProfile } from "../src/types";
import { ECONOMIA_CONFIG } from "../src/config/economia.config";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSOU: ${msg}`);
}

async function runTests() {
  console.log("\n🧪 Testando Fluxo de Economia Acadêmica (Fase 4):");

  const dia = getDiaEconomiaAtual();
  const testUid = "test_student_4a";

  // Limpa estado de teste
  salvarEconomiaDiariaLocal(testUid, {
    data: dia,
    bausAbertosHoje: 0,
    moedasGanhasHoje: 0,
    chavesBausAbertos: [],
    missoesResgatadasHoje: [],
  });

  let mockUser: UserProfile = {
    id: testUid,
    uid: testUid,
    email: "estudante@ifes.edu.br",
    name: "Estudante Teste",
    xp: 500,
    coins: 1000,
    level: 3,
    energy: 20,
    maxEnergy: 50,
    lastEnergyRecharge: new Date().toISOString(),
    streakDays: 30, // +10% de bônus de ofensiva
    lastActiveDate: dia,
    selectedCourseId: "mat1",
    teamId: "equipe1",
    activeTheme: "claro",
    unlockedThemes: ["claro", "escuro"],
    equippedBadge: "iniciante",
    unlockedBadges: ["iniciante"],
    completedModules: [],
    congelamentosOfensiva: 0,
    itensInventario: {},
    stats: {
      socraticInteractions: 5,
      quizzesAnswered: 2,
      correctQuizzes: 2,
      battlesWon: 1,
      battlesTotal: 1,
      flashcardsReviewed: 15,
    },
    streakHistory: [{ date: dia, activitiesCount: 3, xpGained: 80 }],
  };

  // 1. Abertura sequencial de Baús (1 a 15)
  const xpEquipe = 10000; // +10% de bônus de equipe. Total bônus = 10% + 10% = 20%
  console.log("\n- Testando Abertura de 15 Baús Diários:");

  for (let i = 1; i <= 15; i++) {
    const res = await abrirProximoBauEquipe(mockUser, xpEquipe);
    assert(res.success, `Baú ${i} aberto com sucesso`);
    assert(res.recompensa?.bauNumero === i, `Número do baú retornado é ${i}`);
    mockUser = res.updatedUser!;
  }

  // Baú 16 deve falhar por limite diário atingido
  const res16 = await abrirProximoBauEquipe(mockUser, xpEquipe);
  assert(!res16.success, "16º baú é bloqueado pela cota diária de 15 baús");
  assert(res16.mensagem.includes("Limite diário atingido"), "Mensagem informativa exibida para o usuário");

  // 2. Testando Missões Diárias
  console.log("\n- Testando Missões Diárias (4B):");
  const progresso = getProgressoMissoesDiarias(mockUser);
  assert(progresso.missoes.length === 3, "3 missões diárias ativas");
  assert(progresso.todasConcluidas, "Todas as 3 missões foram concluídas pelos estudos de hoje");

  // Resgatar missão 50 XP
  const rM1 = await resgatarRecompensaMissao(mockUser, "missao_50_xp");
  assert(rM1.success && rM1.moedasGanhas === 30, "Missão 50 XP resgatada (+30 moedas)");
  mockUser = rM1.updatedUser!;

  // Tentativa de resgatar novamente mesma missão deve falhar
  const rM1Repetido = await resgatarRecompensaMissao(mockUser, "missao_50_xp");
  assert(!rM1Repetido.success, "Resgate duplicado no mesmo dia bloqueado com segurança");

  // 3. Testando Proteção de Congelamento de Ofensiva (4B)
  console.log("\n- Testando Congelamento de Ofensiva (Streak Freeze):");
  assert((mockUser.congelamentosOfensiva || 0) >= 1, "Baú 10 concedeu 1 congelamento no inventário");

  const saldoAntes = mockUser.coins;
  // Comprar até atingir o limite de 2
  mockUser.congelamentosOfensiva = 1;
  const comp1 = await comprarCongelamentoOfensiva(mockUser);
  assert(comp1.success, "Compra de congelamento por 300 moedas bem-sucedida");
  mockUser = comp1.updatedUser!;
  assert(mockUser.coins === saldoAntes - 300, "Saldo de moedas debitado exatamente em 300");
  assert(mockUser.congelamentosOfensiva === 2, "Estoque agora possui 2 congelamentos");

  // Tentativa com estoque cheio (2) deve falhar
  const comp2 = await comprarCongelamentoOfensiva(mockUser);
  assert(!comp2.success, "Bloqueia compra quando estoque atinge limite máximo de 2");

  // 4. Testando Sumidouros da Loja (4D)
  console.log("\n- Testando Sumidouros da Loja (4D):");
  const compComida = await comprarItemLojaAcademica(mockUser, "comida_pet");
  assert(compComida.success, "Compra de ração energética bem-sucedida");
  mockUser = compComida.updatedUser!;
  assert(mockUser.energy === 40, "Ração energética concedeu +20 de energia vital (20 -> 40)");

  const compBoost = await comprarItemLojaAcademica(mockUser, "bonus_xp");
  assert(compBoost.success, "Compra de XP Boost 1.5x bem-sucedida");
  mockUser = compBoost.updatedUser!;
  assert(Boolean(mockUser.xpBoostAte && mockUser.xpBoostAte > Date.now()), "XP Boost temporário ativo no perfil");

  console.log("\n🎉 TODOS OS TESTES DE FLUXO DA ECONOMIA PASSARAM COM 100% DE SUCESSO!\n");
}

runTests().catch((e) => {
  console.error("Erro nos testes:", e);
  process.exit(1);
});
