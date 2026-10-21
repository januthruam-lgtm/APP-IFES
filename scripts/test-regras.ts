/**
 * Brain Studio - Bateria de Testes Unitários de Regras de Negócio e Fórmulas Puras
 * Valida com precisão matemática os parâmetros de Economia, Cidade, Planos e Cosméticos.
 */

import {
  calcularRecompensaBau,
  calcularBonusNivelEquipe,
  calcularBonusOfensiva,
  aplicarFreioAntiInflacao,
  ECONOMIA_CONFIG,
} from "../src/config/economia.config";
import {
  calcularCustoEstagio,
  calcularCustoTotalCidade,
  arredondarMultiplo5,
  CIDADES,
} from "../src/config/cidade.config";
import { temAcesso, PLANOS } from "../src/config/planos.config";
import { validarPrecoCosmetico, CATALOGO_COSMETICOS } from "../src/config/cosmeticos.config";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSOU: ${message}`);
}

console.log("\n🧪 Testando Parâmetros da Economia (Fase 4):");

// 1. Baú 1 a 15 tabela base
assert(ECONOMIA_CONFIG.BAU.MOEDAS_POR_ORDEM_DIARIA[0] === 10, "1º baú base concede 10 moedas");
assert(ECONOMIA_CONFIG.BAU.MOEDAS_POR_ORDEM_DIARIA[14] === 450, "15º baú base concede 450 moedas");
assert(ECONOMIA_CONFIG.BAU.MAX_POR_USUARIO_POR_DIA === 15, "Máximo de 15 baús diários por usuário");

// 2. Bônus de Equipe
assert(calcularBonusNivelEquipe(0) === 0, "Equipe com 0 XP concede 0% bônus");
assert(calcularBonusNivelEquipe(2000) === 0.05, "Equipe com 2.000 XP concede 5% bônus");
assert(calcularBonusNivelEquipe(10000) === 0.1, "Equipe com 10.000 XP concede 10% bônus");
assert(calcularBonusNivelEquipe(30000) === 0.15, "Equipe com 30.000 XP concede 15% bônus");
assert(calcularBonusNivelEquipe(100000) === 0.2, "Equipe com 100.000 XP concede 20% bônus");

// 3. Bônus de Ofensiva
assert(calcularBonusOfensiva(0) === 0, "0 dias de ofensiva concede 0% bônus");
assert(calcularBonusOfensiva(7) === 0.05, "7 dias de ofensiva concede 5% bônus");
assert(calcularBonusOfensiva(30) === 0.1, "30 dias de ofensiva concede 10% bônus");
assert(calcularBonusOfensiva(100) === 0.15, "100 dias de ofensiva concede 15% bônus");

// 4. Teto de Bônus de 40%
// Se equipe tem 20% (100k XP) e estudante tem 15% (100 dias), total = 35% (< 40%)
const r1 = calcularRecompensaBau(1, 100000, 100, 0);
assert(r1.bonusTotalPercentual === 0.35, "Bônus total 35% aplicado corretamente");
assert(r1.moedasCalculadas === 13, "Baú 1 com 35% sobre 10 = 13 moedas (arredondado para baixo)");

// 5. Freio Anti-inflação (acima de 1.500 moedas/dia)
const freioNormal = aplicarFreioAntiInflacao(500, 200);
assert(freioNormal.moedasEfetivas === 200 && !freioNormal.aplicadoFreio, "Abaixo de 1.500 moedas não aplica freio");

const freioExcedente = aplicarFreioAntiInflacao(1500, 200);
assert(freioExcedente.moedasEfetivas === 100 && freioExcedente.aplicadoFreio, "Acima de 1.500 moedas reduz ganho para 50% (200 -> 100)");

const freioBorda = aplicarFreioAntiInflacao(1400, 200);
// 100 moedas livres + 100 moedas com 50% = 100 + 50 = 150
assert(freioBorda.moedasEfetivas === 150 && freioBorda.aplicadoFreio, "Transição de borda em 1.500 moedas calcula proporcional exato");

console.log("\n🧪 Testando Parâmetros da Cidade (Fase 6):");

// 1. Arredondamento a múltiplos de 5
assert(arredondarMultiplo5(22.5) === 25, "22.5 arredonda para 25");
assert(arredondarMultiplo5(37.5) === 40, "37.5 arredonda para 40");
assert(arredondarMultiplo5(12) === 10, "12 arredonda para 10");

// 2. Cidade 1 (Aldeia do Saber, base 15)
// Estágios: 15*1=15, 15*1.5=22.5->25, 15*2.5=37.5->40, 15*4=60, 15*6=90. Soma = 230
assert(calcularCustoEstagio(1, 1) === 15, "Cidade 1 Estágio 1 = 15 moedas");
assert(calcularCustoEstagio(1, 2) === 25, "Cidade 1 Estágio 2 = 25 moedas");
assert(calcularCustoEstagio(1, 3) === 40, "Cidade 1 Estágio 3 = 40 moedas");
assert(calcularCustoEstagio(1, 4) === 60, "Cidade 1 Estágio 4 = 60 moedas");
assert(calcularCustoEstagio(1, 5) === 90, "Cidade 1 Estágio 5 = 90 moedas");
// Total da Cidade 1 com 4 construções: 4 * 230 = 920
assert(calcularCustoTotalCidade(1) === 920, "Custo total da Cidade 1 = exatamente 920 moedas");

// 3. Cidade 2 (Vila dos Livros, base 30)
// Estágios: 30*1=30, 30*1.5=45, 30*2.5=75, 30*4=120, 30*6=180. Soma = 450
// Total com 4 construções: 4 * 450 = 1800
assert(calcularCustoTotalCidade(2) === 1800, "Custo total da Cidade 2 = exatamente 1.800 moedas");

console.log("\n🧪 Testando Parâmetros de Planos (Fase 5):");
assert(temAcesso(0, 0), "Usuário Gratuito (0) tem acesso ao nível Gratuito (0)");
assert(!temAcesso(0, 1), "Usuário Gratuito (0) NÃO tem acesso ao nível Lite (1)");
assert(!temAcesso(1, 2), "Usuário Lite (1) NÃO tem acesso ao nível Pro (2)");
assert(temAcesso(2, 2), "Usuário Pro (2) tem acesso ao nível Pro (2)");
assert(temAcesso(2, 1), "Usuário Pro (2) tem acesso regressivo ao nível Lite (1)");

console.log("\n🧪 Testando Catálogo de Cosméticos (Fase 12):");
assert(validarPrecoCosmetico("cabeca_bone_foco", 300), "Boné comum custa exatamente 300 moedas");
assert(!validarPrecoCosmetico("cabeca_bone_foco", 100), "Preço alterado rejeita transação");
assert(!validarPrecoCosmetico("skin_dourado", 0), "Item lendário não pode ser comprado por moedas");

console.log("\n🎉 TODOS OS TESTES DE REGRAS E FÓRMULAS PASSARAM COM SUCESSO!\n");
