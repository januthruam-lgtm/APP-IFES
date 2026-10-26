import { FIDELIDADE_CONFIG } from "../src/config/fidelidade.config";
import { ECONOMIA_CONFIG } from "../src/config/economia.config";
import {
  calcularNivelFidelidade,
  calcularDescontoEfetivo,
  obterChaveSemanaSaoPaulo,
  isCategoriaElegivel,
} from "../src/features/economia/services/fidelidadeService";

function assert(condicao: boolean, mensagem: string) {
  if (!condicao) {
    console.error(`❌ FALHA: ${mensagem}`);
    process.exit(1);
  }
  console.log(`✅ SUCESSO: ${mensagem}`);
}

console.log("=== INICIANDO BATERIA DE TESTES: REORGANIZAÇÃO E FIDELIDADE ===");

// 1. Testes de Níveis por Janela Móvel (30 Dias)
console.log("\n--- 1. Cálculo de Níveis de Fidelidade ---");
const n0 = calcularNivelFidelidade(0);
assert(n0.id === "bronze" && n0.porcentagemRetorno === 0.01, "0 moedas -> Nível Bronze (1%)");

const n799 = calcularNivelFidelidade(799);
assert(n799.id === "bronze", "799 moedas -> Nível Bronze");

const n800 = calcularNivelFidelidade(800);
assert(n800.id === "prata" && n800.porcentagemRetorno === 0.02, "800 moedas -> Nível Prata (2%)");

const n2000 = calcularNivelFidelidade(2000);
assert(n2000.id === "ouro" && n2000.porcentagemRetorno === 0.03, "2.000 moedas -> Nível Ouro (3%)");

const n4000 = calcularNivelFidelidade(4000);
assert(n4000.id === "safira" && n4000.porcentagemRetorno === 0.04, "4.000 moedas -> Nível Safira (4%)");

const n7000 = calcularNivelFidelidade(7000);
assert(n7000.id === "diamante" && n7000.porcentagemRetorno === 0.05, "7.000 moedas -> Nível Diamante (5%)");

// 2. Testes de Elegibilidade de Categorias
console.log("\n--- 2. Categorias Elegíveis e Excluídas ---");
assert(isCategoriaElegivel("obras_cidade") === true, "obras_cidade é categoria elegível para cashback");
assert(isCategoriaElegivel("loja_pets") === true, "loja_pets é categoria elegível para cashback");
assert(isCategoriaElegivel("cosmeticos") === true, "cosmeticos é categoria elegível para cashback");
assert(isCategoriaElegivel("comida_pet") === false, "comida_pet é item excluído de cashback");
assert(isCategoriaElegivel("congelar_ofensiva") === false, "congelar_ofensiva é item excluído de cashback");
assert(isCategoriaElegivel("tarefa") === false, "tarefa não é elegível para retorno financeiro");

// 3. Teste de Desconto com Teto Combinado de 20% e 150 Moedas
console.log("\n--- 3. Descontos e Tetos Determinísticos ---");
const desc1 = calcularDescontoEfetivo(500, "ouro", true, 0.1);
// Ouro tem 5% de vale. 10% da vila + 5% do vale = 15%. 15% de 500 = 75 moedas.
assert(desc1.descontoMoedas === 75, "Compra de 500 com 15% desconto total = 75 moedas");
assert(desc1.valorFinal === 425, "Valor final = 425 moedas");

const descExcedente = calcularDescontoEfetivo(2000, "diamante", true, 0.15);
// Diamante tem 10% de vale. 15% da vila + 10% = 25% bruto -> Trava no teto de 20%.
// 20% de 2000 = 400 moedas -> Trava no teto de 150 moedas.
assert(descExcedente.descontoMoedas === 150, "Desconto bruto limitado ao teto máximo de 150 moedas");
assert(descExcedente.valorFinal === 1850, "Valor final respeita teto de 150 moedas de desconto");

// 4. Teste de Chave da Semana Civil (America/Sao_Paulo)
console.log("\n--- 4. Chave Semanal Civil ISO ---");
const chaveSemana = obterChaveSemanaSaoPaulo();
assert(/^20\d{2}-W\d{2}$/.test(chaveSemana), `Chave de semana civil válida: ${chaveSemana}`);

// 5. Teste de Recompensas das Tarefas (Zero Farming)
console.log("\n--- 5. Política Anti-Farming de Tarefas ---");
assert(
  ECONOMIA_CONFIG.TAREFAS.recompensa === false,
  "Recompensa de tarefas estritamente DESATIVADA em economia.config.ts"
);
assert(
  !(ECONOMIA_CONFIG.XP_MAXIMO_DIARIO_POR_ATIVIDADE as any).tarefas,
  "Tarefas removidas dos limites diários de XP por não gerarem recompensa"
);

// 6. Teste de Parâmetros do Cofre e Selos
console.log("\n--- 6. Parâmetros de Segurança do Cofre ---");
assert(FIDELIDADE_CONFIG.COFRE.CAPACIDADE_MAXIMA === 500, "Cofre limitado a 500 moedas");
assert(FIDELIDADE_CONFIG.COFRE.TETO_RESGATE_SEMANAL === 250, "Resgate semanal limitado a 250 moedas");
assert(FIDELIDADE_CONFIG.COFRE.MAX_RESGATES_SEMANA_CIVIL === 1, "No máximo 1 resgate por semana civil");
assert(FIDELIDADE_CONFIG.COFRE.REQUER_MISSAO_DIARIA_CONCLUIDA === true, "Exige 1 missão diária para resgate");

console.log("\n🎉 TODOS OS TESTES DE REORGANIZAÇÃO E FIDELIDADE PASSARAM COM SUCESSO!");
