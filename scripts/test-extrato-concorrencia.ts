/**
 * Brain Studio - Teste de Concorrência e Auditoria do Livro-Razão Contábil (Bloco 3)
 * Valida:
 * 1. 10 chamadas concorrentes assíncronas com cálculo matematicamente exato.
 * 2. Idempotência estrita (chaves repetidas não duplicam crédito/débito).
 * 3. Barreira contra saldo negativo.
 * 4. Migração inicial não destrutiva ("historico").
 * 5. Reconciliação contábil automática de divergências.
 */

import {
  movimentarMoedas,
  carregarExtratoLocal,
  garantirSaldoInicialExtrato,
  auditarSaldoContabil,
  reconciliarSaldoExtrato,
} from "../src/features/economia/services/extratoService";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FALHA: ${msg}`);
    throw new Error(msg);
  }
  passedTests++;
  console.log(`  ✓ ${msg}`);
}

// Mock de localStorage em Node.js
const storageMap = new Map<string, string>();
if (typeof globalThis.localStorage === "undefined") {
  (globalThis as any).localStorage = {
    getItem: (key: string) => storageMap.get(key) || null,
    setItem: (key: string, val: string) => storageMap.set(key, val),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
  };
}

async function runConcurrencyAndAuditTests() {
  console.log("\n=======================================================");
  console.log("TESTES DE TRANSAÇÕES ATÔMICAS E CONCORRÊNCIA (BLOCO 3)");
  console.log("=======================================================");

  const testUid = `student_concurrency_${Date.now()}`;
  const initialCoins = 100;

  // Inicializa o perfil do usuário mock
  localStorage.setItem(
    "brain_studio_user_profile",
    JSON.stringify({ id: testUid, uid: testUid, coins: initialCoins })
  );

  console.log("\n[1] Migração de Saldo Inicial no Livro-Razão:");
  await garantirSaldoInicialExtrato(testUid, initialCoins);
  const extratoAposMigracao = carregarExtratoLocal(testUid);
  assert(extratoAposMigracao.length === 1, "Extrato possui 1 lançamento inicial de histórico");
  assert(extratoAposMigracao[0].origem === "historico", "Lançamento inicial registrado como origem 'historico'");
  assert(extratoAposMigracao[0].valor === initialCoins, `Valor do saldo histórico é ${initialCoins} moedas`);

  // Idempotência da migração inicial
  await garantirSaldoInicialExtrato(testUid, initialCoins);
  const extratoReMigracao = carregarExtratoLocal(testUid);
  assert(extratoReMigracao.length === 1, "Re-execução da migração não duplica lançamento histórico (idempotente)");

  console.log("\n[2] Teste de Concorrência: 10 Chamadas Simultâneas:");
  // Preparar 10 operações:
  // 5 ganhos de +10 moedas (+50)
  // 3 gastos de -15 moedas (-45)
  // 2 chamadas repetidas com a mesma chave (idempotência em concorrência)
  const chaveRepetidaGanho = `tx_dup_ganho_${Date.now()}`;
  const chaveRepetidaGasto = `tx_dup_gasto_${Date.now()}`;

  const promessas = [
    // 5 ganhos únicos
    movimentarMoedas(testUid, 10, "missao", "m1", `tx_conc_g1_${Date.now()}`, "Missão 1"),
    movimentarMoedas(testUid, 10, "missao", "m2", `tx_conc_g2_${Date.now()}`, "Missão 2"),
    movimentarMoedas(testUid, 10, "missao", "m3", `tx_conc_g3_${Date.now()}`, "Missão 3"),
    movimentarMoedas(testUid, 10, "bau", "b1", `tx_conc_g4_${Date.now()}`, "Baú 1"),
    movimentarMoedas(testUid, 10, "bau", "b2", `tx_conc_g5_${Date.now()}`, "Baú 2"),

    // 3 gastos únicos
    movimentarMoedas(testUid, -15, "loja", "item1", `tx_conc_d1_${Date.now()}`, "Compra 1"),
    movimentarMoedas(testUid, -15, "loja", "item2", `tx_conc_d2_${Date.now()}`, "Compra 2"),
    movimentarMoedas(testUid, -15, "loja", "item3", `tx_conc_d3_${Date.now()}`, "Compra 3"),

    // 2 chamadas repetidas com chave fixa (idempotência)
    movimentarMoedas(testUid, 10, "missao", "dup", chaveRepetidaGanho, "Missão Duplicada (1ª tentativa)"),
    movimentarMoedas(testUid, 10, "missao", "dup", chaveRepetidaGanho, "Missão Duplicada (2ª tentativa idêntica)"),
  ];

  // Executa simultaneamente via Promise.all
  const resultados = await Promise.all(promessas);
  assert(resultados.length === 10, "Todas as 10 operações concorrentes foram executadas");

  for (const r of resultados) {
    assert(r.sucesso === true, "Operação concorrente retornou sucesso=true");
  }

  // Cálculo matemático exato:
  // Inicial: 100
  // Ganhos únicos: 5 * 10 = +50
  // Gastos únicos: 3 * 15 = -45
  // Ganho repetido (processado uma única vez): +10
  // Total esperado = 100 + 50 - 45 + 10 = 115
  const userProfile = JSON.parse(localStorage.getItem("brain_studio_user_profile") || "{}");
  assert(
    userProfile.coins === 115,
    `Saldo do usuário após 10 transações concorrentes é exatamente 115 (calculado: ${userProfile.coins})`
  );

  console.log("\n[3] Barreira Contra Saldo Negativo em Compras:");
  // Tentar gastar 500 moedas com saldo de 115
  const resCompraInvalida = await movimentarMoedas(
    testUid,
    -500,
    "loja",
    "item_caro",
    `tx_invalid_${Date.now()}`,
    "Item Caríssimo"
  );
  assert(resCompraInvalida.sucesso === false, "Compra que deixaria saldo negativo é rejeitada");
  assert(
    resCompraInvalida.mensagem?.includes("insuficiente") ?? false,
    "Mensagem informa saldo insuficiente"
  );
  const userAposRejeicao = JSON.parse(localStorage.getItem("brain_studio_user_profile") || "{}");
  assert(userAposRejeicao.coins === 115, "Saldo do usuário foi preservado intacto em 115 moedas");

  console.log("\n[4] Auditoria Contábil e Soma do Extrato:");
  const extratoCompleto = carregarExtratoLocal(testUid);
  const auditoria = auditarSaldoContabil(userAposRejeicao.coins, extratoCompleto);
  assert(auditoria.consistente === true, "Auditoria confirma: saldo bate 100% com a soma do extrato");
  assert(auditoria.divergencia === 0, "Divergência contábil é exatamente 0");
  assert(auditoria.saldoRecalculado === 115, "Saldo recalculado matematicamente é 115");

  console.log("\n[5] Reconciliação Contábil Automática em Caso de Divergência:");
  // Simular uma divergência forçada (ex: corrupção de cache local onde saldo está marcado como 200)
  const saldoCorrompido = 200;
  const auditCorrompida = auditarSaldoContabil(saldoCorrompido, extratoCompleto);
  assert(auditCorrompida.consistente === false, "Auditoria detecta divergência quando saldo local foi corrompido");
  assert(auditCorrompida.divergencia === 85, "Divergência identificada é de 85 moedas (200 - 115)");

  // Executa reconciliação automática
  const resReconciliacao = await reconciliarSaldoExtrato(testUid, saldoCorrompido);
  assert(resReconciliacao.corrigido === true, "Reconciliação corrigiu a divergência");
  assert(resReconciliacao.novoSaldo === 115, "Novo saldo corrigido bate com o livro-razão contábil (115)");

  const extratoPosReconciliacao = carregarExtratoLocal(testUid);
  const auditoriaFinal = auditarSaldoContabil(resReconciliacao.novoSaldo, extratoPosReconciliacao);
  assert(auditoriaFinal.consistente === true, "Auditoria final confirma equilíbrio contábil perfeito");
  assert(auditoriaFinal.divergencia === 0, "Divergência final zerada");

  console.log("\n=======================================================");
  console.log(`TOTAL: ${totalTests} TESTES DE TRANSAÇÕES | APROVADOS: ${passedTests}`);
  console.log("=======================================================");
  process.exit(0);
}

runConcurrencyAndAuditTests().catch((err) => {
  console.error("Erro fatal no teste de concorrência:", err);
  process.exit(1);
});
