/**
 * APP-IFES - Serviço da Cidade do Conhecimento
 * Experiência com visual de jogo mobile profissional inspirado em vilas (Coin Master).
 * Suporte a 4 cidades temáticas com 5 monumentos únicos cada e persistência robusta.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { CIDADES_DATA, obterCidadePorId, obterCustoEstagio } from "../data/cidadesData";
import { movimentarMoedas } from "../../economia/services/extratoService";

export interface EstadoCidadeUsuario {
  cidadeAtual: number; // 1 a 4
  construcoes: Record<string, number>; // chaveConstrucao -> nivel (1 a 5, ou 6+)
  cidadesCompletadas: number[];
  selos: string[];
  ajudasHoje: number;
  ultimaAjudaData: string;
  totalObrasConcluidas: number;
  atualizadoEm: string;
}

const LOCAL_STORAGE_KEY_PREFIX = "brain_cidade_state_";

/**
 * Retorna o estado inicial padrão para a cidade.
 */
export function obterEstadoCidadePadrao(cidadeId = 1): EstadoCidadeUsuario {
  const cidade = obterCidadePorId(cidadeId);
  const construcoes: Record<string, number> = {};

  for (const m of cidade.monumentos) {
    construcoes[m.id] = 1; // Começa no estágio 1 (Terreno)
  }

  return {
    cidadeAtual: cidade.id,
    construcoes,
    cidadesCompletadas: [],
    selos: ["Cidadão Acadêmico do IFES"],
    ajudasHoje: 0,
    ultimaAjudaData: new Date().toISOString().slice(0, 10),
    totalObrasConcluidas: 0,
    atualizadoEm: new Date().toISOString(),
  };
}

/**
 * Normaliza o estado garantindo que todas as construções da cidade ativa existam.
 */
export function normalizarEstadoCidade(
  estado: Partial<EstadoCidadeUsuario>,
  cidadeId?: number
): EstadoCidadeUsuario {
  const idAtivo = Math.min(4, Math.max(1, cidadeId || estado.cidadeAtual || 1));
  const cidade = obterCidadePorId(idAtivo);

  const construcoes: Record<string, number> = { ...(estado.construcoes || {}) };
  for (const m of cidade.monumentos) {
    if (!construcoes[m.id] || construcoes[m.id] < 1) {
      construcoes[m.id] = 1;
    }
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const ajudasHoje = estado.ultimaAjudaData === hoje ? estado.ajudasHoje ?? 0 : 0;

  return {
    cidadeAtual: idAtivo,
    construcoes,
    cidadesCompletadas: Array.isArray(estado.cidadesCompletadas) ? estado.cidadesCompletadas : [],
    selos: Array.isArray(estado.selos) && estado.selos.length > 0 ? estado.selos : ["Cidadão Acadêmico do IFES"],
    ajudasHoje,
    ultimaAjudaData: hoje,
    totalObrasConcluidas: estado.totalObrasConcluidas ?? 0,
    atualizadoEm: new Date().toISOString(),
  };
}

/**
 * Carrega o estado da Cidade do Conhecimento do Firestore ou cache local.
 */
export async function carregarEstadoCidade(userId: string): Promise<EstadoCidadeUsuario> {
  const localKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;

  // 1. Tentar ler do localStorage para exibição instantânea
  let estadoLocal: EstadoCidadeUsuario | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        estadoLocal = normalizarEstadoCidade(JSON.parse(raw));
      }
    } catch {}
  }

  // 2. Se houver conexão com Firestore, sincroniza
  if (db && userId && userId !== "local-user") {
    try {
      const cidadeRef = doc(db, "users", userId, "cidade", "progresso");
      const snap = await getDoc(cidadeRef);

      if (snap.exists()) {
        const dadosRemotos = snap.data() as Partial<EstadoCidadeUsuario>;
        const estadoFinal = normalizarEstadoCidade(dadosRemotos);

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(localKey, JSON.stringify(estadoFinal));
          } catch {}
        }
        return estadoFinal;
      } else if (estadoLocal) {
        await setDoc(cidadeRef, estadoLocal, { merge: true });
        return estadoLocal;
      }
    } catch {
      // Offline ou sem permissão: continua com o local
    }
  }

  return estadoLocal || obterEstadoCidadePadrao(1);
}

/**
 * Salva o estado da Cidade do Conhecimento no Firestore e no cache local.
 */
export async function salvarEstadoCidade(userId: string, estado: EstadoCidadeUsuario): Promise<void> {
  const localKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(localKey, JSON.stringify(estado));
    } catch {}
  }

  if (db && userId && userId !== "local-user") {
    try {
      const cidadeRef = doc(db, "users", userId, "cidade", "progresso");
      await setDoc(cidadeRef, estado, { merge: true });
    } catch (err) {
      console.warn("[CidadeService] Falha ao sincronizar com Firestore, salvo localmente:", err);
    }
  }
}

/**
 * Calcula o progresso de estrelas da vila atual.
 */
export function calcularProgressoCidade(
  estado: EstadoCidadeUsuario,
  cidadeId: number
): {
  concluidos: number;
  total: number;
  porcentagem: number;
  todasNoMaximo: boolean;
} {
  const cidade = obterCidadePorId(cidadeId);
  const maxNivelPorConstrucao = 5;
  const total = cidade.monumentos.length * maxNivelPorConstrucao;

  let concluidos = 0;
  let todasNoMaximo = true;

  for (const m of cidade.monumentos) {
    const nivel = estado.construcoes[m.id] || 1;
    concluidos += Math.min(5, nivel);
    if (nivel < maxNivelPorConstrucao) {
      todasNoMaximo = false;
    }
  }

  const porcentagem = Math.min(100, Math.round((concluidos / total) * 100));
  return { concluidos, total, porcentagem, todasNoMaximo };
}

/**
 * Evolui o estágio de uma construção na cidade ativa.
 */
export async function evoluirConstrucao(
  userId: string,
  chaveConstrucao: string,
  saldoMoedas: number
): Promise<{
  sucesso: boolean;
  novoEstado: EstadoCidadeUsuario;
  custoMoedas: number;
  xpGanho: number;
  mensagem: string;
  cidadeCompletou: boolean;
}> {
  const estadoAtual = await carregarEstadoCidade(userId);
  const cidade = obterCidadePorId(estadoAtual.cidadeAtual);

  const nivelAtual = estadoAtual.construcoes[chaveConstrucao] || 1;
  const progressoAntes = calcularProgressoCidade(estadoAtual, cidade.id);

  // Se já está no nível 5 e a cidade ainda não foi conquistada, incentiva a focar nas outras obras
  if (nivelAtual >= 5 && !progressoAntes.todasNoMaximo) {
    return {
      sucesso: false,
      novoEstado: estadoAtual,
      custoMoedas: 0,
      xpGanho: 0,
      mensagem: "Este monumento já atingiu 5 estrelas! Complete as outras obras da vila para avançar.",
      cidadeCompletou: false,
    };
  }

  const proximoNivel = nivelAtual + 1;
  const custo = obterCustoEstagio(cidade.id, proximoNivel);

  if (saldoMoedas < custo) {
    return {
      sucesso: false,
      novoEstado: estadoAtual,
      custoMoedas: custo,
      xpGanho: 0,
      mensagem: `Moedas insuficientes. Você precisa de ${custo} IF Coins para esta construção.`,
      cidadeCompletou: false,
    };
  }

  // Registra movimentação no livro-razão financeiro do APP-IFES
  try {
    await movimentarMoedas(
      userId,
      -custo,
      "cidade",
      chaveConstrucao,
      `cidade_build_${Date.now()}_${chaveConstrucao}`,
      `Construção na ${cidade.nome}: ${chaveConstrucao} (Nível ${proximoNivel})`
    );
  } catch {}

  const novasConstrucoes = {
    ...estadoAtual.construcoes,
    [chaveConstrucao]: proximoNivel,
  };

  const xpGanho = Math.round(custo * 0.6);

  const novoEstado: EstadoCidadeUsuario = {
    ...estadoAtual,
    construcoes: novasConstrucoes,
    totalObrasConcluidas: estadoAtual.totalObrasConcluidas + 1,
    atualizadoEm: new Date().toISOString(),
  };

  // Verifica se todas as construções atingiram o nível 5
  const progressoDepois = calcularProgressoCidade(novoEstado, cidade.id);
  let cidadeCompletou = false;

  if (progressoDepois.todasNoMaximo && !novoEstado.cidadesCompletadas.includes(cidade.id)) {
    cidadeCompletou = true;
    novoEstado.cidadesCompletadas = [...novoEstado.cidadesCompletadas, cidade.id];
    novoEstado.selos = [...novoEstado.selos, `Mestre de ${cidade.nome}`];

    // Se houver próxima cidade, avança automaticamente
    if (cidade.id < CIDADES_DATA.length) {
      const proximaId = cidade.id + 1;
      const proximaCidade = obterCidadePorId(proximaId);
      novoEstado.cidadeAtual = proximaId;
      for (const m of proximaCidade.monumentos) {
        if (!novoEstado.construcoes[m.id]) {
          novoEstado.construcoes[m.id] = 1;
        }
      }
    }
  }

  await salvarEstadoCidade(userId, novoEstado);

  return {
    sucesso: true,
    novoEstado,
    custoMoedas: custo,
    xpGanho,
    mensagem: `Construção avançou para o Estágio ${proximoNivel}!`,
    cidadeCompletou,
  };
}

/**
 * Alterna a cidade ativa (permite qualquer cidade desbloqueada).
 */
export async function trocarCidadeAtiva(userId: string, novaCidadeId: number): Promise<EstadoCidadeUsuario> {
  const estadoAtual = await carregarEstadoCidade(userId);
  const novaCidade = obterCidadePorId(novaCidadeId);

  // Cidade 1 é sempre desbloqueada; cidades seguintes exigem ter completado a anterior
  const desbloqueada = novaCidadeId === 1 || estadoAtual.cidadesCompletadas.includes(novaCidadeId - 1);

  if (!desbloqueada) {
    throw new Error(`A ${novaCidade.nome} está bloqueada. Complete todas as estrelas da vila anterior.`);
  }

  const construcoes = { ...estadoAtual.construcoes };
  for (const m of novaCidade.monumentos) {
    if (!construcoes[m.id]) {
      construcoes[m.id] = 1;
    }
  }

  const novoEstado: EstadoCidadeUsuario = {
    ...estadoAtual,
    cidadeAtual: novaCidadeId,
    construcoes,
    atualizadoEm: new Date().toISOString(),
  };

  await salvarEstadoCidade(userId, novoEstado);
  return novoEstado;
}

/**
 * Ação de cooperação / ajuda diária
 */
export async function prestarAjudaCooperativa(userId: string): Promise<{
  sucesso: boolean;
  novoEstado: EstadoCidadeUsuario;
  moedasGanhas: number;
  xpGanho: number;
  mensagem: string;
}> {
  const estadoAtual = await carregarEstadoCidade(userId);
  const hoje = new Date().toISOString().slice(0, 10);

  const ajudasHoje = estadoAtual.ultimaAjudaData === hoje ? estadoAtual.ajudasHoje : 0;
  if (ajudasHoje >= 3) {
    return {
      sucesso: false,
      novoEstado: estadoAtual,
      moedasGanhas: 0,
      xpGanho: 0,
      mensagem: "Você já realizou suas 3 ajudas de hoje. Volte amanhã!",
    };
  }

  const moedasGanhas = 25;
  const xpGanho = 30;

  try {
    await movimentarMoedas(
      userId,
      moedasGanhas,
      "cidade",
      "ajuda_comunitaria",
      `ajuda_${Date.now()}`,
      "Ajuda Comunitária na Cidade"
    );
  } catch {}

  const novoEstado: EstadoCidadeUsuario = {
    ...estadoAtual,
    ajudasHoje: ajudasHoje + 1,
    ultimaAjudaData: hoje,
    atualizadoEm: new Date().toISOString(),
  };

  await salvarEstadoCidade(userId, novoEstado);

  return {
    sucesso: true,
    novoEstado,
    moedasGanhas,
    xpGanho,
    mensagem: `Ajuda enviada! Você ganhou +${moedasGanhas} IF Coins e +${xpGanho} XP.`,
  };
}
