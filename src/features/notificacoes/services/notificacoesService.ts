/**
 * Brain Studio - Serviço Central de Notificações Unificadas (Bloco 4)
 * Armazenamento: users/{uid}/notificacoes/{id} no Firestore com fallback offline em localStorage/IndexedDB.
 * Tipos: sistema | missao | bau | agenda | lembrete | conexao | suporte | assinatura | novidade
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export type TipoNotificacao =
  | "sistema"
  | "missao"
  | "bau"
  | "agenda"
  | "lembrete"
  | "conexao"
  | "suporte"
  | "assinatura"
  | "novidade";

export interface NotificacaoItem {
  id: string;
  titulo: string;
  corpo: string;
  tipo: TipoNotificacao;
  rotaDestino?: string;
  lida: boolean;
  arquivada: boolean;
  criadoEm: string; // ISO
  recebidaEm: string; // ISO
}

const STORAGE_KEY_PREFIX = "brain_studio_notifs_v1";

function getLocalStore(uid: string): NotificacaoItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${uid}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Aviso ao ler notificações locais:", err);
  }
  return [];
}

function setLocalStore(uid: string, items: NotificacaoItem[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    // Teto técnico de segurança de 10.000 itens
    const sliced = items.slice(0, 10000);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_${uid}`, JSON.stringify(sliced));
    window.dispatchEvent(new CustomEvent("brain_studio_notificacoes_updated"));
  } catch (err) {
    console.warn("Aviso ao salvar notificações locais:", err);
  }
}

/**
 * Cria ou registra uma notificação (localmente e no Firestore).
 */
export async function registrarNotificacao(
  uid: string,
  dados: {
    titulo: string;
    corpo: string;
    tipo?: TipoNotificacao;
    rotaDestino?: string;
  }
): Promise<NotificacaoItem> {
  const agora = new Date().toISOString();
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const item: NotificacaoItem = {
    id,
    titulo: dados.titulo,
    corpo: dados.corpo,
    tipo: dados.tipo || "sistema",
    rotaDestino: dados.rotaDestino || "",
    lida: false,
    arquivada: false,
    criadoEm: agora,
    recebidaEm: agora,
  };

  // Salva no armazenamento local imediato
  const locais = getLocalStore(uid);
  const atualizados = [item, ...locais];
  setLocalStore(uid, atualizados);

  // Grava no Firestore se disponível e não for teste sintético
  if (db && !uid.startsWith("test_user_")) {
    try {
      const docRef = doc(db, "users", uid, "notificacoes", id);
      await setDoc(docRef, {
        ...item,
        timestampServidor: Timestamp.now(),
      });
    } catch (err) {
      console.warn("Aviso ao persistir notificação no Firestore:", err);
    }
  }

  return item;
}

/**
 * Consulta a lista completa de notificações de um usuário.
 */
export async function listarNotificacoes(
  uid: string,
  incluirArquivadas = false
): Promise<NotificacaoItem[]> {
  let items = getLocalStore(uid);

  // Tenta sincronizar do Firestore
  if (db && !uid.startsWith("test_user_")) {
    try {
      const colRef = collection(db, "users", uid, "notificacoes");
      const q = query(colRef, orderBy("recebidaEm", "desc"), limit(200));
      const snap = await getDocs(q);
      const remotas: NotificacaoItem[] = [];
      snap.forEach((d) => remotas.push(d.data() as NotificacaoItem));
      if (remotas.length > 0) {
        // Merge inteligente preservando novidades locais
        const remotasMap = new Map(remotas.map((r) => [r.id, r]));
        for (const loc of items) {
          if (!remotasMap.has(loc.id)) {
            remotas.push(loc);
          }
        }
        items = remotas.sort(
          (a, b) => new Date(b.recebidaEm).getTime() - new Date(a.recebidaEm).getTime()
        );
        setLocalStore(uid, items);
      }
    } catch (err) {
      console.warn("Aviso ao ler notificações do Firestore, mantendo locais:", err);
    }
  }

  // Semente inicial educativa caso o usuário ainda não possua notificações
  if (items.length === 0) {
    const sementes: NotificacaoItem[] = [
      {
        id: "seed_bem_vindo",
        titulo: "Boas-vindas ao Brain Studio!",
        corpo: "Sua plataforma de estudos gamificada está pronta. Acompanhe seus prazos, missões e cidade do saber.",
        tipo: "sistema",
        rotaDestino: "inicio",
        lida: false,
        arquivada: false,
        criadoEm: new Date(Date.now() - 3600000).toISOString(),
        recebidaEm: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "seed_missao",
        titulo: "Missão Diária Disponível",
        corpo: "Revise 10 flashcards ou complete um simulado 10Q para garantir seu bônus de moedas de hoje.",
        tipo: "missao",
        rotaDestino: "estudar",
        lida: false,
        arquivada: false,
        criadoEm: new Date(Date.now() - 1800000).toISOString(),
        recebidaEm: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
    setLocalStore(uid, sementes);
    items = sementes;
  }

  if (!incluirArquivadas) {
    return items.filter((n) => !n.arquivada);
  }
  return items;
}

/**
 * Marca uma notificação individual como lida.
 */
export async function marcarComoLida(uid: string, id: string): Promise<void> {
  const locais = getLocalStore(uid);
  const atualizados = locais.map((n) => (n.id === id ? { ...n, lida: true } : n));
  setLocalStore(uid, atualizados);

  if (db && !uid.startsWith("test_user_")) {
    try {
      const docRef = doc(db, "users", uid, "notificacoes", id);
      await updateDoc(docRef, { lida: true });
    } catch (err) {
      console.warn("Aviso ao marcar como lida no Firestore:", err);
    }
  }
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function marcarTodasComoLidas(uid: string): Promise<void> {
  const locais = getLocalStore(uid);
  const atualizados = locais.map((n) => ({ ...n, lida: true }));
  setLocalStore(uid, atualizados);

  if (db && !uid.startsWith("test_user_")) {
    try {
      // Atualiza as primeiras 50 não lidas no Firestore
      const colRef = collection(db, "users", uid, "notificacoes");
      const snap = await getDocs(colRef);
      snap.forEach((d) => {
        if (!d.data().lida) {
          updateDoc(d.ref, { lida: true }).catch(() => {});
        }
      });
    } catch (err) {
      console.warn("Aviso ao marcar todas como lidas no Firestore:", err);
    }
  }
}

/**
 * Arquiva uma notificação.
 */
export async function arquivarNotificacao(uid: string, id: string): Promise<void> {
  const locais = getLocalStore(uid);
  const atualizados = locais.map((n) => (n.id === id ? { ...n, arquivada: true } : n));
  setLocalStore(uid, atualizados);

  if (db && !uid.startsWith("test_user_")) {
    try {
      const docRef = doc(db, "users", uid, "notificacoes", id);
      await updateDoc(docRef, { arquivada: true });
    } catch (err) {
      console.warn("Aviso ao arquivar notificação no Firestore:", err);
    }
  }
}

/**
 * Exclui permanentemente uma notificação a pedido do usuário.
 */
export async function excluirNotificacao(uid: string, id: string): Promise<void> {
  const locais = getLocalStore(uid);
  const atualizados = locais.filter((n) => n.id !== id);
  setLocalStore(uid, atualizados);

  if (db && !uid.startsWith("test_user_")) {
    try {
      const docRef = doc(db, "users", uid, "notificacoes", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Aviso ao excluir notificação no Firestore:", err);
    }
  }
}

/**
 * Conta quantas notificações não lidas e não arquivadas existem.
 */
export function contarNaoLidas(uid: string): number {
  const items = getLocalStore(uid);
  return items.filter((n) => !n.lida && !n.arquivada).length;
}
