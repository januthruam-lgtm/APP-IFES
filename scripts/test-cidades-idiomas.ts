/**
 * Brain Studio - Testes Automatizados de Cidades (IBGE e Gamificação) e Cobertura Universal de Idiomas
 */

import fs from "fs";
import path from "path";
import {
  CIDADES,
  ESTAGIOS_CIDADE,
  calcularCustoEstagio,
  calcularCustoTotalCidade,
  obterCidadeDefinicao,
  obterEstagio,
} from "../src/config/cidade.config";
import { obterInfoAparencia } from "../src/components/tabs/cidade/AparenciaEdificacao";
import {
  obterEstadoCidadePadrao,
  calcularProgressoCidade,
  normalizarEstadoCidade,
} from "../src/features/cidade/services/cidadeService";
import {
  buscarMunicipiosIbge,
  obterMunicipiosPorTermo,
  MUNICIPIOS_FALLBACK_BR,
} from "../src/features/instituicao/services/ibgeService";
import { SUPPORTED_LANGUAGES } from "../src/i18n";

let totalTests = 0;
let passedTests = 0;

function assert(condicao: boolean, descricao: string) {
  totalTests++;
  if (condicao) {
    passedTests++;
    console.log(`  ✓ ${descricao}`);
  } else {
    console.error(`  ✗ FALHA: ${descricao}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("=======================================================");
  console.log("TESTES: CIDADES (IBGE & GAMIFICAÇÃO) E 25 IDIOMAS");
  console.log("=======================================================");

  // -----------------------------------------------------------------
  // 1. SERVIÇO DE LOCALIDADES & MUNICÍPIOS DO IBGE
  // -----------------------------------------------------------------
  console.log("\n[1] Localidades e Municípios do Brasil (IBGE):");

  const cidadesES = await buscarMunicipiosIbge("ES");
  assert(cidadesES.length >= 10, `Retornou ${cidadesES.length} municípios para o Espírito Santo`);
  assert(cidadesES.includes("Vitória"), "Contém a capital Vitória");
  assert(cidadesES.includes("Vila Velha"), "Contém Vila Velha");
  assert(cidadesES.includes("Serra"), "Contém Serra");

  const cidadesSP = await buscarMunicipiosIbge("SP");
  assert(cidadesSP.includes("São Paulo"), "Contém São Paulo");
  assert(cidadesSP.includes("Campinas"), "Contém Campinas");

  const filtroTermo = await obterMunicipiosPorTermo("ES", "vitor");
  assert(filtroTermo.length > 0 && filtroTermo.some((c) => c.toLowerCase().includes("vitória")), "Filtro com remoção de acentos encontrou Vitória");

  const ufInvalida = await buscarMunicipiosIbge("XX");
  assert(ufInvalida.length === 0, "UF inválida retorna array vazio com segurança");

  // -----------------------------------------------------------------
  // 2. CIDADE DO CONHECIMENTO (PROGRESSÃO ACADÊMICA FASE 6)
  // -----------------------------------------------------------------
  console.log("\n[2] Cidade do Conhecimento (10 Cidades & Fórmulas Puras):");

  assert(CIDADES.length === 10, "Exatamente 10 cidades acadêmicas cadastradas");
  assert(ESTAGIOS_CIDADE.length === 5, "Exatamente 5 estágios por construção (Terreno até Monumento)");

  // Cidade 1: baseCusto 15. Estágio 2 (Acampamento, peso 1.5) => 15 * 1.5 = 22.5 => arredonda para 25
  const custoC1E2 = calcularCustoEstagio(1, 2);
  assert(custoC1E2 === 25, `Custo Cidade 1 Estágio 2 é 25 moedas (calculado: ${custoC1E2})`);

  // Cidade 1: Estágio 5 (Monumento, peso 6) => 15 * 6 = 90
  const custoC1E5 = calcularCustoEstagio(1, 5);
  assert(custoC1E5 === 90, `Custo Cidade 1 Estágio 5 é 90 moedas (calculado: ${custoC1E5})`);

  // Custo total da Cidade 1: soma dos 5 estágios * 4 construções
  const custoTotalC1 = calcularCustoTotalCidade(1);
  assert(custoTotalC1 > 0 && custoTotalC1 % 5 === 0, `Custo total da Cidade 1 é múltiplo de 5 (${custoTotalC1} 🪙)`);

  // Estado padrão
  const estadoPadrao = obterEstadoCidadePadrao(1);
  assert(estadoPadrao.cidadeAtual === 1, "Cidade inicial ativa é 1 (Aldeia do Saber)");
  assert(Object.keys(estadoPadrao.construcoes).length === 4, "Cidade 1 inicia com 4 construções no terreno");
  assert(estadoPadrao.ajudasHoje === 0, "Ajudas diárias iniciam zeradas");

  // Cálculo de progresso
  const progressoInicial = calcularProgressoCidade(estadoPadrao, 1);
  assert(progressoInicial.concluidos === 4, "Progresso inicial: 4 estágios construídos");
  assert(progressoInicial.total === 20, "Total de estágios da Cidade 1 é 20 (4 x 5)");
  assert(progressoInicial.porcentagem === 20, "Porcentagem inicial é 20%");
  assert(!progressoInicial.todasNoMaximo, "Cidade não está completa no início");

  // Normalização de estado
  const normalizado = normalizarEstadoCidade({ cidadeAtual: 1, construcoes: { biblioteca: 3 } });
  assert(normalizado.construcoes.biblioteca === 3, "Preserva nível de construção existente");
  assert(normalizado.construcoes.laboratorio === 1, "Preenche construção ausente com nível 1");

  // Progressão Ilimitada de Cidades (Níveis Infinitos)
  const cidade11 = obterCidadeDefinicao(11);
  assert(cidade11.id === 11, "Cidade 11 gerada proceduralmente");
  assert(cidade11.nome.length > 3, `Cidade 11 possui nome temático (${cidade11.nome})`);
  assert(cidade11.baseCusto > 800, `Cidade 11 escala base de custo (${cidade11.baseCusto} 🪙)`);
  assert(cidade11.totalConstrucoes === 6, "Cidade 11 possui 6 construções");

  const cidade100 = obterCidadeDefinicao(100);
  assert(cidade100.id === 100, "Cidade 100 gerada proceduralmente com sucesso");
  assert(cidade100.baseCusto > cidade11.baseCusto, "Cidade 100 escala com progressão contínua");

  // Níveis Ilimitados de Obras (Mestria Celestial)
  const estagioNivel5 = obterEstagio(5);
  assert(estagioNivel5.nome === "Monumento", "Nível 5 é Monumento clássico");

  const estagioNivel6 = obterEstagio(6);
  assert(estagioNivel6.nome.includes("Mestria I"), `Nível 6 é Estágio de Mestria (${estagioNivel6.nome})`);
  assert(estagioNivel6.peso > estagioNivel5.peso, "Peso de Mestria escala matematicamente");

  const custoMestria = calcularCustoEstagio(1, 6);
  assert(custoMestria > 90 && custoMestria % 5 === 0, `Custo de Mestria Nível 6 é múltiplo de 5 (${custoMestria} 🪙)`);

  // Aparências Variadas Conforme Evolução
  const aparenciaBib1 = obterInfoAparencia("biblioteca", 1);
  const aparenciaBib5 = obterInfoAparencia("biblioteca", 5);
  assert(aparenciaBib1.rotulo !== aparenciaBib5.rotulo, "Aparência Nível 1 é diferente de Nível 5");
  assert(aparenciaBib1.emoji === "📜", "Nível 1 da Biblioteca tem emoji de pergaminho/fundação");
  assert(aparenciaBib5.emoji === "🏰", "Nível 5 da Biblioteca tem emoji de monumento");

  // Botão de Construir Logo Acima da Construção (Vilas do Saber)
  const custoObraEstagio2 = calcularCustoEstagio(1, 2);
  const custoObraEstagio3 = calcularCustoEstagio(1, 3);
  assert(custoObraEstagio3 > custoObraEstagio2, "Custo para o botão de construir escala progressivamente");
  assert(custoObraEstagio2 % 5 === 0, "Custo de construção é múltiplo amigável de 5");

  // -----------------------------------------------------------------
  // 3. COBERTURA TOTAL DE TODOS OS 25 IDIOMAS
  // -----------------------------------------------------------------
  console.log("\n[3] Cobertura Completa dos 25 Idiomas:");

  assert(SUPPORTED_LANGUAGES.length === 25, "Exatamente 25 idiomas catalogados em SUPPORTED_LANGUAGES");

  const enRaw = fs.readFileSync("./src/locales/en.json", "utf-8");
  const enData = JSON.parse(enRaw);
  const secoesEsperadas = Object.keys(enData);

  assert(secoesEsperadas.includes("auth"), "en.json possui seção auth");
  assert(secoesEsperadas.includes("ajustes"), "en.json possui seção ajustes");
  assert(enData.nav?.cidade === "Knowledge City", "en.json possui nav.cidade");

  const localesDir = "./src/locales";
  const localeFiles = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));

  for (const lang of SUPPORTED_LANGUAGES) {
    const fileName = `${lang.code}.json`;
    const exists = fs.existsSync(path.join(localesDir, fileName));
    assert(exists, `Arquivo ${fileName} existe em src/locales/`);

    if (exists) {
      const content = JSON.parse(fs.readFileSync(path.join(localesDir, fileName), "utf-8"));
      const keysCount = Object.values(content).reduce((acc: number, sec: any) => acc + Object.keys(sec).length, 0);
      assert(keysCount >= 490, `${fileName} possui cobertura completa (${keysCount} chaves)`);
      assert(lang.status === "completo", `Idioma ${lang.code} marcado como completo`);
    }
  }

  // RTL Direction
  const rtlCodes = ["ar", "he", "fa", "ur"];
  for (const code of rtlCodes) {
    const l = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    assert(l?.dir === "rtl", `Idioma ${code} configurado com direção RTL`);
  }

  console.log("\n=======================================================");
  console.log(`TOTAL: ${totalTests} TESTES | APROVADOS: ${passedTests}`);
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});
