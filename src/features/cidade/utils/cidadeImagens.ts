/**
 * Brain Studio - Mapeamento Oficial das Ilustrações das 10 Cidades do Conhecimento
 * Imagens temáticas de alta fidelidade no estilo artístico casual game e vilas ilustradas.
 */

const cidade1 = new URL("../../../assets/images/cidades/cidade_1.jpg", import.meta.url).href;
const cidade2 = new URL("../../../assets/images/cidades/cidade_2.jpg", import.meta.url).href;
const cidade3 = new URL("../../../assets/images/cidades/cidade_3.jpg", import.meta.url).href;
const cidade4 = new URL("../../../assets/images/cidades/cidade_4.jpg", import.meta.url).href;
const cidade5 = new URL("../../../assets/images/cidades/cidade_5.jpg", import.meta.url).href;
const cidade6 = new URL("../../../assets/images/cidades/cidade_6.jpg", import.meta.url).href;
const cidade7 = new URL("../../../assets/images/cidades/cidade_7.jpg", import.meta.url).href;
const cidade8 = new URL("../../../assets/images/cidades/cidade_8.jpg", import.meta.url).href;
const cidade9 = new URL("../../../assets/images/cidades/cidade_9.jpg", import.meta.url).href;
const cidade10 = new URL("../../../assets/images/cidades/cidade_10.jpg", import.meta.url).href;

export const IMAGENS_CIDADES: Record<number, string> = {
  1: cidade1,
  2: cidade2,
  3: cidade3,
  4: cidade4,
  5: cidade5,
  6: cidade6,
  7: cidade7,
  8: cidade8,
  9: cidade9,
  10: cidade10,
};

export function obterImagemCidade(cidadeId: number): string {
  const idValido = Math.max(1, Math.floor(cidadeId || 1));
  const moduloId = ((idValido - 1) % 10) + 1;
  return IMAGENS_CIDADES[moduloId] || cidade1;
}

export function obterFiltroAtmosfericoCidade(cidadeId: number): string {
  const idValido = Math.max(1, Math.floor(cidadeId || 1));
  const ciclo = Math.floor((idValido - 1) / 10);
  switch (ciclo % 4) {
    case 1: // Ciclo Cósmico / Aurora
      return "hue-rotate-30 saturate-125 contrast-105";
    case 2: // Ciclo Crepúsculo Dourado
      return "sepia-30 hue-rotate-[-20deg] saturate-130";
    case 3: // Ciclo Solar Místico
      return "brightness-105 saturate-140 contrast-110";
    default:
      return "";
  }
}
