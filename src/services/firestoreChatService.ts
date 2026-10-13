import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface DirectMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: number;
  timeFormatted?: string;
  status: "sent" | "delivered" | "read";
  readAt?: number;
}

export interface TeamMessageItem {
  id: string;
  equipeId: string;
  autorId: string;
  autorName: string;
  conteudo: string;
  createdAt: number;
  timeFormatted?: string;
  status?: "sent" | "delivered" | "read";
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * Gera um ID de chat determinístico baseado nos UIDs dos dois participantes
 */
export function getDirectChatId(uid1: string, uid2: string): string {
  const clean1 = (uid1 || "user_a").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const clean2 = (uid2 || "user_b").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return [clean1, clean2].sort().join("__");
}

function formatMsgTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "agora";
  }
}

/**
 * Serviço de Chat com Firestore: Mensagens Privadas (1-on-1) e Equipes
 */
class FirestoreChatService {
  /**
   * Escuta mensagens de chat 1-a-1 em tempo real com Firestore
   */
  subscribeDirectMessages(
    currentUserId: string,
    targetUserId: string,
    onUpdate: (messages: DirectMessageItem[]) => void
  ): () => void {
    const chatId = getDirectChatId(currentUserId, targetUserId);
    const messagesCol = collection(db, "directChats", chatId, "messages");
    const q = query(messagesCol, orderBy("timestamp", "asc"), limit(120));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: DirectMessageItem[] = [];
        const unreadToMark: string[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const item: DirectMessageItem = {
            id: docSnap.id,
            senderId: data.senderId,
            senderName: data.senderName || "Estudante",
            receiverId: data.receiverId,
            text: data.text || "",
            timestamp: data.timestamp || Date.now(),
            timeFormatted: data.timeFormatted || formatMsgTime(data.timestamp || Date.now()),
            status: data.status || "sent",
            readAt: data.readAt,
          };
          msgs.push(item);

          // Se a mensagem for destinada ao usuário atual e ainda não tiver sido lida
          if (data.receiverId === currentUserId && data.status !== "read") {
            unreadToMark.push(docSnap.id);
          }
        });

        onUpdate(msgs);

        // Marca automaticamente as mensagens recebidas como lidas ("Visto" com double check azul)
        if (unreadToMark.length > 0) {
          this.markDirectMessagesAsRead(chatId, unreadToMark);
        }
      },
      (err) => {
        console.warn("[Firestore DirectChat] Erro na subscrição:", err);
      }
    );
  }

  /**
   * Envia uma mensagem 1-a-1 no Firestore
   */
  async sendDirectMessage(params: {
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
  }): Promise<DirectMessageItem> {
    const { senderId, senderName, receiverId, text } = params;
    const chatId = getDirectChatId(senderId, receiverId);
    const messagesCol = collection(db, "directChats", chatId, "messages");
    const now = Date.now();

    const newMsgData = {
      senderId,
      senderName,
      receiverId,
      text: text.trim(),
      timestamp: now,
      timeFormatted: formatMsgTime(now),
      status: "sent" as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(messagesCol, newMsgData);

    // Atualiza metadados do chat
    try {
      const chatDocRef = doc(db, "directChats", chatId);
      await setDoc(
        chatDocRef,
        {
          id: chatId,
          participants: [senderId, receiverId],
          lastMessage: text.trim(),
          lastSenderId: senderId,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Erro ao atualizar cabeçalho do chat:", e);
    }

    return {
      id: docRef.id,
      ...newMsgData,
    };
  }

  /**
   * Marca mensagens como visualizadas ("Visto" - status: 'read')
   */
  async markDirectMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      const now = Date.now();
      for (const msgId of messageIds) {
        const msgRef = doc(db, "directChats", chatId, "messages", msgId);
        await updateDoc(msgRef, {
          status: "read",
          readAt: now,
        });
      }
    } catch (e) {
      console.warn("Erro ao marcar mensagens como lidas:", e);
    }
  }

  /**
   * Atualiza status de digitação ("Digitando...")
   */
  async setTypingStatus(
    chatId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const typingDoc = doc(db, "directChats", chatId, "typing", userId);
      await setDoc(
        typingDoc,
        {
          userId,
          userName,
          isTyping,
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      // Ignora pequenos erros de digitação
    }
  }

  /**
   * Escuta indicador de digitação da conversa 1-a-1
   */
  subscribeTypingStatus(
    chatId: string,
    currentUserId: string,
    onTypingChange: (isTyping: boolean, userName?: string) => void
  ): () => void {
    const typingCol = collection(db, "directChats", chatId, "typing");

    return onSnapshot(
      typingCol,
      (snapshot) => {
        let otherUserTyping = false;
        let typerName = "";
        const now = Date.now();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TypingUser;
          // Ignora o próprio usuário e verifica se o evento é recente (últimos 3.5 segundos)
          if (data.userId !== currentUserId && data.isTyping && now - (data.timestamp || 0) < 3500) {
            otherUserTyping = true;
            typerName = data.userName;
          }
        });

        onTypingChange(otherUserTyping, typerName);
      },
      () => {
        onTypingChange(false);
      }
    );
  }

  // ==========================================
  // EQUIPES (Chat em Grupo Persistente)
  // ==========================================

  /**
   * Escuta mensagens da equipe em tempo real com Firestore
   */
  subscribeTeamMessages(
    teamId: string,
    onUpdate: (messages: TeamMessageItem[]) => void
  ): () => void {
    const messagesCol = collection(db, "equipes", teamId, "mensagens");
    const q = query(messagesCol, orderBy("createdAt", "asc"), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: TeamMessageItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          msgs.push({
            id: docSnap.id,
            equipeId: teamId,
            autorId: data.autorId || "user",
            autorName: data.autorName || "Estudante",
            conteudo: data.conteudo || "",
            createdAt: data.createdAt || Date.now(),
            timeFormatted: data.timeFormatted || formatMsgTime(data.createdAt || Date.now()),
            status: data.status || "delivered",
          });
        });
        onUpdate(msgs);
      },
      (err) => {
        console.warn("[Firestore TeamChat] Erro na subscrição:", err);
      }
    );
  }

  /**
   * Envia mensagem no chat da equipe
   */
  async sendTeamMessage(params: {
    teamId: string;
    autorId: string;
    autorName: string;
    conteudo: string;
  }): Promise<void> {
    const { teamId, autorId, autorName, conteudo } = params;
    const messagesCol = collection(db, "equipes", teamId, "mensagens");
    const now = Date.now();

    await addDoc(messagesCol, {
      equipeId: teamId,
      autorId,
      autorName,
      conteudo: conteudo.trim(),
      createdAt: now,
      timeFormatted: formatMsgTime(now),
      status: "delivered",
      serverTime: serverTimestamp(),
    });
  }

  /**
   * Atualiza status de digitação na equipe
   */
  async setTeamTypingStatus(
    teamId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const typingDoc = doc(db, "equipes", teamId, "typing", userId);
      await setDoc(
        typingDoc,
        {
          userId,
          userName,
          isTyping,
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch {}
  }

  /**
   * Escuta digitando dos membros da equipe
   */
  subscribeTeamTypingStatus(
    teamId: string,
    currentUserId: string,
    onTypingChange: (typingUserNames: string[]) => void
  ): () => void {
    const typingCol = collection(db, "equipes", teamId, "typing");

    return onSnapshot(
      typingCol,
      (snapshot) => {
        const typers: string[] = [];
        const now = Date.now();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TypingUser;
          if (data.userId !== currentUserId && data.isTyping && now - (data.timestamp || 0) < 3500) {
            typers.push(data.userName);
          }
        });
        onTypingChange(typers);
      },
      () => {
        onTypingChange([]);
      }
    );
  }
}

export const firestoreChatService = new FirestoreChatService();
