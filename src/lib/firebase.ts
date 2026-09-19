import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "total-melody-g6rpq",
  appId: "1:379369360491:web:a6a3e840e9a75048f1752e",
  apiKey: "AIzaSyCmYi4PSYoQ9pNF3Zem-Z-ak5Pt8RAAnTw",
  authDomain: "total-melody-g6rpq.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-brainstudio-76abf6e8-4f73-4011-91a7-7c8e5a183fec",
  storageBucket: "total-melody-g6rpq.firebasestorage.app",
  messagingSenderId: "379369360491",
  oAuthClientId: "379369360491-r02b111vibkrjdeq848kcp253rct7m9g.apps.googleusercontent.com",
};

// Initialize App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// ==========================================
// 1. PRESENCE (Heartbeat real-time)
// ==========================================
export interface ActiveUserPresence {
  uid: string;
  nome: string;
  matricula: string;
  curso: string;
  campus: string;
  avatar?: string;
  petName?: string;
  status: "disponivel" | "em_chamada" | "estudando";
  lastSeen: number; // Unix timestamp in ms
}

/**
 * Updates user presence heartbeat. Must be called every ~20s.
 */
export async function sendPresenceHeartbeat(userData: {
  uid: string;
  nome: string;
  matricula?: string;
  curso?: string;
  campus?: string;
  avatar?: string;
  petName?: string;
  status?: "disponivel" | "em_chamada" | "estudando";
}) {
  try {
    const presenceRef = doc(db, "presencas", userData.uid);
    await setDoc(
      presenceRef,
      {
        uid: userData.uid,
        nome: userData.nome || "Colega IFES",
        matricula: userData.matricula || "",
        curso: userData.curso || "Ensino Técnico / Superior",
        campus: userData.campus || "IFES",
        avatar: userData.avatar || "",
        petName: userData.petName || "",
        status: userData.status || "disponivel",
        lastSeen: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[Firebase Presence] Heartbeat error:", err);
  }
}

/**
 * Subscribes to currently active online users (seen in the last 40 seconds).
 */
export function subscribeOnlineUsers(
  currentUserId: string,
  onUsersUpdated: (users: ActiveUserPresence[]) => void
) {
  const presencasRef = collection(db, "presencas");

  return onSnapshot(
    presencasRef,
    (snapshot) => {
      const now = Date.now();
      const cutoff = now - 45000; // 45 seconds threshold
      const active: ActiveUserPresence[] = [];

      snapshot.forEach((d) => {
        const data = d.data() as ActiveUserPresence;
        // Check if alive and not self
        if (data.uid !== currentUserId && data.lastSeen && data.lastSeen >= cutoff) {
          active.push(data);
        }
      });

      // Sort by latest seen
      active.sort((a, b) => b.lastSeen - a.lastSeen);
      onUsersUpdated(active);
    },
    (err) => {
      console.warn("[Firebase Presence] Subscription error:", err);
    }
  );
}

// ==========================================
// 2. WEBRTC SIGNALING (1:1 & Group Calls via Firestore)
// ==========================================
export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerMatricula?: string;
  targetUserId?: string; // If 1:1 call
  type: "individual" | "grupo";
  mediaType: "video" | "audio";
  status: "calling" | "active" | "rejected" | "ended";
  roomTitle?: string;
  participants: string[]; // List of user IDs
  participantNames?: Record<string, string>;
  createdAt: number;
  // Signal payloads for 1:1
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
}

export interface SignalingCandidate {
  senderId: string;
  targetId?: string;
  candidate: RTCIceCandidateInit;
  createdAt: number;
}

/**
 * Initiates an outgoing call
 */
export async function createCallSession(params: {
  callerId: string;
  callerName: string;
  callerMatricula?: string;
  targetUserId?: string;
  type: "individual" | "grupo";
  mediaType: "video" | "audio";
  roomTitle?: string;
  offer?: RTCSessionDescriptionInit;
}): Promise<string> {
  const callsRef = collection(db, "chamadas");
  const newCallDoc = doc(callsRef);
  const callId = newCallDoc.id;

  const participants = [params.callerId];
  if (params.targetUserId && params.type === "individual") {
    participants.push(params.targetUserId);
  }

  const callData: CallSession = {
    id: callId,
    callerId: params.callerId,
    callerName: params.callerName,
    callerMatricula: params.callerMatricula,
    targetUserId: params.targetUserId,
    type: params.type,
    mediaType: params.mediaType,
    status: "calling",
    roomTitle: params.roomTitle || `Sala de Estudos (${params.type === "grupo" ? "Grupo" : "Direta"})`,
    participants,
    participantNames: {
      [params.callerId]: params.callerName,
    },
    createdAt: Date.now(),
  };

  if (params.offer) {
    callData.offer = params.offer;
  }

  await setDoc(newCallDoc, callData);
  return callId;
}

/**
 * Listens for incoming calls directed to the current user
 */
export function subscribeIncomingCalls(
  currentUserId: string,
  onIncomingCall: (call: CallSession | null) => void
) {
  const callsRef = collection(db, "chamadas");
  const q = query(
    callsRef,
    where("targetUserId", "==", currentUserId),
    where("status", "==", "calling"),
    limit(5)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const now = Date.now();
      let activeIncoming: CallSession | null = null;

      snapshot.forEach((d) => {
        const data = d.data() as CallSession;
        // Ignore calls older than 60s
        if (now - data.createdAt < 60000) {
          activeIncoming = data;
        }
      });

      onIncomingCall(activeIncoming);
    },
    (err) => {
      console.warn("[Firebase Call] Incoming listen error:", err);
    }
  );
}

/**
 * Answer or reject a call
 */
export async function updateCallStatus(
  callId: string,
  status: "active" | "rejected" | "ended",
  extraData?: {
    answer?: RTCSessionDescriptionInit;
    participantId?: string;
    participantName?: string;
  }
) {
  try {
    const callRef = doc(db, "chamadas", callId);
    const updatePayload: any = { status };

    if (extraData?.answer) {
      updatePayload.answer = extraData.answer;
    }

    if (extraData?.participantId) {
      updatePayload.participants = arrayUnion(extraData.participantId);
      if (extraData.participantName) {
        updatePayload[`participantNames.${extraData.participantId}`] = extraData.participantName;
      }
    }

    await updateDoc(callRef, updatePayload);
  } catch (err) {
    console.warn("[Firebase Call] Status update error:", err);
  }
}

/**
 * Listen to a specific active call's changes (e.g. answer received, participants, ended)
 */
export function subscribeCallSession(
  callId: string,
  onUpdate: (call: CallSession | null) => void
) {
  const callRef = doc(db, "chamadas", callId);
  return onSnapshot(callRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as CallSession);
    } else {
      onUpdate(null);
    }
  });
}

/**
 * Send ICE candidate to call subcollection
 */
export async function addCallIceCandidate(
  callId: string,
  candidate: RTCIceCandidateInit,
  senderId: string,
  targetId?: string
) {
  try {
    const candidatesCol = collection(db, "chamadas", callId, "candidatos");
    await addDoc(candidatesCol, {
      senderId,
      targetId: targetId || null,
      candidate: JSON.parse(JSON.stringify(candidate)),
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn("[Firebase Call] Add ICE error:", err);
  }
}

/**
 * Listen to ICE candidates from peers
 */
export function subscribeCallIceCandidates(
  callId: string,
  currentUserId: string,
  onCandidate: (candidate: RTCIceCandidateInit, senderId: string) => void
) {
  const candidatesCol = collection(db, "chamadas", callId, "candidatos");
  return onSnapshot(candidatesCol, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        if (data.senderId !== currentUserId) {
          if (!data.targetId || data.targetId === currentUserId) {
            onCandidate(data.candidate, data.senderId);
          }
        }
      }
    });
  });
}

// ==========================================
// 3. UNIFIED NOTIFICATIONS
// ==========================================
export interface AppNotification {
  id: string;
  userId: string;
  origem: "app" | "qacademico" | "ava";
  titulo: string;
  mensagem: string;
  lida: boolean;
  linkTab?: string;
  tipo?: "chamada_perdida" | "nota" | "tarefa" | "equipe" | "sistema";
  createdAt: number;
}

export async function createNotification(notif: Omit<AppNotification, "id" | "createdAt" | "lida">) {
  try {
    const notifsCol = collection(db, "notificacoes");
    const newDoc = doc(notifsCol);
    await setDoc(newDoc, {
      ...notif,
      id: newDoc.id,
      lida: false,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn("[Firebase Notif] Create error:", err);
  }
}

export function subscribeUserNotifications(
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void
) {
  const notifsCol = collection(db, "notificacoes");
  const q = query(
    notifsCol,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(40)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AppNotification);
      });
      onUpdate(list);
    },
    (err) => {
      // Fallback if index is not ready yet: query without orderBy
      const fallbackQuery = query(notifsCol, where("userId", "==", userId), limit(40));
      onSnapshot(fallbackQuery, (snap) => {
        const list: AppNotification[] = [];
        snap.forEach((d) => list.push(d.data() as AppNotification));
        list.sort((a, b) => b.createdAt - a.createdAt);
        onUpdate(list);
      });
    }
  );
}

export async function markNotificationAsRead(notifId: string) {
  try {
    const ref = doc(db, "notificacoes", notifId);
    await updateDoc(ref, { lida: true });
  } catch (err) {
    console.warn("[Firebase Notif] Mark read error:", err);
  }
}

export async function markAllUserNotificationsAsRead(userId: string) {
  try {
    const notifsCol = collection(db, "notificacoes");
    const q = query(notifsCol, where("userId", "==", userId), where("lida", "==", false));
    const snap = await getDocs(q);
    const updates = snap.docs.map((d) => updateDoc(d.ref, { lida: true }));
    await Promise.all(updates);
  } catch (err) {
    console.warn("[Firebase Notif] Mark all read error:", err);
  }
}

// ==========================================
// 4. TEAMS & FORUM (Real Persistent Teams)
// ==========================================
export interface RealTeam {
  id: string;
  nome: string;
  descricao: string;
  disciplina: string;
  liderId: string;
  liderNome: string;
  membros: Array<{
    uid: string;
    nome: string;
    papel: "lider" | "membro";
    matricula?: string;
  }>;
  createdAt: number;
}

export interface RealTeamMessage {
  id: string;
  equipeId: string;
  autorId: string;
  autorNome: string;
  conteudo: string;
  createdAt: number;
}

export async function createRealTeam(data: {
  nome: string;
  descricao: string;
  disciplina: string;
  liderId: string;
  liderNome: string;
  liderMatricula?: string;
}): Promise<string> {
  const teamsCol = collection(db, "equipes");
  const newDoc = doc(teamsCol);
  const teamId = newDoc.id;

  const team: RealTeam = {
    id: teamId,
    nome: data.nome,
    descricao: data.descricao,
    disciplina: data.disciplina,
    liderId: data.liderId,
    liderNome: data.liderNome,
    membros: [
      {
        uid: data.liderId,
        nome: data.liderNome,
        papel: "lider",
        matricula: data.liderMatricula,
      },
    ],
    createdAt: Date.now(),
  };

  await setDoc(newDoc, team);
  return teamId;
}

export function subscribeRealTeams(onUpdate: (teams: RealTeam[]) => void) {
  const teamsCol = collection(db, "equipes");
  return onSnapshot(
    teamsCol,
    (snapshot) => {
      const list: RealTeam[] = [];
      snapshot.forEach((d) => list.push(d.data() as RealTeam));
      list.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(list);
    },
    (err) => {
      console.warn("[Firebase Teams] Listen error:", err);
    }
  );
}

export async function joinRealTeam(
  teamId: string,
  user: { uid: string; nome: string; matricula?: string }
) {
  const teamRef = doc(db, "equipes", teamId);
  const snap = await getDoc(teamRef);
  if (!snap.exists()) return;
  const current = snap.data() as RealTeam;
  if (current.membros.some((m) => m.uid === user.uid)) return;

  await updateDoc(teamRef, {
    membros: arrayUnion({
      uid: user.uid,
      nome: user.nome,
      papel: "membro",
      matricula: user.matricula,
    }),
  });
}

export async function sendTeamForumMessage(data: {
  equipeId: string;
  autorId: string;
  autorNome: string;
  conteudo: string;
}) {
  const msgCol = collection(db, "equipes", data.equipeId, "mensagens");
  const newDoc = doc(msgCol);
  const msg: RealTeamMessage = {
    id: newDoc.id,
    equipeId: data.equipeId,
    autorId: data.autorId,
    autorNome: data.autorNome,
    conteudo: data.conteudo,
    createdAt: Date.now(),
  };
  await setDoc(newDoc, msg);
}

export function subscribeTeamForumMessages(
  equipeId: string,
  onUpdate: (messages: RealTeamMessage[]) => void
) {
  const msgCol = collection(db, "equipes", equipeId, "mensagens");
  return onSnapshot(
    msgCol,
    (snapshot) => {
      const msgs: RealTeamMessage[] = [];
      snapshot.forEach((d) => msgs.push(d.data() as RealTeamMessage));
      msgs.sort((a, b) => a.createdAt - b.createdAt);
      onUpdate(msgs);
    },
    (err) => {
      console.warn("[Firebase Forum] Listen error:", err);
    }
  );
}

// ==========================================
// 5. SEPARATE CREDENTIALS STORE
// ==========================================
export interface StoredQAcademicoCreds {
  matricula: string;
  senha?: string;
  campus?: string;
  lastUpdated: number;
}

export interface StoredMoodleCreds {
  username: string;
  password?: string;
  campusUrl: string;
  token?: string;
  lastUpdated: number;
}

export async function saveUserQAcademicoCreds(uid: string, creds: StoredQAcademicoCreds) {
  try {
    const ref = doc(db, "users", uid, "credentials", "qacademico");
    await setDoc(ref, { ...creds, lastUpdated: Date.now() });
  } catch (err) {
    console.warn("[Firebase Creds] Save Q-Acadêmico error:", err);
  }
}

export async function getUserQAcademicoCreds(uid: string): Promise<StoredQAcademicoCreds | null> {
  try {
    const ref = doc(db, "users", uid, "credentials", "qacademico");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as StoredQAcademicoCreds;
    }
    return null;
  } catch (err) {
    console.warn("[Firebase Creds] Get Q-Acadêmico error:", err);
    return null;
  }
}

export async function saveUserMoodleCreds(uid: string, creds: StoredMoodleCreds) {
  try {
    const ref = doc(db, "users", uid, "credentials", "moodle");
    await setDoc(ref, { ...creds, lastUpdated: Date.now() });
  } catch (err) {
    console.warn("[Firebase Creds] Save Moodle error:", err);
  }
}

export async function getUserMoodleCreds(uid: string): Promise<StoredMoodleCreds | null> {
  try {
    const ref = doc(db, "users", uid, "credentials", "moodle");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as StoredMoodleCreds;
    }
    return null;
  } catch (err) {
    console.warn("[Firebase Creds] Get Moodle error:", err);
    return null;
  }
}

