/**
 * Brain Studio - Serviço Central de Notificações Unificadas (Bloco 4)
 * Persistência: Firestore em users/{uid}/notificacoes/{id} + Fallback LocalStorage
 * Push PWA (Service Worker) + Local Notifications Offline (Capacitor)
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { LocalNotifications } from "@capacitor/local-notifications";

export type TipoNotificacao =
  | "prazo"
  | "conquista"
  | "equipe"
  | "pet"
  | "ofensiva"
  | "resumo_semanal"
  | "sistema";

export interface NotificationItem {
  id: string;
  userId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string; // ISO 8601
  linkTab?: "estudar" | "inicio" | "jogo" | "perfil" | "lumina";
  linkSubView?: string;
  refId?: string;
}

export interface NotificationSettings {
  silenciarTudo: boolean; // "Não Perturbe"
  prazo24h: boolean;
  prazo1h: boolean;
  conquistas: boolean;
  equipe: boolean;
  petEvolucao: boolean;
  lembreteOfensiva: boolean;
  horarioOfensiva: string; // "20:00"
  resumoSemanal: boolean;
  pushAtivo: boolean;
}

export const CONFIG_NOTIFICACOES_PADRAO: NotificationSettings = {
  silenciarTudo: false,
  prazo24h: true,
  prazo1h: true,
  conquistas: true,
  equipe: true,
  petEvolucao: true,
  lembreteOfensiva: true,
  horarioOfensiva: "20:00",
  resumoSemanal: true,
  pushAtivo: false,
};

const STORAGE_PREFS_KEY = "brain_studio_notif_settings_v2";
const STORAGE_ITEMS_KEY = "brain_studio_notif_feed_v2";

/**
 * Lê configurações de notificação do usuário
 */
export function obterConfiguracoesNotificacao(uid: string): NotificationSettings {
  if (typeof window === "undefined") return CONFIG_NOTIFICACOES_PADRAO;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFS_KEY}_${uid}`);
    if (raw) {
      return { ...CONFIG_NOTIFICACOES_PADRAO, ...JSON.parse(raw) };
    }
  } catch {}
  return CONFIG_NOTIFICACOES_PADRAO;
}

/**
 * Salva configurações de notificação do usuário
 */
export async function salvarConfiguracoesNotificacao(
  uid: string,
  settings: NotificationSettings
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFS_KEY}_${uid}`, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("brainstudio:notif-settings-changed", { detail: settings }));

    if (db) {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { notificationSettings: settings, atualizadoEm: new Date().toISOString() }, { merge: true });
    }

    // Se lembrete de ofensiva estiver ativo, agenda notificação local offline
    if (settings.lembreteOfensiva && !settings.silenciarTudo) {
      await agendarLembreteOfensivaOffline(settings.horarioOfensiva);
    }
  } catch (err) {
    console.warn("Aviso ao salvar configurações de notificação:", err);
  }
}

/**
 * Agenda notificação local diária offline via Capacitor LocalNotifications
 */
export async function agendarLembreteOfensivaOffline(horarioStr: string): Promise<void> {
  try {
    const [hora, min] = horarioStr.split(":").map(Number);
    if (isNaN(hora) || isNaN(min)) return;

    // Verificar permissão no dispositivo nativo
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }

    // Cancelar agendamento anterior de ofensiva (ID fixo: 1001)
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });

    const agora = new Date();
    const dataAgendada = new Date();
    dataAgendada.setHours(hora, min, 0, 0);

    if (dataAgendada.getTime() <= agora.getTime()) {
      dataAgendada.setDate(dataAgendada.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: "🔥 Não perca sua ofensiva no Brain Studio!",
          body: "Complete pelo menos um ciclo de estudo ou revisão hoje para manter seus dias de sequência.",
          schedule: { at: dataAgendada, repeats: true, every: "day" },
          smallIcon: "res://drawable/ic_stat_icon",
          sound: "beep.wav",
        },
      ],
    });
  } catch (err) {
    // Silencia em ambiente web padrão (não nativo)
  }
}

/**
 * Lê itens de notificação locais
 */
export function carregarNotificacoesLocais(uid: string): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_ITEMS_KEY}_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Salva itens de notificação locais
 */
function salvarNotificacoesLocais(uid: string, items: NotificationItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_ITEMS_KEY}_${uid}`, JSON.stringify(items));
  } catch {}
}

/**
 * Escuta o feed de notificações em tempo real (Firestore + fallback local)
 */
export function escutarNotificacoes(
  uid: string,
  onUpdate: (items: NotificationItem[]) => void
): () => void {
  // Notifica imediatamente com dados locais para UX instantânea
  const locaisIniciais = carregarNotificacoesLocais(uid);
  onUpdate(locaisIniciais);

  if (!db) {
    return () => {};
  }

  try {
    const notifsCol = collection(db, "users", uid, "notificacoes");
    const q = query(notifsCol, orderBy("criadoEm", "desc"), limit(60));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: NotificationItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as NotificationItem);
        });
        salvarNotificacoesLocais(uid, list);
        onUpdate(list);
      },
      (err) => {
        console.warn("Aviso ao sincronizar notificações do Firestore:", err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Aviso ao iniciar listener de notificações:", err);
    return () => {};
  }
}

/**
 * Cria uma nova notificação unificada com checagem de preferências
 */
export async function criarNotificacao(
  uid: string,
  notif: Omit<NotificationItem, "id" | "criadoEm" | "lida">
): Promise<NotificationItem | null> {
  const prefs = obterConfiguracoesNotificacao(uid);
  if (prefs.silenciarTudo) return null;

  // Checagem de tipo desativado pelo estudante
  if (notif.tipo === "conquista" && !prefs.conquistas) return null;
  if (notif.tipo === "equipe" && !prefs.equipe) return null;
  if (notif.tipo === "pet" && !prefs.petEvolucao) return null;
  if (notif.tipo === "ofensiva" && !prefs.lembreteOfensiva) return null;
  if (notif.tipo === "resumo_semanal" && !prefs.resumoSemanal) return null;

  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const agoraIso = new Date().toISOString();

  const novoItem: NotificationItem = {
    ...notif,
    id,
    criadoEm: agoraIso,
    lida: false,
  };

  // Salva localmente
  const locais = carregarNotificacoesLocais(uid);
  const atualizado = [novoItem, ...locais];
  salvarNotificacoesLocais(uid, atualizado);

  // Persiste no Firestore em users/{uid}/notificacoes/{id}
  if (db) {
    try {
      const docRef = doc(db, "users", uid, "notificacoes", id);
      await setDoc(docRef, {
        ...novoItem,
        timestampServidor: Timestamp.now(),
      });
    } catch (err) {
      console.warn("Aviso ao salvar notificação no Firestore:", err);
    }
  }

  // Notificação do navegador no dispositivo se permitido
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(novoItem.titulo, {
        body: novoItem.mensagem,
        icon: "/pwa-192x192.png",
      });
    } catch {}
  }

  return novoItem;
}

/**
 * Marca uma notificação individual como lida
 */
export async function marcarNotificacaoComoLida(uid: string, notifId: string): Promise<void> {
  const locais = carregarNotificacoesLocais(uid);
  const atualizado = locais.map((n) => (n.id === notifId ? { ...n, lida: true } : n));
  salvarNotificacoesLocais(uid, atualizado);

  if (db) {
    try {
      const docRef = doc(db, "users", uid, "notificacoes", notifId);
      await updateDoc(docRef, { lida: true });
    } catch (err) {
      console.warn("Aviso ao marcar notificação como lida no Firestore:", err);
    }
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function marcarTodasComoLidas(uid: string): Promise<void> {
  const locais = carregarNotificacoesLocais(uid);
  const atualizado = locais.map((n) => ({ ...n, lida: true }));
  salvarNotificacoesLocais(uid, atualizado);

  if (db) {
    try {
      const notifsCol = collection(db, "users", uid, "notificacoes");
      const q = query(notifsCol, where("lida", "==", false));
      const snap = await getDocs(q);
      const updates = snap.docs.map((d) => updateDoc(d.ref, { lida: true }));
      await Promise.all(updates);
    } catch (err) {
      console.warn("Aviso ao marcar todas notificações como lidas no Firestore:", err);
    }
  }
}

/**
 * Limpa/exclui notificações já lidas
 */
export async function limparNotificacoesLidas(uid: string): Promise<void> {
  const locais = carregarNotificacoesLocais(uid);
  const lidas = locais.filter((n) => n.lida);
  const restantes = locais.filter((n) => !n.lida);
  salvarNotificacoesLocais(uid, restantes);

  if (db) {
    try {
      const deletes = lidas.map((n) => deleteDoc(doc(db, "users", uid, "notificacoes", n.id)));
      await Promise.all(deletes);
    } catch (err) {
      console.warn("Aviso ao limpar notificações lidas no Firestore:", err);
    }
  }
}
