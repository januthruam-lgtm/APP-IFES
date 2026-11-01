/**
 * Brain Studio - Livro-Razão Contábil e Extrato de Moedas (Fase 4 & Fidelidade)
 * Coleção Firestore: users/{uid}/extrato/{id} (Append-only: apenas inserção)
 * Toda alteração de saldo passa obrigatoriamente por movimentarMoedas().
 */

import {
  collection,
  doc,
  runTransaction,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export type TipoLancamento = "ganho" | "gasto" | "saida" | "cashback" | "ajuste";

export type OrigemLancamento =
  | "bau"
  | "missao"
  | "ofensiva"
  | "liga"
  | "cidade"
  | "loja"
  | "cosmetico"
  | "fidelidade"
  | "meta_semanal"
  | "games"
  | "admin"
  | "historico"
  | "ajuste"
  | "recompensa";

export interface LancamentoExtrato {
  id: string;
  tipo: TipoLancamento;
  origem: OrigemLancamento;
  valor: number; // Inteiro positivo
  saldoApos: number;
  descricao?: string;
  refId?: string;
  idempotencyKey: string;
  criadoEm: string; // ISO String
}

const STORAGE_KEY_EXTRATO_LOCAL = "brain_studio_extrato_ledger_v1";
const memoryLedgerCache: Record<string, string> = {};

function getSafeStorage(key: string): string | null {
  if (typeof localStorage !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  return memoryLedgerCache[key] || null;
}

function setSafeStorage(key: string, val: string): void {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(key, val);
    } catch {}
  }
  memoryLedgerCache[key] = val;
}

/**
 * Lê o saldo atual salvo em localStorage em conformidade com o formato v3 do APP-IFES.
 */
export function carregarSaldoLocal(): number {
  try {
    const raw =
      getSafeStorage("brain_studio_user_v3") ||
      getSafeStorage("brain_studio_user_profile");
    if (raw) {
      const u = JSON.parse(raw);
      if (typeof u.coins === "number") return u.coins;
    }
  } catch {}
  return 250;
}

/**
 * Atualiza o saldo localmente em conformidade com o formato v3 do APP-IFES.
 */
function atualizarSaldoLocal(novoSaldo: number): void {
  try {
    const raw =
      getSafeStorage("brain_studio_user_v3") ||
      getSafeStorage("brain_studio_user_profile");
    if (raw) {
      const u = JSON.parse(raw);
      u.coins = novoSaldo;
      setSafeStorage("brain_studio_user_v3", JSON.stringify(u));
      setSafeStorage("brain_studio_user_profile", JSON.stringify(u));
    }
  } catch {}
}

/**
 * Carrega o extrato salvo localmente no navegador (fallback offline).
 * Suporta interoperabilidade entre UIDs com hífen ou sublinhado ("local_user" e "local-user").
 */
export function carregarExtratoLocal(uid: string): LancamentoExtrato[] {
  try {
    const raw = getSafeStorage(`${STORAGE_KEY_EXTRATO_LOCAL}_${uid}`);
    let lista: LancamentoExtrato[] = raw ? JSON.parse(raw) : [];

    if (uid === "local_user" || uid === "local-user") {
      const altUid = uid === "local_user" ? "local-user" : "local_user";
      const altRaw = getSafeStorage(`${STORAGE_KEY_EXTRATO_LOCAL}_${altUid}`);
      if (altRaw) {
        const altLista: LancamentoExtrato[] = JSON.parse(altRaw);
        const existentes = new Set(lista.map((l) => l.idempotencyKey));
        for (const item of altLista) {
          if (!existentes.has(item.idempotencyKey)) {
            lista.push(item);
            existentes.add(item.idempotencyKey);
          }
        }
      }
    }
    return lista.sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    );
  } catch (err) {
    console.warn("Aviso ao ler extrato local:", err);
  }
  return [];
}

/**
 * Salva lançamentos do extrato localmente para suporte offline e notifica ouvintes da UI.
 */
function salvarExtratoLocal(uid: string, lancamento: LancamentoExtrato) {
  try {
    const lista = carregarExtratoLocal(uid);
    if (lista.some((l) => l.idempotencyKey === lancamento.idempotencyKey)) {
      return;
    }
    const atualizado = [lancamento, ...lista];
    setSafeStorage(`${STORAGE_KEY_EXTRATO_LOCAL}_${uid}`, JSON.stringify(atualizado));

    if (uid === "local_user" || uid === "local-user") {
      setSafeStorage(`${STORAGE_KEY_EXTRATO_LOCAL}_local_user`, JSON.stringify(atualizado));
      setSafeStorage(`${STORAGE_KEY_EXTRATO_LOCAL}_local-user`, JSON.stringify(atualizado));
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("brain_studio_extrato_updated", { detail: lancamento }));
    }
  } catch (err) {
    console.warn("Aviso ao salvar extrato local:", err);
  }
}

/**
 * Executa movimentação atômica e idempotente no livro-razão de moedas (entradas e saídas).
 * @param uid Identificador do estudante
 * @param delta Quantidade de moedas (+ para entrada, - para saída/gasto)
 * @param origem Motivo do lançamento
 * @param refId Identificador de referência externa (ex: id da obra, id do pacote)
 * @param idempotencyKey Chave única para prevenir duplicidades
 * @param descricao Rótulo legível opcional
 */
export async function movimentarMoedas(
  uid: string,
  delta: number,
  origem: OrigemLancamento,
  refId?: string,
  idempotencyKey?: string,
  descricao?: string
): Promise<{ sucesso: boolean; novoSaldo: number; lancamento?: LancamentoExtrato; mensagem?: string }> {
  const chaveFinal = idempotencyKey || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const agoraIso = new Date().toISOString();
  const valorAbsoluto = Math.abs(delta);

  // Padronização: no Firestore 'gasto' é a chave canônica das regras de segurança
  const tipo: TipoLancamento =
    origem === "fidelidade"
      ? "cashback"
      : delta > 0
      ? "ganho"
      : delta < 0
      ? "gasto"
      : "ajuste";

  const saldoLocalAtual = carregarSaldoLocal();

  // Se o Firestore estiver disponível, executa a transação atômica
  if (db) {
    try {
      const userRef = doc(db, "users", uid);
      const extratoColRef = collection(db, "users", uid, "extrato");
      const lancamentoDocRef = doc(extratoColRef, chaveFinal);

      const resultado = await runTransaction(db, async (transaction) => {
        // 1. Verifica se já existe um lançamento com essa idempotencyKey
        const existingTx = await transaction.get(lancamentoDocRef);
        if (existingTx.exists()) {
          const dados = existingTx.data() as LancamentoExtrato;
          return {
            sucesso: true,
            novoSaldo: dados.saldoApos,
            lancamento: dados,
            mensagem: "Operação já processada anteriormente (idempotente).",
          };
        }

        // 2. Lê o saldo atual do estudante (com fallback no saldo local caso o documento ainda não exista)
        const userDoc = await transaction.get(userRef);
        let saldoAtual = saldoLocalAtual;
        if (userDoc.exists()) {
          const uData = userDoc.data();
          if (typeof uData.coins === "number") {
            saldoAtual = uData.coins;
          }
        }

        // 3. Valida débito (saldo não pode ficar negativo)
        if (delta < 0 && saldoAtual < valorAbsoluto) {
          throw new Error("Saldo insuficiente de moedas para esta transação.");
        }

        const novoSaldo = Math.max(0, saldoAtual + delta);

        // 4. Cria o lançamento contábil
        const novoLancamento: LancamentoExtrato = {
          id: chaveFinal,
          tipo,
          origem,
          valor: valorAbsoluto,
          saldoApos: novoSaldo,
          descricao: descricao || `${tipo === "ganho" ? "+" : "-"}${valorAbsoluto} moedas (${origem})`,
          refId: refId || "",
          idempotencyKey: chaveFinal,
          criadoEm: agoraIso,
        };

        // 5. Grava saldo e lançamento na mesma transação atômica
        transaction.set(userRef, { coins: novoSaldo, atualizadoEm: agoraIso }, { merge: true });
        transaction.set(lancamentoDocRef, {
          ...novoLancamento,
          timestampServidor: Timestamp.now(),
        });

        return {
          sucesso: true,
          novoSaldo,
          lancamento: novoLancamento,
        };
      });

      if (resultado.lancamento) {
        salvarExtratoLocal(uid, resultado.lancamento);
        atualizarSaldoLocal(resultado.novoSaldo);
      }
      return resultado;
    } catch (err: any) {
      console.warn("Aviso na transação Firestore do extrato, aplicando fallback:", err?.message || err);
    }
  }

  // Fallback transacional local com persistência segura
  const extratoLocal = carregarExtratoLocal(uid);
  const jaProcessado = extratoLocal.find((l) => l.idempotencyKey === chaveFinal);
  if (jaProcessado) {
    return {
      sucesso: true,
      novoSaldo: jaProcessado.saldoApos,
      lancamento: jaProcessado,
      mensagem: "Operação já processada (idempotente).",
    };
  }

  const saldoAtual = saldoLocalAtual;

  if (delta < 0 && saldoAtual < valorAbsoluto) {
    return {
      sucesso: false,
      novoSaldo: saldoAtual,
      mensagem: "Saldo insuficiente de moedas.",
    };
  }

  const novoSaldo = Math.max(0, saldoAtual + delta);
  const novoLancamento: LancamentoExtrato = {
    id: chaveFinal,
    tipo,
    origem,
    valor: valorAbsoluto,
    saldoApos: novoSaldo,
    descricao: descricao || `${tipo === "ganho" ? "+" : "-"}${valorAbsoluto} moedas (${origem})`,
    refId: refId || "",
    idempotencyKey: chaveFinal,
    criadoEm: agoraIso,
  };

  salvarExtratoLocal(uid, novoLancamento);
  atualizarSaldoLocal(novoSaldo);

  return {
    sucesso: true,
    novoSaldo,
    lancamento: novoLancamento,
  };
}

/**
 * Migração Idempotente: Insere o saldo inicial do estudante como lançamento "historico"
 * caso ainda não exista no extrato.
 */
export async function garantirSaldoInicialExtrato(uid: string, saldoAtual: number): Promise<void> {
  const chaveMigracao = `migracao_saldo_inicial_${uid}`;
  const extrato = await listarExtrato(uid, "todos", 500);
  if (extrato.some((l) => l.idempotencyKey === chaveMigracao || l.origem === "historico")) {
    return;
  }

  // Define timestamp anterior à transação mais antiga para preservar a ordem cronológica
  const timestampBase =
    extrato.length > 0
      ? Math.min(...extrato.map((e) => new Date(e.criadoEm).getTime())) - 1000
      : Date.now() - 3600000;
  const agoraIso = new Date(timestampBase).toISOString();

  const lancamentoInicial: LancamentoExtrato = {
    id: chaveMigracao,
    tipo: "ajuste",
    origem: "historico",
    valor: Math.max(0, saldoAtual),
    saldoApos: Math.max(0, saldoAtual),
    descricao: "Saldo inicial registrado para auditoria contábil",
    refId: "migracao_inicial",
    idempotencyKey: chaveMigracao,
    criadoEm: agoraIso,
  };

  salvarExtratoLocal(uid, lancamentoInicial);

  if (db) {
    try {
      const docRef = doc(db, "users", uid, "extrato", chaveMigracao);
      await runTransaction(db, async (t) => {
        const snap = await t.get(docRef);
        if (!snap.exists()) {
          t.set(docRef, {
            ...lancamentoInicial,
            timestampServidor: Timestamp.now(),
          });
        }
      });
    } catch (e) {
      console.warn("Aviso ao registrar saldo inicial no Firestore:", e);
    }
  }
}

/**
 * Consulta a lista de lançamentos do extrato com suporte a filtros e paginação.
 */
export async function listarExtrato(
  uid: string,
  filtroOrigem?: OrigemLancamento | "todos",
  limiteRegistros = 60
): Promise<LancamentoExtrato[]> {
  if (db) {
    try {
      const extratoColRef = collection(db, "users", uid, "extrato");
      let q = query(extratoColRef, orderBy("criadoEm", "desc"), limit(limiteRegistros));
      if (filtroOrigem && filtroOrigem !== "todos") {
        q = query(
          extratoColRef,
          where("origem", "==", filtroOrigem),
          orderBy("criadoEm", "desc"),
          limit(limiteRegistros)
        );
      }
      const snap = await getDocs(q);
      const lista: LancamentoExtrato[] = [];
      snap.forEach((d) => lista.push(d.data() as LancamentoExtrato));
      if (lista.length > 0) return lista;
    } catch (err) {
      console.warn("Aviso ao listar extrato do Firestore, lendo local:", err);
    }
  }

  const local = carregarExtratoLocal(uid);
  if (filtroOrigem && filtroOrigem !== "todos") {
    return local.filter((l) => l.origem === filtroOrigem);
  }
  return local.slice(0, limiteRegistros);
}

/**
 * Função de auditoria: Recalcula o saldo a partir dos lançamentos e aponta divergências.
 * Trata tanto 'gasto', 'saida' e 'debito' como deduções estritas de moedas.
 * O saldo inicial de origem 'historico' sempre estabelece a linha de base.
 */
export function auditarSaldoContabil(saldoInformado: number, extrato: LancamentoExtrato[]): {
  saldoRecalculado: number;
  divergencia: number;
  consistente: boolean;
} {
  const ordenado = [...extrato].sort((a, b) => {
    if (a.origem === "historico" && b.origem !== "historico") return -1;
    if (b.origem === "historico" && a.origem !== "historico") return 1;
    return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
  });

  let saldo = 0;
  for (const l of ordenado) {
    const valor = Math.abs(l.valor);
    if (l.origem === "historico") {
      saldo = valor;
    } else if (l.tipo === "ganho" || l.tipo === "cashback") {
      saldo += valor;
    } else if (l.tipo === "gasto" || l.tipo === "saida" || (l.tipo as string) === "debito") {
      saldo = Math.max(0, saldo - valor);
    }
  }

  const divergencia = saldoInformado - saldo;
  return {
    saldoRecalculado: saldo,
    divergencia,
    consistente: Math.abs(divergencia) === 0,
  };
}

/**
 * Consulta facilitadora do extrato contábil
 */
export async function carregarExtrato(
  uid: string,
  limiteRegistros = 60
): Promise<LancamentoExtrato[]> {
  return listarExtrato(uid, "todos", limiteRegistros);
}

/**
 * Executa auditoria completa do extrato do usuário
 */
export async function auditarExtrato(
  uid: string,
  saldoAtual: number
): Promise<{ valido: boolean; diferenca: number }> {
  const extrato = await listarExtrato(uid, "todos", 200);
  const audit = auditarSaldoContabil(saldoAtual, extrato);
  return {
    valido: audit.consistente,
    diferenca: audit.divergencia,
  };
}
