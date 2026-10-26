/**
 * Brain Studio - Serviço do Programa de Fidelidade Acadêmica
 * Gestão de níveis por janela móvel (30 dias), cofre de retorno com teto de 500 moedas,
 * selos de colecionador, vales-desconto e metas semanais.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { FIDELIDADE_CONFIG } from "../../../config/fidelidade.config";
import { movimentarMoedas } from "./extratoService";

export interface EstadoFidelidadeUsuario {
  uid: string;
  nivelId: "bronze" | "prata" | "ouro" | "safira" | "diamante";
  gastoElegivel30d: number;
  saldoCofre: number;
  selosDisponiveis: number;
  selosTotalAcumulados: number;
  itensSelosDesbloqueados: string[];
  gastoSemanaAtual: number;
  chaveSemanaAtual: string;
  resgateSemanaAtual: {
    valor: number;
    resgatesCount: number;
    ultimaDataIso?: string;
  };
  metasSemanaisConcluidas: string[];
  valesDesconto: Array<{
    id: string;
    nivel: string;
    percentual: number;
    expiraEm: string;
    usado: boolean;
  }>;
}

const STORAGE_KEY_FIDELIDADE_PREFIX = "brain_studio_fidelidade_v1";

/**
 * Retorna a chave canônica da semana civil (ISO week) no fuso America/Sao_Paulo
 * Formato: "AAAA-WSS" (ex: "2026-W43")
 */
export function obterChaveSemanaSaoPaulo(data = new Date()): string {
  // Ajusta a data para o fuso horário America/Sao_Paulo
  const spDateStr = data.toLocaleDateString("en-CA", {
    timeZone: FIDELIDADE_CONFIG.FUSO_HORARIO,
  }); // YYYY-MM-DD
  const [year, month, day] = spDateStr.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1, day));

  // Segunda-feira como primeiro dia da semana ISO
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.getTime();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Retorna o nível de cliente baseado no gasto elegível acumulado nos últimos 30 dias
 */
export function calcularNivelFidelidade(gasto30d: number) {
  const niveis = [...FIDELIDADE_CONFIG.NIVEIS_CLIENTE].reverse();
  const nivelEncontrado = niveis.find((n) => gasto30d >= n.gastoMinimo30d);
  return nivelEncontrado || FIDELIDADE_CONFIG.NIVEIS_CLIENTE[0];
}

/**
 * Estado padrão inicial do usuário no programa
 */
export function criarEstadoFidelidadePadrao(uid: string): EstadoFidelidadeUsuario {
  const chaveSemana = obterChaveSemanaSaoPaulo();
  return {
    uid,
    nivelId: "bronze",
    gastoElegivel30d: 0,
    saldoCofre: 0,
    selosDisponiveis: 0,
    selosTotalAcumulados: 0,
    itensSelosDesbloqueados: [],
    gastoSemanaAtual: 0,
    chaveSemanaAtual: chaveSemana,
    resgateSemanaAtual: {
      valor: 0,
      resgatesCount: 0,
    },
    metasSemanaisConcluidas: [],
    valesDesconto: [],
  };
}

/**
 * Carrega estado de fidelidade (Firestore com fallback no localStorage)
 */
export async function carregarEstadoFidelidade(uid: string): Promise<EstadoFidelidadeUsuario> {
  const chaveSemana = obterChaveSemanaSaoPaulo();
  const storageKey = `${STORAGE_KEY_FIDELIDADE_PREFIX}_${uid}`;

  let estado: EstadoFidelidadeUsuario | null = null;

  try {
    const rawLocal = localStorage.getItem(storageKey);
    if (rawLocal) {
      estado = JSON.parse(rawLocal);
    }
  } catch (e) {
    console.warn("Erro ao ler fidelidade local:", e);
  }

  try {
    const docRef = doc(db, "users", uid, "fidelidade", "perfil");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      estado = { ...(estado || {}), ...snap.data() } as EstadoFidelidadeUsuario;
    }
  } catch (err) {
    // Modo offline ou sem permissão temporária
  }

  if (!estado) {
    estado = criarEstadoFidelidadePadrao(uid);
  }

  // Verifica se a semana virou para renovar cotas de resgate do cofre e metas semanais
  if (estado.chaveSemanaAtual !== chaveSemana) {
    estado.chaveSemanaAtual = chaveSemana;
    estado.gastoSemanaAtual = 0;
    estado.resgateSemanaAtual = { valor: 0, resgatesCount: 0 };
    estado.metasSemanaisConcluidas = [];
    salvarEstadoFidelidade(uid, estado);
  }

  // Recalcula o nível atual
  const nivel = calcularNivelFidelidade(estado.gastoElegivel30d);
  estado.nivelId = nivel.id as any;

  return estado;
}

/**
 * Salva estado de fidelidade local e remotamente
 */
export async function salvarEstadoFidelidade(uid: string, estado: EstadoFidelidadeUsuario): Promise<void> {
  const storageKey = `${STORAGE_KEY_FIDELIDADE_PREFIX}_${uid}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(estado));
  } catch (err) {
    console.warn("Aviso ao salvar fidelidade local:", err);
  }

  try {
    const docRef = doc(db, "users", uid, "fidelidade", "perfil");
    await setDoc(docRef, estado, { merge: true });
  } catch (err) {
    // Offline tolerante
  }
}

/**
 * Verifica se uma categoria é elegível para cashback e selos
 */
export function isCategoriaElegivel(categoria: string): boolean {
  if (FIDELIDADE_CONFIG.GASTO_ELEGIVEL.ITENS_EXCLUIDOS.includes(categoria as any)) {
    return false;
  }
  return FIDELIDADE_CONFIG.GASTO_ELEGIVEL.CATEGORIAS_PERMITIDAS.includes(categoria as any);
}

/**
 * Registra um gasto elegível e credita o cashback no cofre, selos e metas semanais.
 */
export async function registrarGastoElegivel(
  uid: string,
  valorGasto: number,
  categoria: string,
  refId?: string
): Promise<{
  estado: EstadoFidelidadeUsuario;
  cashbackNoCofre: number;
  novosSelos: number;
  metaSemanalAlcancada?: { id: string; retornoCofre: number };
}> {
  const estado = await carregarEstadoFidelidade(uid);

  if (valorGasto <= 0 || !isCategoriaElegivel(categoria)) {
    return { estado, cashbackNoCofre: 0, novosSelos: 0 };
  }

  // 1. Atualiza gasto nos últimos 30 dias e recalcula nível
  estado.gastoElegivel30d += valorGasto;
  const nivel = calcularNivelFidelidade(estado.gastoElegivel30d);
  estado.nivelId = nivel.id as any;

  // 2. Calcula percentual de cashback (Base + Semana Temática se aplicável)
  let percentualRetorno = nivel.porcentagemRetorno;
  const semanaTematicaAtiva = FIDELIDADE_CONFIG.SEMANAS_TEMATICAS.find(
    (st) => st.categoria === categoria
  );
  if (semanaTematicaAtiva) {
    percentualRetorno += semanaTematicaAtiva.bonusPercentualCofre;
  }

  const cashbackCalculado = Math.floor(valorGasto * percentualRetorno);
  let cashbackReal = 0;

  // 3. Aplica teto do cofre (Capacidade máxima de 500)
  if (cashbackCalculado > 0) {
    const espacoNoCofre = Math.max(0, FIDELIDADE_CONFIG.COFRE.CAPACIDADE_MAXIMA - estado.saldoCofre);
    cashbackReal = Math.min(cashbackCalculado, espacoNoCofre);
    estado.saldoCofre += cashbackReal;
  }

  // 4. Concessão de Selos (1 selo a cada 100 moedas gastas acumuladas)
  const selosAnterioresTotal = Math.floor((estado.gastoElegivel30d - valorGasto) / FIDELIDADE_CONFIG.SELOS.MOEDAS_POR_SELO);
  const selosNovosTotal = Math.floor(estado.gastoElegivel30d / FIDELIDADE_CONFIG.SELOS.MOEDAS_POR_SELO);
  const novosSelos = Math.max(0, selosNovosTotal - selosAnterioresTotal);

  if (novosSelos > 0) {
    estado.selosDisponiveis += novosSelos;
    estado.selosTotalAcumulados += novosSelos;
  }

  // 5. Progresso de metas semanais
  estado.gastoSemanaAtual += valorGasto;
  let metaAlcancada: { id: string; retornoCofre: number } | undefined;

  for (const meta of FIDELIDADE_CONFIG.METAS_SEMANAIS) {
    if (
      estado.gastoSemanaAtual >= meta.gastoMinimo &&
      !estado.metasSemanaisConcluidas.includes(meta.id)
    ) {
      estado.metasSemanaisConcluidas.push(meta.id);
      metaAlcancada = meta;
      // Bônus da meta vai direto para o cofre, respeitando teto
      const espacoNoCofre = Math.max(0, FIDELIDADE_CONFIG.COFRE.CAPACIDADE_MAXIMA - estado.saldoCofre);
      const bonusCofre = Math.min(meta.retornoCofre, espacoNoCofre);
      estado.saldoCofre += bonusCofre;
    }
  }

  await salvarEstadoFidelidade(uid, estado);

  return {
    estado,
    cashbackNoCofre: cashbackReal,
    novosSelos,
    metaSemanalAlcancada: metaAlcancada,
  };
}

/**
 * Resgate de moedas do cofre de fidelidade para o saldo do usuário.
 * Regras:
 * - Teto de 250 moedas por semana civil
 * - Máximo de 1 resgate por semana civil
 * - Requer pelo menos 1 missão diária concluída na data do resgate
 */
export async function resgatarCofreFidelidade(
  uid: string,
  missaoDiariaConcluidaHoje: boolean
): Promise<{
  sucesso: boolean;
  valorResgatado: number;
  novoSaldoCofre: number;
  mensagem: string;
}> {
  const estado = await carregarEstadoFidelidade(uid);

  if (estado.saldoCofre <= 0) {
    return {
      sucesso: false,
      valorResgatado: 0,
      novoSaldoCofre: estado.saldoCofre,
      mensagem: "O cofre está vazio. Continue estudando e adquirindo obras para acumular retorno!",
    };
  }

  if (FIDELIDADE_CONFIG.COFRE.REQUER_MISSAO_DIARIA_CONCLUIDA && !missaoDiariaConcluidaHoje) {
    return {
      sucesso: false,
      valorResgatado: 0,
      novoSaldoCofre: estado.saldoCofre,
      mensagem: "Complete pelo menos 1 missão diária de estudo hoje para liberar o resgate do cofre.",
    };
  }

  if (estado.resgateSemanaAtual.resgatesCount >= FIDELIDADE_CONFIG.COFRE.MAX_RESGATES_SEMANA_CIVIL) {
    return {
      sucesso: false,
      valorResgatado: 0,
      novoSaldoCofre: estado.saldoCofre,
      mensagem: "Você já realizou o resgate do cofre desta semana civil. A cota renova na próxima segunda-feira.",
    };
  }

  const limiteSemanalRestante = Math.max(
    0,
    FIDELIDADE_CONFIG.COFRE.TETO_RESGATE_SEMANAL - estado.resgateSemanaAtual.valor
  );

  if (limiteSemanalRestante <= 0) {
    return {
      sucesso: false,
      valorResgatado: 0,
      novoSaldoCofre: estado.saldoCofre,
      mensagem: "Limite máximo de 250 moedas resgatadas por semana atingido.",
    };
  }

  const valorParaResgatar = Math.min(estado.saldoCofre, limiteSemanalRestante);

  // Executa lançamento atômico de ganho no livro-razão (extrato)
  const tx = await movimentarMoedas(
    uid,
    valorParaResgatar,
    "fidelidade",
    "resgate_cofre",
    `tx_cofre_${Date.now()}`,
    `Resgate do Cofre de Retorno (+${valorParaResgatar} moedas)`
  );

  if (!tx.sucesso) {
    return {
      sucesso: false,
      valorResgatado: 0,
      novoSaldoCofre: estado.saldoCofre,
      mensagem: "Não foi possível resgatar o cofre no momento. Tente novamente.",
    };
  }

  // Atualiza estado do cofre
  estado.saldoCofre -= valorParaResgatar;
  estado.resgateSemanaAtual.valor += valorParaResgatar;
  estado.resgateSemanaAtual.resgatesCount += 1;
  estado.resgateSemanaAtual.ultimaDataIso = new Date().toISOString();

  await salvarEstadoFidelidade(uid, estado);

  return {
    sucesso: true,
    valorResgatado: valorParaResgatar,
    novoSaldoCofre: estado.saldoCofre,
    mensagem: `Resgate de ${valorParaResgatar} moedas realizado com sucesso!`,
  };
}

/**
 * Resgate de item exclusivo do catálogo de selos de fidelidade
 */
export async function resgatarItemSelos(
  uid: string,
  itemId: string
): Promise<{ sucesso: boolean; mensagem: string; estadoAtual?: EstadoFidelidadeUsuario }> {
  const item = FIDELIDADE_CONFIG.SELOS.CATALOGO.find((i) => i.id === itemId);
  if (!item) {
    return { sucesso: false, mensagem: "Item do catálogo não encontrado." };
  }

  const estado = await carregarEstadoFidelidade(uid);

  if (estado.itensSelosDesbloqueados.includes(itemId)) {
    return { sucesso: false, mensagem: "Você já possui este item exclusivo!" };
  }

  if (estado.selosDisponiveis < item.selos) {
    return {
      sucesso: false,
      mensagem: `Selos insuficientes. Você tem ${estado.selosDisponiveis} e o item exige ${item.selos} selos.`,
    };
  }

  estado.selosDisponiveis -= item.selos;
  estado.itensSelosDesbloqueados.push(itemId);

  await salvarEstadoFidelidade(uid, estado);

  return {
    sucesso: true,
    mensagem: `Parabéns! Você desbloqueou '${item.nome}' com seus selos de fidelidade.`,
    estadoAtual: estado,
  };
}

/**
 * Cálculo determinístico de descontos para compras (com teto de 20% e 150 moedas)
 */
export function calcularDescontoEfetivo(
  valorOriginal: number,
  nivelId: string,
  usarVale: boolean,
  descontoCidadePercentual = 0
): {
  valorOriginal: number;
  valorFinal: number;
  descontoMoedas: number;
  percentualDescontoAplicado: number;
} {
  if (valorOriginal <= 0) {
    return {
      valorOriginal: 0,
      valorFinal: 0,
      descontoMoedas: 0,
      percentualDescontoAplicado: 0,
    };
  }

  let percentualVale = 0;
  if (usarVale && valorOriginal >= FIDELIDADE_CONFIG.VALES_DESCONTO.VALOR_MINIMO_COMPRA) {
    percentualVale =
      (FIDELIDADE_CONFIG.VALES_DESCONTO.PORCENTAGEM_POR_NIVEL as any)[nivelId] || 0;
  }

  // Teto combinado: desconto da cidade + vale não pode ultrapassar 20%
  const somaPercentuais = Math.min(
    FIDELIDADE_CONFIG.VALES_DESCONTO.TETO_DESCONTO_COMBINADO,
    descontoCidadePercentual + percentualVale
  );

  const descontoBruto = Math.floor(valorOriginal * somaPercentuais);
  // Teto de desconto em moedas (150 moedas máximo de desconto)
  const descontoEfetivo = Math.min(descontoBruto, FIDELIDADE_CONFIG.VALES_DESCONTO.DESCONTO_MAXIMO_MOEDAS);
  const valorFinal = Math.max(0, valorOriginal - descontoEfetivo);

  return {
    valorOriginal,
    valorFinal,
    descontoMoedas: descontoEfetivo,
    percentualDescontoAplicado: somaPercentuais,
  };
}
