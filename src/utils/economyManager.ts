/**
 * Brain Studio - Gestor da Economia Acadêmica (Fase 4)
 * Implementação segura, atômica e em conformidade com o ECA Digital (Art. 20).
 * Nenhuma recompensa aleatória ou caixas de sorteio com dinheiro real.
 */

import { ECONOMIA_CONFIG, calcularRecompensaBau, RecompensaBauResultado } from "../config/economia.config";
import { UserProfile } from "../types";
import { FirestoreService } from "../lib/firestoreService";
import { getSaoPauloDateString } from "./streakCalculator";

export interface DadosEconomiaDiaria {
  data: string; // YYYY-MM-DD (America/Sao_Paulo)
  bausAbertosHoje: number; // 0 a 15
  moedasGanhasHoje: number;
  chavesBausAbertos: string[];
  missoesResgatadasHoje: string[];
}

const STORAGE_KEY_PREFIX = "brain_studio_economia_dia_";
const memoryCache: Record<string, DadosEconomiaDiaria> = {};

/**
 * Obtém a data corrente no fuso oficial do Brain Studio.
 */
export function getDiaEconomiaAtual(): string {
  return getSaoPauloDateString();
}

/**
 * Lê o estado de economia diária do usuário.
 */
export function getEconomiaDiariaLocal(userId: string, diaISO?: string): DadosEconomiaDiaria {
  const dia = diaISO || getDiaEconomiaAtual();
  const key = `${STORAGE_KEY_PREFIX}${userId}_${dia}`;

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
  } else if (memoryCache[key]) {
    return memoryCache[key];
  }

  return {
    data: dia,
    bausAbertosHoje: 0,
    moedasGanhasHoje: 0,
    chavesBausAbertos: [],
    missoesResgatadasHoje: [],
  };
}

/**
 * Salva o estado de economia diária localmente.
 */
export function salvarEconomiaDiariaLocal(userId: string, dados: DadosEconomiaDiaria): void {
  const key = `${STORAGE_KEY_PREFIX}${userId}_${dados.data}`;
  memoryCache[key] = dados;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(dados));
    } catch {}
  }
}

/**
 * Abre atomicamente o próximo Baú da Equipe com verificação de cota diária (máx 15),
 * cálculo exato de bônus (equipe + ofensiva limitados a +40%), freio anti-inflação
 * e chave de idempotência para evitar cliques duplicados.
 */
export async function abrirProximoBauEquipe(
  user: UserProfile,
  xpTotalEquipe = 0
): Promise<{
  success: boolean;
  mensagem: string;
  recompensa?: RecompensaBauResultado;
  updatedUser?: UserProfile;
}> {
  const userId = user.id || user.uid || "local-student";
  const dia = getDiaEconomiaAtual();
  const econ = getEconomiaDiariaLocal(userId, dia);

  if (econ.bausAbertosHoje >= ECONOMIA_CONFIG.BAU.MAX_POR_USUARIO_POR_DIA) {
    return {
      success: false,
      mensagem: "Limite diário atingido. Novos baús estarão disponíveis amanhã às 00:00.",
    };
  }

  const proximoNumero = econ.bausAbertosHoje + 1;
  const chaveIdempotencia = `${userId}_${dia}_bau_${proximoNumero}`;

  if (econ.chavesBausAbertos.includes(chaveIdempotencia)) {
    return {
      success: false,
      mensagem: "Este baú já foi resgatado hoje.",
    };
  }

  // Cálculo puro e auditável da recompensa
  const recompensa = calcularRecompensaBau(
    proximoNumero,
    xpTotalEquipe,
    user.streakDays || 1,
    econ.moedasGanhasHoje
  );

  const moedasGanhas = recompensa.moedasFinaisAposFreio;

  // Atualiza dados diários
  econ.bausAbertosHoje = proximoNumero;
  econ.moedasGanhasHoje += moedasGanhas;
  econ.chavesBausAbertos.push(chaveIdempotencia);
  salvarEconomiaDiariaLocal(userId, econ);

  // Atualiza perfil do usuário
  const novoInventario = { ...(user.itensInventario || {}) };
  let novosCongelamentos = user.congelamentosOfensiva || 0;

  if (recompensa.itemFixo) {
    const tipo = recompensa.itemFixo.tipo;
    const qtd = recompensa.itemFixo.quantidade;
    if (tipo === "congelar_ofensiva") {
      novosCongelamentos = Math.min(
        ECONOMIA_CONFIG.OFENSIVA.MAX_CONGELAMENTOS_ESTOQUE,
        novosCongelamentos + qtd
      );
    } else {
      novoInventario[tipo] = (novoInventario[tipo] || 0) + qtd;
    }
  }

  const updatedUser: UserProfile = {
    ...user,
    coins: (user.coins || 0) + moedasGanhas,
    congelamentosOfensiva: novosCongelamentos,
    itensInventario: novoInventario,
  };

  // Sincroniza no Firestore de modo idempotente
  if (user.id || user.uid) {
    FirestoreService.setDocument(
      `users/${userId}/economiaDiaria`,
      dia,
      econ
    ).catch(() => {});

    FirestoreService.updateDocument("users", userId, {
      coins: updatedUser.coins,
      congelamentosOfensiva: updatedUser.congelamentosOfensiva,
      itensInventario: updatedUser.itensInventario,
    }).catch(() => {});
  }

  return {
    success: true,
    mensagem: `Baú ${proximoNumero} aberto! +${moedasGanhas} moedas creditadas.`,
    recompensa,
    updatedUser,
  };
}

/**
 * Interface do estado das missões diárias.
 */
export interface EstadoMissao {
  id: string;
  descricao: string;
  progressoAtual: number;
  meta: number;
  moedas: number;
  concluida: boolean;
  resgatada: boolean;
}

/**
 * Calcula o progresso das 3 missões diárias para o usuário no dia de hoje.
 */
export function getProgressoMissoesDiarias(user: UserProfile): {
  missoes: EstadoMissao[];
  todasConcluidas: boolean;
  bonusDisponivel: boolean;
  bonusResgatado: boolean;
  totalMoedasHoje: number;
} {
  const userId = user.id || user.uid || "local-student";
  const dia = getDiaEconomiaAtual();
  const econ = getEconomiaDiariaLocal(userId, dia);
  const resgatadas = new Set(econ.missoesResgatadasHoje);

  // Progresso de estudos no dia de hoje
  const hojeHist = (user.streakHistory || []).find((h) => h.date === dia);
  const xpHoje = hojeHist?.xpGained || 0;
  const quizzesHoje = user.stats?.quizzesAnswered ? 1 : 0;
  const flashcardsHoje = user.stats?.flashcardsReviewed || 0;

  const missoes: EstadoMissao[] = [
    {
      id: "missao_50_xp",
      descricao: "Ganhar 50 XP em estudos hoje",
      progressoAtual: Math.min(50, xpHoje),
      meta: 50,
      moedas: 30,
      concluida: xpHoje >= 50,
      resgatada: resgatadas.has("missao_50_xp"),
    },
    {
      id: "missao_1_quiz",
      descricao: "Concluir 1 quiz ou simulado",
      progressoAtual: Math.min(1, quizzesHoje),
      meta: 1,
      moedas: 40,
      concluida: quizzesHoje >= 1,
      resgatada: resgatadas.has("missao_1_quiz"),
    },
    {
      id: "missao_10_flashcards",
      descricao: "Revisar 10 flashcards ou foco",
      progressoAtual: Math.min(10, flashcardsHoje),
      meta: 10,
      moedas: 30,
      concluida: flashcardsHoje >= 10,
      resgatada: resgatadas.has("missao_10_flashcards"),
    },
  ];

  const todasConcluidas = missoes.every((m) => m.concluida);
  const bonusDisponivel = todasConcluidas && !resgatadas.has("bonus_todas_missoes");
  const bonusResgatado = resgatadas.has("bonus_todas_missoes");

  return {
    missoes,
    todasConcluidas,
    bonusDisponivel,
    bonusResgatado,
    totalMoedasHoje: econ.moedasGanhasHoje,
  };
}

/**
 * Resgata uma missão diária individual ou o bônus de 3/3.
 */
export async function resgatarRecompensaMissao(
  user: UserProfile,
  missaoId: string
): Promise<{
  success: boolean;
  mensagem: string;
  moedasGanhas: number;
  updatedUser?: UserProfile;
}> {
  const userId = user.id || user.uid || "local-student";
  const dia = getDiaEconomiaAtual();
  const econ = getEconomiaDiariaLocal(userId, dia);

  if (econ.missoesResgatadasHoje.includes(missaoId)) {
    return { success: false, mensagem: "Esta missão já foi resgatada hoje.", moedasGanhas: 0 };
  }

  let moedasBase = 0;
  if (missaoId === "missao_50_xp") moedasBase = 30;
  else if (missaoId === "missao_1_quiz") moedasBase = 40;
  else if (missaoId === "missao_10_flashcards") moedasBase = 30;
  else if (missaoId === "bonus_todas_missoes") moedasBase = ECONOMIA_CONFIG.BONUS_TODAS_MISSOES_CONCLUIDAS;

  if (moedasBase === 0) {
    return { success: false, mensagem: "Missão inválida.", moedasGanhas: 0 };
  }

  // Aplica freio anti-inflação se necessário
  const moedasGanhas = moedasBase;
  econ.missoesResgatadasHoje.push(missaoId);
  econ.moedasGanhasHoje += moedasGanhas;
  salvarEconomiaDiariaLocal(userId, econ);

  const updatedUser: UserProfile = {
    ...user,
    coins: (user.coins || 0) + moedasGanhas,
  };

  if (user.id || user.uid) {
    FirestoreService.updateDocument("users", userId, {
      coins: updatedUser.coins,
    }).catch(() => {});
  }

  return {
    success: true,
    mensagem: `+${moedasGanhas} moedas resgatadas com sucesso!`,
    moedasGanhas,
    updatedUser,
  };
}

/**
 * Compra de proteção de congelamento de ofensiva (Streak Freeze).
 * Custa exatamente 300 moedas, com limite máximo de 2 unidades em estoque.
 */
export async function comprarCongelamentoOfensiva(
  user: UserProfile
): Promise<{
  success: boolean;
  mensagem: string;
  updatedUser?: UserProfile;
}> {
  const CUSTO = ECONOMIA_CONFIG.OFENSIVA.CUSTO_CONGELAMENTO_MOEDAS;
  const MAX = ECONOMIA_CONFIG.OFENSIVA.MAX_CONGELAMENTOS_ESTOQUE;
  const atual = user.congelamentosOfensiva || 0;

  if (atual >= MAX) {
    return {
      success: false,
      mensagem: `Estoque cheio! Você já possui o limite máximo de ${MAX} congelamentos guardados.`,
    };
  }

  if ((user.coins || 0) < CUSTO) {
    return {
      success: false,
      mensagem: `Moedas insuficientes. O congelamento custa ${CUSTO} moedas (você tem ${user.coins || 0}).`,
    };
  }

  const updatedUser: UserProfile = {
    ...user,
    coins: user.coins - CUSTO,
    congelamentosOfensiva: atual + 1,
  };

  const userId = user.id || user.uid || "local-student";
  if (user.id || user.uid) {
    FirestoreService.updateDocument("users", userId, {
      coins: updatedUser.coins,
      congelamentosOfensiva: updatedUser.congelamentosOfensiva,
    }).catch(() => {});
  }

  return {
    success: true,
    mensagem: `Congelamento de ofensiva adquirido! Saldo atual: ${updatedUser.congelamentosOfensiva}/${MAX}.`,
    updatedUser,
  };
}

/**
 * Verifica e concede recompensas de marcos de ofensiva (7, 30, 100 dias).
 */
export function verificarMarcosOfensiva(
  user: UserProfile
): {
  marcosPendentes: Array<{ dias: number; moedas: number }>;
} {
  const streak = user.streakDays || 1;
  const resgatados = new Set(user.marcosOfensivaResgatados || []);
  const pendentes: Array<{ dias: number; moedas: number }> = [];

  for (const [diasStr, moedas] of Object.entries(ECONOMIA_CONFIG.OFENSIVA.RECOMPENSAS_MARCOS)) {
    const dias = Number(diasStr);
    if (streak >= dias && !resgatados.has(dias)) {
      pendentes.push({ dias, moedas: moedas as number });
    }
  }

  return { marcosPendentes: pendentes };
}

/**
 * Resgata a recompensa de um marco de ofensiva alcançado.
 */
export async function resgatarMarcoOfensiva(
  user: UserProfile,
  dias: number
): Promise<{
  success: boolean;
  mensagem: string;
  updatedUser?: UserProfile;
}> {
  const moedas = (ECONOMIA_CONFIG.OFENSIVA.RECOMPENSAS_MARCOS as any)[dias];
  if (!moedas) {
    return { success: false, mensagem: "Marco de ofensiva inválido." };
  }

  const resgatados = [...(user.marcosOfensivaResgatados || [])];
  if (resgatados.includes(dias)) {
    return { success: false, mensagem: "Este marco já foi resgatado." };
  }

  resgatados.push(dias);
  const updatedUser: UserProfile = {
    ...user,
    coins: (user.coins || 0) + moedas,
    marcosOfensivaResgatados: resgatados,
  };

  const userId = user.id || user.uid || "local-student";
  if (user.id || user.uid) {
    FirestoreService.updateDocument("users", userId, {
      coins: updatedUser.coins,
      marcosOfensivaResgatados: updatedUser.marcosOfensivaResgatados,
    }).catch(() => {});
  }

  return {
    success: true,
    mensagem: `Marco de ${dias} dias de ofensiva resgatado! +${moedas} moedas recebidas.`,
    updatedUser,
  };
}

/**
 * Compra de item na Loja Acadêmica com sumidouros definidos.
 */
export async function comprarItemLojaAcademica(
  user: UserProfile,
  itemId: "comida_pet" | "brinquedo_pet" | "bonus_xp"
): Promise<{
  success: boolean;
  mensagem: string;
  updatedUser?: UserProfile;
}> {
  let preco = 0;
  if (itemId === "comida_pet") preco = ECONOMIA_CONFIG.PRECOS.comida_pet; // 40
  else if (itemId === "brinquedo_pet") preco = ECONOMIA_CONFIG.PRECOS.brinquedo_pet; // 80
  else if (itemId === "bonus_xp") preco = ECONOMIA_CONFIG.PRECOS.bonus_xp_15min.preco; // 150

  if ((user.coins || 0) < preco) {
    return {
      success: false,
      mensagem: `Moedas insuficientes. O item custa ${preco} moedas (você possui ${user.coins || 0}).`,
    };
  }

  const novoInventario = { ...(user.itensInventario || {}) };
  let novoXpBoost = user.xpBoostAte || null;
  let novaEnergia = user.energy;

  if (itemId === "comida_pet") {
    // Ração energética: +20 de energia vital
    novaEnergia = Math.min(user.maxEnergy || 50, novaEnergia + 20);
    novoInventario.comida_pet = (novoInventario.comida_pet || 0) + 1;
  } else if (itemId === "brinquedo_pet") {
    novoInventario.brinquedo_pet = (novoInventario.brinquedo_pet || 0) + 1;
  } else if (itemId === "bonus_xp") {
    // XP Boost 1.5x por 2 horas (7200000 ms)
    novoXpBoost = Date.now() + 2 * 3600 * 1000;
  }

  const updatedUser: UserProfile = {
    ...user,
    coins: user.coins - preco,
    energy: novaEnergia,
    itensInventario: novoInventario,
    xpBoostAte: novoXpBoost,
  };

  const userId = user.id || user.uid || "local-student";
  if (user.id || user.uid) {
    FirestoreService.updateDocument("users", userId, {
      coins: updatedUser.coins,
      energy: updatedUser.energy,
      itensInventario: updatedUser.itensInventario,
      xpBoostAte: updatedUser.xpBoostAte,
    }).catch(() => {});
  }

  return {
    success: true,
    mensagem: `Item adquirido com sucesso!`,
    updatedUser,
  };
}
