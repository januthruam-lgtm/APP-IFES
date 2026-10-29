/**
 * Testes Automatizados para a Central dos 14 Métodos de Estudo Eficazes (Bloco 5B)
 * Verifica presença completa dos 14 métodos, níveis de evidência de Dunlosky et al. (2013),
 * referências científicas e critérios de aplicação.
 */

import assert from "node:assert";
import { METODOS_ESTUDO, MetodoEstudoInfo } from "../src/data/metodosEstudoData";

async function runMetodosEstudoTest() {
  console.log("🧠 Iniciando testes dos 14 Métodos de Estudo Científicos (Bloco 5B)...");

  // 1. Quantidade exata de métodos
  assert.strictEqual(METODOS_ESTUDO.length, 14, "Devem existir exatamente 14 métodos de estudo cadastrados");
  console.log("  ✓ Total de 14 métodos cadastrados verificado");

  // 2. Lista de IDs obrigatórios do documento mestre
  const idsEsperados = [
    "recuperacao_ativa",
    "repeticao_espacada",
    "entrelacamento",
    "feynman",
    "elaboracao_interrogativa",
    "cornell",
    "mapas_conceituais",
    "testes_praticos",
    "pomodoro",
    "dual_coding",
    "pre_teste",
    "resumo_estruturado",
    "estudo_intercalado",
    "sq3r",
  ];

  for (const id of idsEsperados) {
    const encontrado = METODOS_ESTUDO.find((m) => m.id === id);
    assert(encontrado, `Método obrigatório '${id}' não foi encontrado`);
    assert(encontrado.nome && encontrado.nome.length > 3, `'${id}' deve ter nome em português preenchido`);
    assert(encontrado.nomeIngles && encontrado.nomeIngles.length > 3, `'${id}' deve ter nome em inglês`);
    assert(encontrado.referenciaCientifica && encontrado.referenciaCientifica.length > 5, `'${id}' deve ter referência científica`);
    assert(encontrado.quandoUsar && encontrado.quandoUsar.length >= 1, `'${id}' deve ter lista de quando usar`);
    assert(encontrado.quandoNaoUsar && encontrado.quandoNaoUsar.length >= 1, `'${id}' deve ter lista de quando NÃO usar`);
    assert(encontrado.dicaPratica && encontrado.dicaPratica.length > 5, `'${id}' deve ter dica prática`);
  }
  console.log("  ✓ Todos os 14 métodos contêm dados científicos, quando usar e quando NÃO usar");

  // 3. Classificação de Dunlosky et al. (2013)
  const recuperacao = METODOS_ESTUDO.find((m) => m.id === "recuperacao_ativa")!;
  assert.strictEqual(recuperacao.nivelEvidencia, "Alta Utilidade", "Prática de recuperação deve ser Alta Utilidade");

  const repeticao = METODOS_ESTUDO.find((m) => m.id === "repeticao_espacada")!;
  assert.strictEqual(repeticao.nivelEvidencia, "Alta Utilidade", "Repetição espaçada deve ser Alta Utilidade");

  const testesPraticos = METODOS_ESTUDO.find((m) => m.id === "testes_praticos")!;
  assert.strictEqual(testesPraticos.nivelEvidencia, "Alta Utilidade", "Testes práticos devem ser Alta Utilidade");

  const feynman = METODOS_ESTUDO.find((m) => m.id === "feynman")!;
  assert.strictEqual(feynman.nivelEvidencia, "Moderada Utilidade", "Autoexplicação / Feynman deve ser Moderada Utilidade");

  const resumo = METODOS_ESTUDO.find((m) => m.id === "resumo_estruturado")!;
  assert.strictEqual(resumo.nivelEvidencia, "Utilidade Específica", "Resumo deve ser Utilidade Específica segundo Dunlosky");

  console.log("  ✓ Classificação fidedigna de Dunlosky et al. (2013) validada sem exageros");
  console.log("🎉 Todos os testes de Métodos de Estudo (Bloco 5B) passaram com êxito!");
  process.exit(0);
}

runMetodosEstudoTest().catch((err) => {
  console.error("❌ Falha nos testes de Métodos de Estudo:", err);
  process.exit(1);
});
