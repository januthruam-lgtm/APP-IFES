/**
 * Brain Studio - Serviço da Cidade do Conhecimento (Fase 6)
 * Progressão acadêmica cooperativa: sem sorteio, sem ataque e sem roubo.
 * Integração com Firestore (/users/{uid}/cidade) e cache local seguro no cliente.
 */

import {
  CIDADES,
  ESTAGIOS_CIDADE,
  calcularCustoEstagio,
  obterCidadeDefinicao,
  obterEstagio,
  CidadeDefinicao,
} from "../../../config/cidade.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export interface EstadoCidadeUsuario {
  cidadeAtual: number; // 1 a infinito
  construcoes: Record<string, number>; // chaveConstrucao -> nivel (1 a infinito)
  cidadesCompletadas: number[];
  selos: string[];
  ajudasHoje: number; // Máximo 3 por dia
  ultimaAjudaData: string; // YYYY-MM-DD
  totalObrasConcluidas: number;
  atualizadoEm: string;
}

const LOCAL_STORAGE_KEY_PREFIX = "brain_cidade_state_";

/**
 * Retorna o estado inicial padrão para uma cidade.
 */
export function obterEstadoCidadePadrao(cidadeId = 1): EstadoCidadeUsuario {
  const cidade = obterCidadeDefinicao(cidadeId);
  const construcoes: Record<string, number> = {};

  for (const chave of cidade.chavesConstrucoes) {
    construcoes[chave] = 1; // Começa no nível 1 (Terreno)
  }

  return {
    cidadeAtual: cidade.id,
    construcoes,
    cidadesCompletadas: [],
    selos: ["Cidadão Iniciante"],
    ajudasHoje: 0,
    ultimaAjudaData: new Date().toISOString().slice(0, 10),
    totalObrasConcluidas: 0,
    atualizadoEm: new Date().toISOString(),
  };
}

/**
 * Normaliza o estado garantindo que todas as construções da cidade ativa existam.
 */
export function normalizarEstadoCidade(estado: Partial<EstadoCidadeUsuario>, cidadeId?: number): EstadoCidadeUsuario {
  const idAtivo = cidadeId || estado.cidadeAtual || 1;
  const cidade = obterCidadeDefinicao(idAtivo);

  const construcoes: Record<string, number> = { ...(estado.construcoes || {}) };
  for (const chave of cidade.chavesConstrucoes) {
    if (!construcoes[chave] || construcoes[chave] < 1) {
      construcoes[chave] = 1;
    }
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const ajudasHoje = estado.ultimaAjudaData === hoje ? (estado.ajudasHoje ?? 0) : 0;

  return {
    cidadeAtual: idAtivo,
    construcoes,
    cidadesCompletadas: Array.isArray(estado.cidadesCompletadas) ? estado.cidadesCompletadas : [],
    selos: Array.isArray(estado.selos) && estado.selos.length > 0 ? estado.selos : ["Cidadão Iniciante"],
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

  // 1. Tentar ler do localStorage para exibição instantânea offline
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
        // Se ainda não existe no Firestore mas tem local, salva
        await setDoc(cidadeRef, estadoLocal, { merge: true });
        return estadoLocal;
      }
    } catch {
      // Falha de rede ou sem permissão: continua com o local
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
 * Calcula o progresso percentual e contagem de estágios da cidade.
 */
export function calcularProgressoCidade(estado: EstadoCidadeUsuario, cidadeId: number): {
  concluidos: number;
  total: number;
  porcentagem: number;
  todasNoMaximo: boolean;
} {
  const cidade = obterCidadeDefinicao(cidadeId);
  const maxNivelPorConstrucao = 5;
  const total = cidade.totalConstrucoes * maxNivelPorConstrucao;

  let concluidos = 0;
  let todasNoMaximo = true;

  for (const chave of cidade.chavesConstrucoes) {
    const nivel = estado.construcoes[chave] || 1;
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
 * Suporta níveis ilimitados: estágios 1 a 5 para conquista da vila e Mestria Contínua (6+) após conquista.
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
  const cidade = obterCidadeDefinicao(estadoAtual.cidadeAtual);

  const nivelAtual = estadoAtual.construcoes[chaveConstrucao] || 1;
  const progressoAntes = calcularProgressoCidade(estadoAtual, cidade.id);

  // Se a construção já está no nível 5 e a cidade AINDA NÃO foi conquistada,
  // incentiva a focar em completar as outras obras da vila para avançar!
  if (nivelAtual >= 5 && !progressoAntes.todasNoMaximo) {
    return {
      sucesso: false,
      novoEstado: estadoAtual,
      custoMoedas: 0,
      xpGanho: 0,
      mensagem: "Esta obra já atingiu o nível 5! Complete as demais construções para conquistar a vila e liberar a próxima cidade e o modo de Mestria!",
      cidadeCompletou: false,
    };
  }

  const proximoNivel = nivelAtual + 1;
  const custo = calcularCustoEstagio(cidade.id, proximoNivel);

  if (saldoMoedas < custo) {
    return {
      sucesso: false,
      novoEstado: estadoAtual,
      custoMoedas: custo,
      xpGanho: 0,
      mensagem: `Moedas insuficientes. Você precisa de ${custo} moedas para esta evolução.`,
      cidadeCompletou: false,
    };
  }

  const novasConstrucoes = {
    ...estadoAtual.construcoes,
    [chaveConstrucao]: proximoNivel,
  };

  // XP ganho é metade do custo em moedas
  const xpGanho = Math.round(custo * 0.5);

  const novoEstado: EstadoCidadeUsuario = {
    ...estadoAtual,
    construcoes: novasConstrucoes,
    totalObrasConcluidas: estadoAtual.totalObrasConcluidas + 1,
    atualizadoEm: new Date().toISOString(),
  };

  // Verificar se todas as construções da cidade atingiram ao menos o nível 5
  const progresso = calcularProgressoCidade(novoEstado, cidade.id);
  let cidadeCompletou = false;

  if (progresso.todasNoMaximo && !novoEstado.cidadesCompletadas.includes(cidade.id)) {
    cidadeCompletou = true;
    novoEstado.cidadesCompletadas = [...novoEstado.cidadesCompletadas, cidade.id];
    novoEstado.selos = [...novoEstado.selos, `Mestre de ${cidade.nome}`];

    // Avança para a próxima cidade ilimitada!
    const proximaCidadeId = cidade.id + 1;
    const proximaCidade = obterCidadeDefinicao(proximaCidadeId);
    if (proximaCidade) {
      novoEstado.cidadeAtual = proximaCidadeId;
      for (const chave of proximaCidade.chavesConstrucoes) {
        if (!novoEstado.construcoes[chave]) {
          novoEstado.construcoes[chave] = 1;
        }
      }
    }
  }

  await salvarEstadoCidade(userId, novoEstado);

  const nomeEstagio = obterEstagio(proximoNivel).nome;
  return {
    sucesso: true,
    novoEstado,
    custoMoedas: custo,
    xpGanho,
    mensagem: `Evolução concluída! Construção avançou para ${nomeEstagio}.`,
    cidadeCompletou,
  };
}

/**
 * Ação cooperativa diária: enviar ajuda de estudo para colegas da equipe (máx. 3 vezes ao dia).
 * Fornece moedas ao ajudante e cooperação sem ataques ou perdas.
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
      mensagem: "Você já realizou suas 3 ajudas comunitárias de hoje. Volte amanhã!",
    };
  }

  const moedasGanhas = 15;
  const xpGanho = 25;

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
    mensagem: `Ajuda enviada com sucesso! Você ganhou ${moedasGanhas} moedas e ${xpGanho} XP por colaborar com os colegas.`,
  };
}

/**
 * Alterna a cidade ativa (permite qualquer cidade desbloqueada na progressão infinita).
 */
export async function trocarCidadeAtiva(userId: string, novaCidadeId: number): Promise<EstadoCidadeUsuario> {
  const estadoAtual = await carregarEstadoCidade(userId);
  const novaCidade = obterCidadeDefinicao(novaCidadeId);

  if (!novaCidade) return estadoAtual;

  // Cidade 1 é sempre desbloqueada; cidades seguintes exigem ter completado a anterior
  const cidadeAnterior = novaCidadeId - 1;
  const desbloqueada = novaCidadeId === 1 || estadoAtual.cidadesCompletadas.includes(cidadeAnterior);

  if (!desbloqueada) {
    throw new Error(`A cidade ${novaCidade.nome} ainda está bloqueada. Complete a vila anterior para acessá-la.`);
  }

  const construcoes = { ...estadoAtual.construcoes };
  for (const chave of novaCidade.chavesConstrucoes) {
    if (!construcoes[chave]) {
      construcoes[chave] = 1;
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
