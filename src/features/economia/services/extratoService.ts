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

export type TipoLancamento = "ganho" | "gasto" | "cashback" | "ajuste";

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
  | "admin"
  | "historico";

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

/**
 * Carrega o extrato salvo localmente no navegador (fallback offline)
 */
export function carregarExtratoLocal(uid: string): LancamentoExtrato[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_EXTRATO_LOCAL}_${uid}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Aviso ao ler extrato local:", err);
  }
  return [];
}

/**
 * Salva lançamentos do extrato localmente para suporte offline
 */
function salvarExtratoLocal(uid: string, lancamento: LancamentoExtrato) {
  try {
    const lista = carregarExtratoLocal(uid);
    // Garante idempotência local por idempotencyKey
    if (lista.some((l) => l.idempotencyKey === lancamento.idempotencyKey)) {
      return;
    }
    const atualizado = [lancamento, ...lista];
    localStorage.setItem(`${STORAGE_KEY_EXTRATO_LOCAL}_${uid}`, JSON.stringify(atualizado));
  } catch (err) {
    console.warn("Aviso ao salvar extrato local:", err);
  }
}

/**
 * Executa movimentação atômica e idempotente no livro-razão de moedas.
 * @param uid Identificador do estudante
 * @param delta Quantidade de moedas (+ para entrada, - para saída)
 * @param origem Motivo do lançamento
 * @param refId Identificador de referência externa (ex: id da obra, id do item da loja)
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
  const tipo: TipoLancamento =
    origem === "fidelidade"
      ? "cashback"
      : delta > 0
      ? "ganho"
      : delta < 0
      ? "gasto"
      : "ajuste";

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

        // 2. Lê o saldo atual do estudante
        const userDoc = await transaction.get(userRef);
        let saldoAtual = 100;
        if (userDoc.exists()) {
          const uData = userDoc.data();
          saldoAtual = typeof uData.coins === "number" ? uData.coins : 100;
        }

        // 3. Valida débito (saldo não pode ficar negativo)
        if (delta < 0 && saldoAtual < valorAbsoluto) {
          throw new Error("Saldo insuficiente de moedas para esta transação.");
        }

        const novoSaldo = saldoAtual + delta;

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
      }
      return resultado;
    } catch (err: any) {
      console.warn("Aviso na transação Firestore do extrato, aplicando fallback:", err.message);
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

  let saldoAtual = 100;
  try {
    const userRaw = localStorage.getItem("brain_studio_user_profile");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (typeof u.coins === "number") saldoAtual = u.coins;
    }
  } catch {}

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

  try {
    const userRaw = localStorage.getItem("brain_studio_user_profile");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      u.coins = novoSaldo;
      localStorage.setItem("brain_studio_user_profile", JSON.stringify(u));
    }
  } catch {}

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
  const extrato = carregarExtratoLocal(uid);
  if (extrato.some((l) => l.idempotencyKey === chaveMigracao || l.origem === "historico")) {
    return;
  }

  const agoraIso = new Date().toISOString();
  const lancamentoInicial: LancamentoExtrato = {
    id: chaveMigracao,
    tipo: "ajuste",
    origem: "historico",
    valor: saldoAtual,
    saldoApos: saldoAtual,
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
  limiteRegistros = 50
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
 */
export function auditarSaldoContabil(saldoInformado: number, extrato: LancamentoExtrato[]): {
  saldoRecalculado: number;
  divergencia: number;
  consistente: boolean;
} {
  const ordenado = [...extrato].sort(
    (a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
  );

  let saldo = 0;
  for (const l of ordenado) {
    if (l.origem === "historico") {
      saldo = l.valor;
    } else if (l.tipo === "ganho" || l.tipo === "cashback") {
      saldo += l.valor;
    } else if (l.tipo === "gasto") {
      saldo = Math.max(0, saldo - l.valor);
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
  limiteRegistros = 50
): Promise<LancamentoExtrato[]> {
  return listarExtrato(uid, "todos", limiteRegistros);
}

/**
 * Executa auditoria completa do extrato do usuário
 */
export async function auditarExtrato(
  uid: string,
  saldoAtual: number
): Promise<{ valido: boolean; diferenca: number; saldoRecalculado: number }> {
  const extrato = await listarExtrato(uid, "todos", 200);
  const audit = auditarSaldoContabil(saldoAtual, extrato);
  return {
    valido: audit.consistente,
    diferenca: audit.divergencia,
    saldoRecalculado: audit.saldoRecalculado,
  };
}

