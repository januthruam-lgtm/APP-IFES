/**
 * Brain Studio - Parâmetros Centrais da Economia Acadêmica (Fase 4)
 * Fuso horário oficial de fechamento: America/Sao_Paulo
 * Zero números mágicos espalhados pelo código do aplicativo.
 */

export const ECONOMIA_CONFIG = Object.freeze({
  FUSO_HORARIO: "America/Sao_Paulo",

  // 1. Parâmetros do Baú da Equipe (Fase 4A)
  BAU: {
    XP_POR_BAU: 50,
    MAX_POR_USUARIO_POR_DIA: 15,
    XP_DESCONTA_DO_USUARIO: false,

    // Tabela de moedas do n-ésimo baú aberto pelo usuário no dia (índices 0 a 14 correspondendo aos baús 1 a 15)
    MOEDAS_POR_ORDEM_DIARIA: Object.freeze([
      10, 20, 30, 45, 60, 80, 105, 135, 170, 210, 255, 305, 360, 400, 450,
    ]),

    // Bônus fixos e garantidos por marco no dia (ECA Digital: sem sorteio aleatório)
    BONUS_FIXOS_MARCOS: Object.freeze({
      3: { moedasBonus: 15, tipo: "comida_pet", quantidade: 1 },
      6: { moedasBonus: 30, tipo: "comida_pet", quantidade: 2 },
      10: { moedasBonus: 60, tipo: "congelar_ofensiva", quantidade: 1 },
      15: { moedasBonus: 120, tipo: "fragmento_cosmetico", quantidade: 1 },
    }),

    // Bônus percentual por nível de XP total da equipe
    NIVEIS_EQUIPE: Object.freeze([
      { xpMinimo: 0, bonusMoedasPercentual: 0 },
      { xpMinimo: 2000, bonusMoedasPercentual: 0.05 },
      { xpMinimo: 10000, bonusMoedasPercentual: 0.1 },
      { xpMinimo: 30000, bonusMoedasPercentual: 0.15 },
      { xpMinimo: 100000, bonusMoedasPercentual: 0.2 },
    ]),

    // Bônus percentual por dias de ofensiva do estudante
    BONUS_OFENSIVA: Object.freeze([
      { diasMinimos: 100, bonusPercentual: 0.15 },
      { diasMinimos: 30, bonusPercentual: 0.1 },
      { diasMinimos: 7, bonusPercentual: 0.05 },
      { diasMinimos: 0, bonusPercentual: 0.0 },
    ]),

    // Teto absoluto de bônus combinado no baú
    TETO_BONUS_TOTAL_PERCENTUAL: 0.4, // 40%
  },

  // 2. Sistema Anti-Inflação
  ANTI_INFLACAO: {
    LIMITE_MOEDAS_DIA_INTEGRAL: 1500,
    MULTIPLICADOR_APOS_LIMITE: 0.5, // 50%
  },

  // 3. Tetos Diários de XP Contabilizado por Atividade de Estudo (Tarefas desativadas)
  XP_MAXIMO_DIARIO_POR_ATIVIDADE: Object.freeze({
    flashcards: 150,
    quiz: 300,
    aula: 300,
    leitura: 100,
    sala_estudo: 150,
  }),

  // 3b. Desativação Estrita de Recompensas por Tarefas (Prevenção de Farm e Loop)
  TAREFAS: Object.freeze({
    recompensa: false,
    moedas: 0,
    xp: 0,
  }),

  // 4. Missões Diárias (Fase 4B)
  MISSOES_DIARIAS: Object.freeze([
    { id: "missao_50_xp", meta: 50, moedas: 20, descricao: "Ganhar 50 XP em estudos" },
    { id: "missao_1_quiz", meta: 1, moedas: 30, descricao: "Concluir 1 quiz avaliativo" },
    { id: "missao_10_flashcards", meta: 10, moedas: 20, descricao: "Revisar 10 flashcards" },
  ]),
  BONUS_TODAS_MISSOES_CONCLUIDAS: 50, // Concluir 3/3 concede +50 moedas

  // 5. Ofensiva e Congelamento (Streak)
  OFENSIVA: {
    CUSTO_CONGELAMENTO_MOEDAS: 300,
    MAX_CONGELAMENTOS_ESTOQUE: 2,
    RECOMPENSAS_MARCOS: Object.freeze({
      7: 50,
      30: 200,
      100: 600,
    }),
  },

  // 6. Ligas Semanais por XP (Fase 4C)
  LIGAS: Object.freeze({
    DIVISOES: Object.freeze(["Bronze", "Prata", "Ouro", "Safira", "Rubi", "Diamante"]),
    TAMANHO_GRUPO: 30,
    SOBEM_QUANTIDADE: 10,
    DESCEM_QUANTIDADE: 5,
    PREMIOS_MOEDAS: Object.freeze({
      1: 200,
      2: 150,
      3: 100,
      posicoes4a10: 50,
    }),
  }),

  // 7. Tabela Oficial de Preços da Loja e Sumidouros (Fase 4D)
  PRECOS: Object.freeze({
    comida_pet: 40,
    brinquedo_pet: 80,
    evolucao_pet: Object.freeze([300, 800, 1800]),
    bonus_xp_15min: { preco: 150, multiplicador: 1.5, maxPorDia: 2 },
    moldura_avatar: { min: 400, max: 1200 },
    titulo_perfil: { min: 300, max: 900 },
    melhoria_equipe: Object.freeze([1000, 3000, 8000]),
  }),
});

/**
 * Calcula o bônus de nível de equipe baseado no XP total da equipe.
 */
export function calcularBonusNivelEquipe(xpTotalEquipe: number): number {
  const niveis = [...ECONOMIA_CONFIG.BAU.NIVEIS_EQUIPE].reverse();
  for (const n of niveis) {
    if (xpTotalEquipe >= n.xpMinimo) {
      return n.bonusMoedasPercentual;
    }
  }
  return 0;
}

/**
 * Calcula o bônus percentual de ofensiva (streak) do usuário.
 */
export function calcularBonusOfensiva(diasOfensiva: number): number {
  for (const fa of ECONOMIA_CONFIG.BAU.BONUS_OFENSIVA) {
    if (diasOfensiva >= fa.diasMinimos) {
      return fa.bonusPercentual;
    }
  }
  return 0;
}

/**
 * Aplica a regra anti-inflação de moedas ganhas no mesmo dia.
 * Acima de 1.500 moedas acumuladas no dia, novos ganhos sofrem redução de 50%.
 */
export function aplicarFreioAntiInflacao(
  moedasGanhasHoje: number,
  novasMoedas: number
): { moedasEfetivas: number; aplicadoFreio: boolean } {
  const teto = ECONOMIA_CONFIG.ANTI_INFLACAO.LIMITE_MOEDAS_DIA_INTEGRAL;
  const redutor = ECONOMIA_CONFIG.ANTI_INFLACAO.MULTIPLICADOR_APOS_LIMITE;

  if (moedasGanhasHoje >= teto) {
    return {
      moedasEfetivas: Math.floor(novasMoedas * redutor),
      aplicadoFreio: true,
    };
  }

  const espacoLivre = teto - moedasGanhasHoje;
  if (novasMoedas <= espacoLivre) {
    return { moedasEfetivas: novasMoedas, aplicadoFreio: false };
  }

  const excedente = novasMoedas - espacoLivre;
  const total = espacoLivre + Math.floor(excedente * redutor);
  return { moedasEfetivas: total, aplicadoFreio: true };
}

export interface RecompensaBauResultado {
  bauNumero: number;
  moedasBase: number;
  moedasBonusMarco: number;
  bonusPercentualEquipe: number;
  bonusPercentualOfensiva: number;
  bonusTotalPercentual: number;
  moedasCalculadas: number;
  moedasFinaisAposFreio: number;
  itemFixo?: { tipo: string; quantidade: number; moedasBonus?: number };
  aplicadoFreioAntiInflacao: boolean;
}

/**
 * Calcula com precisão a recompensa de abertura do n-ésimo baú diário do usuário.
 * Função pura, sem efeitos colaterais e testável.
 *
 * @param ordemNoDia 1 a 15 (qual baú o usuário está abrindo hoje)
 * @param xpTotalEquipe XP acumulado da equipe
 * @param diasOfensiva Dias consecutivos de ofensiva do estudante
 * @param moedasJaGanhasHoje Total de moedas que o usuário já acumulou hoje
 */
export function calcularRecompensaBau(
  ordemNoDia: number,
  xpTotalEquipe = 0,
  diasOfensiva = 0,
  moedasJaGanhasHoje = 0
): RecompensaBauResultado {
  const clampOrdem = Math.min(
    ECONOMIA_CONFIG.BAU.MAX_POR_USUARIO_POR_DIA,
    Math.max(1, Math.floor(ordemNoDia))
  );

  const moedasBase =
    ECONOMIA_CONFIG.BAU.MOEDAS_POR_ORDEM_DIARIA[clampOrdem - 1] ?? 10;

  const bonusEquipe = calcularBonusNivelEquipe(xpTotalEquipe);
  const bonusOfensiva = calcularBonusOfensiva(diasOfensiva);

  // O bônus total combinado não pode ultrapassar o teto de 40%
  const bonusTotalPercentual = Math.min(
    ECONOMIA_CONFIG.BAU.TETO_BONUS_TOTAL_PERCENTUAL,
    bonusEquipe + bonusOfensiva
  );

  const marcoInfo = (ECONOMIA_CONFIG.BAU.BONUS_FIXOS_MARCOS as any)[clampOrdem];
  const moedasBonusMarco = marcoInfo?.moedasBonus || 0;

  const moedasComBonus =
    Math.floor(moedasBase * (1 + bonusTotalPercentual)) + moedasBonusMarco;

  const { moedasEfetivas, aplicadoFreio } = aplicarFreioAntiInflacao(
    moedasJaGanhasHoje,
    moedasComBonus
  );

  return {
    bauNumero: clampOrdem,
    moedasBase,
    moedasBonusMarco,
    bonusPercentualEquipe: bonusEquipe,
    bonusPercentualOfensiva: bonusOfensiva,
    bonusTotalPercentual,
    moedasCalculadas: moedasComBonus,
    moedasFinaisAposFreio: moedasEfetivas,
    itemFixo: marcoInfo,
    aplicadoFreioAntiInflacao: aplicadoFreio,
  };
}

export default ECONOMIA_CONFIG;
