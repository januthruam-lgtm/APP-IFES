/**
 * Brain Studio - Parâmetros e Regras do Programa de Fidelidade Acadêmica
 * Fuso horário oficial: America/Sao_Paulo (Semana civil: Segunda a Domingo)
 * Zero números mágicos. Fórmulas puras, determinísticas e transparentes.
 */

export const FIDELIDADE_CONFIG = Object.freeze({
  FUSO_HORARIO: "America/Sao_Paulo",

  // 5.1 Categorias e Itens Elegíveis a Cashback e Selos
  GASTO_ELEGIVEL: Object.freeze({
    CATEGORIAS_PERMITIDAS: Object.freeze([
      "loja_pets",
      "cosmeticos",
      "obras_cidade",
      "evolucao_pet",
      "molduras",
      "titulos",
      "melhoria_equipe",
    ]),
    ITENS_EXCLUIDOS: Object.freeze([
      "comida_pet",
      "brinquedo_pet",
      "congelar_ofensiva",
      "bonus_xp",
      "oficina",
      "fragmento_cosmetico",
      "resgate_cofre",
    ]),
  }),

  // 5.2 Níveis de Cliente por Gasto Elegível nos Últimos 30 Dias (Janela Móvel)
  NIVEIS_CLIENTE: Object.freeze([
    { id: "bronze", nome: "Bronze", gastoMinimo30d: 0, porcentagemRetorno: 0.01 },     // 1%
    { id: "prata", nome: "Prata", gastoMinimo30d: 800, porcentagemRetorno: 0.02 },       // 2%
    { id: "ouro", nome: "Ouro", gastoMinimo30d: 2000, porcentagemRetorno: 0.03 },        // 3%
    { id: "safira", nome: "Safira", gastoMinimo30d: 4000, porcentagemRetorno: 0.04 },    // 4%
    { id: "diamante", nome: "Diamante", gastoMinimo30d: 7000, porcentagemRetorno: 0.05 },// 5%
  ]),

  // 5.3 Cofre de Retorno de Moedas
  COFRE: Object.freeze({
    CAPACIDADE_MAXIMA: 500, // Teto máximo do cofre em moedas
    TETO_RESGATE_SEMANAL: 250, // No máximo 250 moedas resgatadas por semana civil
    MAX_RESGATES_SEMANA_CIVIL: 1, // No máximo 1 resgate por semana civil
    REQUER_MISSAO_DIARIA_CONCLUIDA: true, // Concluir pelo menos 1 missão no dia do resgate
  }),

  // 5.4 Selos de Fidelidade e Itens Exclusivos da Loja de Selos
  SELOS: Object.freeze({
    MOEDAS_POR_SELO: 100, // 1 selo a cada 100 moedas de gasto elegível acumulado
    CATALOGO: Object.freeze([
      { id: "titulo_cliente_fiel", nome: "Título 'Cliente Fiel'", tipo: "titulo", selos: 10, icon: "Award" },
      { id: "moldura_folhas_calmas", nome: "Moldura 'Folhas Calmas'", tipo: "moldura", selos: 25, icon: "Sparkles" },
      { id: "laco_estrela_fidelidade", nome: "Laço 'Estrela de Fidelidade'", tipo: "acessorio", selos: 40, icon: "Star" },
      { id: "fundo_biblioteca_dourada", nome: "Fundo 'Biblioteca Dourada'", tipo: "fundo", selos: 80, icon: "BookOpen" },
      { id: "moldura_constelacao", nome: "Moldura 'Constelação'", tipo: "moldura", selos: 100, icon: "Sparkles" },
      { id: "titulo_mestre_colecionador", nome: "Título 'Mestre Colecionador'", tipo: "titulo", selos: 150, icon: "Trophy" },
      { id: "capa_manto_estrelado", nome: "Capa 'Manto Estrelado'", tipo: "capa", selos: 200, icon: "Shield" },
      { id: "pelagem_brilho_prata", nome: "Pelagem 'Brilho de Prata'", tipo: "pelagem", selos: 300, icon: "Flame" },
    ]),
  }),

  // 5.5 Vales-Desconto Semanais
  VALES_DESCONTO: Object.freeze({
    NIVEL_MINIMO: "prata",
    PORCENTAGEM_POR_NIVEL: Object.freeze({
      prata: 0.05,    // 5%
      ouro: 0.05,     // 5%
      safira: 0.1,    // 10%
      diamante: 0.1,  // 10%
    }),
    VALIDADE_DIAS: 14,
    VALOR_MINIMO_COMPRA: 300,
    DESCONTO_MAXIMO_MOEDAS: 150,
    TETO_DESCONTO_COMBINADO: 0.2, // Teto somado (desconto cidade + vale) ≤ 20%
  }),

  // 5.6 Metas Semanais de Gasto
  METAS_SEMANAIS: Object.freeze([
    { id: "meta_500", gastoMinimo: 500, retornoCofre: 20 },
    { id: "meta_1500", gastoMinimo: 1500, retornoCofre: 50 },
    { id: "meta_3000", gastoMinimo: 3000, retornoCofre: 100 },
  ]),

  // 5.7 Semanas Temáticas
  SEMANAS_TEMATICAS: Object.freeze([
    {
      id: "semana_construcao",
      nomeKey: "fidelidade.semana_construcao",
      nomePadrao: "Semana da Construção",
      categoria: "obras_cidade",
      bonusPercentualCofre: 0.05, // +5% de cashback no cofre
      mesRecorrencia: 1, // Trimestral / rotativo
    },
    {
      id: "semana_pet",
      nomeKey: "fidelidade.semana_pet",
      nomePadrao: "Semana do Mascote",
      categoria: "loja_pets",
      bonusPercentualCofre: 0.05,
      mesRecorrencia: 2,
    },
    {
      id: "semana_provas",
      nomeKey: "fidelidade.semana_provas",
      nomePadrao: "Semana de Provas & Foco",
      categoria: "cosmeticos",
      bonusPercentualCofre: 0.05,
      mesRecorrencia: 3,
    },
  ]),
});

/**
 * Determina o nível de cliente com base no gasto elegível dos últimos 30 dias.
 * @param {number} gastoElegivel30d
 */
export function calcularNivelCliente(gastoElegivel30d) {
  const niveis = [...FIDELIDADE_CONFIG.NIVEIS_CLIENTE].reverse();
  for (const n of niveis) {
    if (gastoElegivel30d >= n.gastoMinimo30d) {
      return n;
    }
  }
  return FIDELIDADE_CONFIG.NIVEIS_CLIENTE[0];
}

/**
 * Calcula o cashback a ser adicionado ao cofre (arredondado para baixo).
 * @param {number} valorEfetivamentePago Valor após descontos de cupons e cidade
 * @param {number} porcentagemNivel Taxa do nível (0.01 a 0.05)
 * @param {number} bonusSemanaTematica Bônus extra se aplicável (ex: 0.05)
 * @returns {number} Moedas inteiras para o cofre
 */
export function calcularCashbackCofre(valorEfetivamentePago, porcentagemNivel, bonusSemanaTematica = 0) {
  if (valorEfetivamentePago <= 0) return 0;
  const taxaTotal = porcentagemNivel + bonusSemanaTematica;
  return Math.floor(valorEfetivamentePago * taxaTotal);
}

/**
 * Calcula quantos novos selos e qual o resto acumulador de gasto elegível.
 * @param {number} gastoAcumuladoAnterior
 * @param {number} novoGastoElegivel
 * @returns {{ novosSelos: number; novoGastoAcumulado: number }}
 */
export function calcularNovosSelos(gastoAcumuladoAnterior, novoGastoElegivel) {
  const total = (gastoAcumuladoAnterior || 0) + novoGastoElegivel;
  const divisor = FIDELIDADE_CONFIG.SELOS.MOEDAS_POR_SELO;
  const novosSelos = Math.floor(total / divisor);
  const novoGastoAcumulado = total % divisor;
  return { novosSelos, novoGastoAcumulado };
}

/**
 * Aplica o vale-desconto semanal respeitando o teto de 20% combinado e o limite de 150 moedas.
 * @param {number} precoOriginal
 * @param {number} descontoCidadePercentual
 * @param {number} taxaVale
 */
export function calcularDescontoCombinado(precoOriginal, descontoCidadePercentual = 0, taxaVale = 0) {
  if (precoOriginal < FIDELIDADE_CONFIG.VALES_DESCONTO.VALOR_MINIMO_COMPRA || taxaVale <= 0) {
    const descontoCidade = Math.floor(precoOriginal * descontoCidadePercentual);
    return {
      descontoCidade,
      descontoVale: 0,
      valorFinal: Math.max(0, precoOriginal - descontoCidade),
      tetoAtingido: false,
    };
  }

  const taxaCombinadaBruta = descontoCidadePercentual + taxaVale;
  const teto = FIDELIDADE_CONFIG.VALES_DESCONTO.TETO_DESCONTO_COMBINADO; // 20%
  const taxaEfetiva = Math.min(taxaCombinadaBruta, teto);

  // Calcula desconto cidade primeiro
  const descontoCidade = Math.floor(precoOriginal * descontoCidadePercentual);
  const restanteAposCidade = Math.max(0, precoOriginal - descontoCidade);

  // Desconto do vale sobre o restante, limitado ao teto combinado e ao teto de 150 moedas
  const taxaValeEfetiva = Math.max(0, taxaEfetiva - descontoCidadePercentual);
  let descontoVale = Math.floor(precoOriginal * taxaValeEfetiva);
  if (descontoVale > FIDELIDADE_CONFIG.VALES_DESCONTO.DESCONTO_MAXIMO_MOEDAS) {
    descontoVale = FIDELIDADE_CONFIG.VALES_DESCONTO.DESCONTO_MAXIMO_MOEDAS;
  }

  const valorFinal = Math.max(0, precoOriginal - descontoCidade - descontoVale);
  return {
    descontoCidade,
    descontoVale,
    valorFinal,
    tetoAtingido: taxaCombinadaBruta > teto,
  };
}
