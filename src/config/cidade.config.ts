/**
 * Brain Studio - Parâmetros Centrais da Cidade do Conhecimento (Fase 6)
 * Progressão acadêmica cooperativa: sem sorteio, sem ataque e sem roubo.
 * Fórmulas em funções puras com cálculos exatos.
 */

export interface EstagioConstrucao {
  nivel: number;
  nome: string;
  peso: number;
}

export const ESTAGIOS_CIDADE: readonly EstagioConstrucao[] = Object.freeze([
  { nivel: 1, nome: "Terreno", peso: 1 },
  { nivel: 2, nome: "Acampamento", peso: 1.5 },
  { nivel: 3, nome: "Casa", peso: 2.5 },
  { nivel: 4, nome: "Edifício", peso: 4 },
  { nivel: 5, nome: "Monumento", peso: 6 },
]);

export interface CidadeDefinicao {
  id: number;
  nome: string;
  baseCusto: number;
  totalConstrucoes: number;
  chavesConstrucoes: readonly string[];
  desbloqueioDescricao: string;
}

export const CIDADES: readonly CidadeDefinicao[] = Object.freeze([
  {
    id: 1,
    nome: "Aldeia do Saber",
    baseCusto: 15,
    totalConstrucoes: 4,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio"]),
    desbloqueioDescricao: "Menu Cidade e loja básica dos mascotes",
  },
  {
    id: 2,
    nome: "Vila dos Livros",
    baseCusto: 30,
    totalConstrucoes: 4,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio"]),
    desbloqueioDescricao: "Equipes colaborativas e baú comunitário",
  },
  {
    id: 3,
    nome: "Cidade das Ciências",
    baseCusto: 55,
    totalConstrucoes: 5,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio"]),
    desbloqueioDescricao: "Ligas acadêmicas semanais",
  },
  {
    id: 4,
    nome: "Cidade das Letras",
    baseCusto: 90,
    totalConstrucoes: 5,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio"]),
    desbloqueioDescricao: "Estante personalizada na Biblioteca Virtual",
  },
  {
    id: 5,
    nome: "Cidade das Artes",
    baseCusto: 140,
    totalConstrucoes: 5,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio"]),
    desbloqueioDescricao: "Cenários de fundo da Sala de Estudo Virtual",
  },
  {
    id: 6,
    nome: "Cidade dos Inventores",
    baseCusto: 210,
    totalConstrucoes: 6,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio", "praca"]),
    desbloqueioDescricao: "Relatório de desempenho e metas avançadas",
  },
  {
    id: 7,
    nome: "Cidade do Foco",
    baseCusto: 300,
    totalConstrucoes: 6,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio", "praca"]),
    desbloqueioDescricao: "Modo Foco aprofundado com telemetria local",
  },
  {
    id: 8,
    nome: "Cidade dos Campeões",
    baseCusto: 420,
    totalConstrucoes: 6,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio", "praca"]),
    desbloqueioDescricao: "Batalhas de conhecimento ranqueadas",
  },
  {
    id: 9,
    nome: "Cidade da Sabedoria",
    baseCusto: 580,
    totalConstrucoes: 6,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio", "praca"]),
    desbloqueioDescricao: "Estilos pedagógicos extras da Lumina IA",
  },
  {
    id: 10,
    nome: "Metrópole Acadêmica",
    baseCusto: 800,
    totalConstrucoes: 6,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio", "praca"]),
    desbloqueioDescricao: "Moldura lendária, título 'Mestre da Cidade' e casa do pet",
  },
]);

export const TETOS_BONUS_CIDADE = Object.freeze({
  XP_TOTAL: 0.15, // 15%
  DESCONTO_LOJA: 0.1, // 10%
  MOEDAS_BAU: 0.05, // 5%
});

/**
 * Arredonda um valor para o múltiplo de 5 mais próximo.
 */
export function arredondarMultiplo5(valor: number): number {
  return Math.round(valor / 5) * 5;
}

/**
 * Retorna a definição da cidade para QUALQUER nível/ID (1 a infinito).
 * - Cidades 1 a 10: configurações pré-definidas curadas.
 * - Cidades > 10: geradas proceduralmente com balanceamento matemático contínuo.
 */
export function obterCidadeDefinicao(cidadeId: number): CidadeDefinicao {
  const idValido = Math.max(1, Math.floor(cidadeId || 1));
  const predefinida = CIDADES.find((c) => c.id === idValido);
  if (predefinida) return predefinida;

  const temasInfinitos = [
    "Reino Quântico",
    "Aurora dos Polímatas",
    "Cidadela das Estrelas",
    "Vale dos Filósofos Cósmicos",
    "Santuário das Galáxias",
    "Fortaleza do Infinito",
    "Metrópole Solar",
    "Baluarte dos Mestres",
    "Império do Conhecimento",
    "Horizonte da Sabedoria",
    "Ágora dos Pensadores Universais",
    "Cúpula das Dimensões",
    "Panteão dos Estudiosos",
    "Colosso da Investigação",
    "Jardins do Infinito",
  ];

  const indice = (idValido - 11) % temasInfinitos.length;
  const ciclo = Math.floor((idValido - 11) / temasInfinitos.length) + 1;
  const sufixo = ciclo > 1 ? ` • Ciclo ${ciclo}` : "";
  const nome = `${temasInfinitos[indice]}${sufixo}`;

  // Custo base escalável continuamente com amortecimento suave
  const fatorNivel = Math.pow(1.12, idValido - 10);
  const baseCusto = arredondarMultiplo5(Math.round(800 * fatorNivel));

  return {
    id: idValido,
    nome,
    baseCusto,
    totalConstrucoes: 6,
    chavesConstrucoes: Object.freeze(["biblioteca", "laboratorio", "observatorio", "dormitorio", "auditorio", "praca"]),
    desbloqueioDescricao: `Vila Lendária Nível ${idValido} • Bônus contínuo de XP e medalha de mestre`,
  };
}

/**
 * Retorna a definição do estágio para qualquer nível (1 a infinito).
 */
export function obterEstagio(nivel: number): EstagioConstrucao {
  const niv = Math.max(1, Math.floor(nivel || 1));
  const base = ESTAGIOS_CIDADE.find((e) => e.nivel === niv);
  if (base) return base;

  // Níveis > 5 são Estágios de Mestria / Prestígio Lendário
  const grauMestria = niv - 5;
  const algarismoRomano = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][Math.min(9, grauMestria - 1)] || `${grauMestria}`;
  return {
    nivel: niv,
    nome: `Monumento Celestial • Mestria ${algarismoRomano}`,
    peso: 6 + (grauMestria * 2.5),
  };
}

/**
 * Calcula o custo em moedas para construir determinado estágio em uma cidade.
 * Fórmula: baseCusto da cidade × peso do estágio, arredondado a múltiplos de 5.
 *
 * @param cidadeId ID da cidade (1 a infinito)
 * @param estagioNivel Nível do estágio (1 a infinito)
 */
export function calcularCustoEstagio(cidadeId: number, estagioNivel: number): number {
  const cidade = obterCidadeDefinicao(cidadeId);
  const estagio = obterEstagio(estagioNivel);

  const bruto = cidade.baseCusto * estagio.peso;
  return arredondarMultiplo5(bruto);
}

/**
 * Calcula o custo total para completar todas as construções nos 5 estágios de uma cidade.
 */
export function calcularCustoTotalCidade(cidadeId: number): number {
  const cidade = obterCidadeDefinicao(cidadeId);

  let somaEstagios = 0;
  for (const est of ESTAGIOS_CIDADE) {
    somaEstagios += calcularCustoEstagio(cidade.id, est.nivel);
  }

  return somaEstagios * cidade.totalConstrucoes;
}

export default CIDADES;
