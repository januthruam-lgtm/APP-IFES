/**
 * Brain Studio - Testes Unitários de Extrato Contábil & Saídas Monetárias
 * Verifica que todas as deduções/saídas financeiras são debitadas, registradas
 * no livro-razão e auditadas com precisão contábil matemática absoluta.
 */

import {
  movimentarMoedas,
  auditarSaldoContabil,
  carregarExtratoLocal,
  garantirSaldoInicialExtrato,
  LancamentoExtrato,
} from "../src/features/economia/services/extratoService";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}`);
}

async function runExtratoTests() {
  console.log("\n=======================================================");
  console.log("TESTES: LIVRO-RAZÃO E CONTABILIZAÇÃO DE SAÍDAS MONETÁRIAS");
  console.log("=======================================================");

  const testUid = `test_user_extrato_${Date.now()}`;

  // Mock de localStorage no ambiente Node/CLI
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  (global as any).window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  // Inicializa perfil com saldo inicial de 500 moedas
  localStorage.setItem(
    "brain_studio_user_v3",
    JSON.stringify({ id: testUid, coins: 500, name: "Estudante Auditor" })
  );

  console.log("\n[1] Registro do Saldo Inicial e Auditoria Inicial:");
  await garantirSaldoInicialExtrato(testUid, 500);
  const extratoInicial = carregarExtratoLocal(testUid);
  assert(extratoInicial.length === 1, "Extrato possui 1 lançamento inicial de migração");
  assert(extratoInicial[0].origem === "historico", "Lançamento inicial tem origem 'historico'");
  assert(extratoInicial[0].valor === 500, "Valor do saldo inicial é 500");

  const auditInicial = auditarSaldoContabil(500, extratoInicial);
  assert(auditInicial.consistente, "Auditoria inicial está 100% consistente (divergência = 0)");
  assert(auditInicial.saldoRecalculado === 500, "Saldo recalculado confere com 500");

  console.log("\n[2] Contabilização de Múltiplas Saídas Monetárias (Gastos / Débitos):");

  // Saída 1: Compra de Energia na Loja (20 moedas)
  const tx1 = await movimentarMoedas(
    testUid,
    -20,
    "loja",
    "energia",
    "tx_teste_energia",
    "Recarga de +15 Energias Rápidas"
  );
  assert(tx1.sucesso, "Saída 1 (Energia) executada com sucesso");
  assert(tx1.novoSaldo === 480, "Novo saldo após saída 1 é 480 moedas");
  assert(tx1.lancamento?.tipo === "gasto", "Tipo contábil registrado é 'gasto'");
  assert(tx1.lancamento?.valor === 20, "Valor absoluto registrado no lançamento é 20");

  // Saída 2: Adoção de Mascote 3D (100 moedas)
  const tx2 = await movimentarMoedas(
    testUid,
    -100,
    "cosmetico",
    "capivara",
    "tx_teste_pet",
    "Adoção de Mascote: Capi Cientista"
  );
  assert(tx2.sucesso, "Saída 2 (Pet 3D) executada com sucesso");
  assert(tx2.novoSaldo === 380, "Novo saldo após saída 2 é 380 moedas");

  // Saída 3: Upgrade Permanente de Bateria (120 moedas)
  const tx3 = await movimentarMoedas(
    testUid,
    -120,
    "loja",
    "bateria_max",
    "tx_teste_upgrade_bateria",
    "Upgrade permanente de bateria (+5)"
  );
  assert(tx3.sucesso, "Saída 3 (Upgrade Permanente) executada com sucesso");
  assert(tx3.novoSaldo === 260, "Novo saldo após saída 3 é 260 moedas");

  // Saída 4: Pacote de Cartas Colecionáveis (60 moedas)
  const tx4 = await movimentarMoedas(
    testUid,
    -60,
    "loja",
    "pack_ouro",
    "tx_teste_card_pack",
    "Compra de Pacote: Pacote de Ouro"
  );
  assert(tx4.sucesso, "Saída 4 (Pacote de Cartas) executada com sucesso");
  assert(tx4.novoSaldo === 200, "Novo saldo após saída 4 é 200 moedas");

  // Saída 5: Construção de Monumento na Vila do Saber (75 moedas)
  const tx5 = await movimentarMoedas(
    testUid,
    -75,
    "cidade",
    "biblioteca_central",
    "tx_teste_cidade_obra",
    "Construção na Aldeia do Saber: biblioteca_central (Nível 2)"
  );
  assert(tx5.sucesso, "Saída 5 (Construção Cidade) executada com sucesso");
  assert(tx5.novoSaldo === 125, "Novo saldo após saída 5 é 125 moedas");

  console.log("\n[3] Intercalação com Entradas e Cashback:");
  // Entrada: Recompensa de Missão (+40 moedas)
  const tx6 = await movimentarMoedas(
    testUid,
    40,
    "missao",
    "missao_1_quiz",
    "tx_teste_missao_recompensa",
    "Missão Diária Concluída"
  );
  assert(tx6.sucesso, "Entrada (Missão) creditada com sucesso");
  assert(tx6.novoSaldo === 165, "Saldo após entrada é 165 moedas");

  // Cashback de Fidelidade (+15 moedas)
  const tx7 = await movimentarMoedas(
    testUid,
    15,
    "fidelidade",
    "resgate_cofre",
    "tx_teste_cashback",
    "Resgate do Cofre de Retorno"
  );
  assert(tx7.sucesso, "Cashback de fidelidade creditado com sucesso");
  assert(tx7.novoSaldo === 180, "Saldo após cashback é 180 moedas");

  console.log("\n[4] Totalização e Cálculo dos Indicadores do Extrato (ExtratoMoedasView):");
  const extratoCompleto = carregarExtratoLocal(testUid);
  assert(extratoCompleto.length === 8, "Extrato possui 8 lançamentos totais");

  const isSaida = (t: string) => t === "gasto" || t === "saida" || t === "debito";
  const isEntrada = (t: string) => t === "ganho";

  const totalGastosComputado = extratoCompleto
    .filter((l) => isSaida(l.tipo))
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);

  // Gastos esperados: 20 + 100 + 120 + 60 + 75 = 375 moedas
  assert(
    totalGastosComputado === 375,
    `Total de saídas monetárias calculado com exatidão: ${totalGastosComputado} 🪙 (esperado: 375)`
  );

  const totalGanhosComputado = extratoCompleto
    .filter((l) => isEntrada(l.tipo))
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);
  assert(totalGanhosComputado === 40, `Total de entradas calculado com exatidão: ${totalGanhosComputado} 🪙 (esperado: 40)`);

  const totalCashbackComputado = extratoCompleto
    .filter((l) => l.tipo === "cashback")
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);
  assert(totalCashbackComputado === 15, `Total de cashback calculado: ${totalCashbackComputado} 🪙 (esperado: 15)`);

  console.log("\n[5] Auditoria Matemática do Livro-Razão:");
  // Saldo final: 500 (inicial) - 375 (gastos) + 40 (ganho) + 15 (cashback) = 180 moedas
  const auditoriaFinal = auditarSaldoContabil(180, extratoCompleto);
  assert(auditoriaFinal.consistente, "Auditoria contábil completa válida (consistente = true)");
  assert(auditoriaFinal.divergencia === 0, "Diferença contábil é 0 moedas");
  assert(auditoriaFinal.saldoRecalculado === 180, "Saldo auditado recalculado confere perfeitamente: 180");

  console.log("\n[6] Proteção contra Saldo Negativo e Idempotência:");
  // Tentativa de gastar mais do que possui (250 moedas quando saldo é 180)
  const txOverspend = await movimentarMoedas(
    testUid,
    -250,
    "loja",
    "item_caro",
    "tx_overspend",
    "Tentativa de compra sem saldo"
  );
  assert(!txOverspend.sucesso, "Gasto maior que saldo disponível é bloqueado com segurança");
  assert(txOverspend.novoSaldo === 180, "Saldo permanece inalterado em 180");

  // Idempotência: reenvio da mesma chave não pode duplicar saída
  const txDuplicada = await movimentarMoedas(
    testUid,
    -20,
    "loja",
    "energia",
    "tx_teste_energia",
    "Recarga repetida"
  );
  assert(txDuplicada.sucesso, "Operação repetida é tratada como sucesso idempotente");
  assert(txDuplicada.novoSaldo === 480, "Retorna saldo original sem deduzir novamente");

  console.log("\n[7] Interoperabilidade de Chaves Locais (local_user vs local-user):");
  localStorage.setItem(
    "brain_studio_user_v3",
    JSON.stringify({ id: "local_user", coins: 300 })
  );
  await movimentarMoedas("local_user", -50, "loja", "item1", "tx_local_1", "Saída local_user");
  const listaLocalUnder = carregarExtratoLocal("local_user");
  const listaLocalHyphen = carregarExtratoLocal("local-user");
  assert(listaLocalUnder.length >= 1, "local_user possui lançamento gravado");
  assert(listaLocalHyphen.length >= 1, "local-user recupera lançamentos interoperáveis com sucesso");

  console.log("\n=======================================================");
  console.log("TODOS OS TESTES DE SAÍDAS DO EXTRATO PASSARAM COM SUCESSO!");
  console.log("=======================================================\n");
}

runExtratoTests().catch((err) => {
  console.error("Erro fatal no teste de extrato:", err);
  process.exit(1);
});
