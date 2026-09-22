import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface RealEquipe {
  id: string;
  nome: string;
  tag: string;
  descricao: string;
  criadaPor: string;
  liderNome: string;
  badgeEmoji: string;
  membros: string[];
  totalXp: number;
  createdAt: number;
}

export const EQUIPES_COLLECTION = "equipes";

/**
 * Escuta em tempo real todas as equipes cadastradas no Firestore,
 * ordenadas pelo total de XP (ranking real).
 */
export function subscribeEquipes(
  onUpdate: (equipes: RealEquipe[]) => void
): () => void {
  const ref = collection(db, EQUIPES_COLLECTION);
  const q = query(ref, orderBy("totalXp", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RealEquipe[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          nome: d.nome || "Equipe Sem Nome",
          tag: d.tag || "IFES",
          descricao: d.descricao || "",
          criadaPor: d.criadaPor || "",
          liderNome: d.liderNome || "Estudante IFES",
          badgeEmoji: d.badgeEmoji || "🛡️",
          membros: Array.isArray(d.membros) ? d.membros : [d.criadaPor || "aluno"],
          totalXp: typeof d.totalXp === "number" ? d.totalXp : 0,
          createdAt: d.createdAt || Date.now(),
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn("[EquipesService] Erro ao carregar equipes:", err);
      // Retorna array vazio em caso de erro, NUNCA dados fictícios!
      onUpdate([]);
    }
  );
}

/**
 * Cria uma nova equipe real e salva no Firestore.
 */
export async function createRealEquipe(params: {
  nome: string;
  tag: string;
  descricao: string;
  badgeEmoji: string;
  userId: string;
  userName: string;
}): Promise<RealEquipe> {
  const { nome, tag, descricao, badgeEmoji, userId, userName } = params;
  const equipeId = `equipe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const ref = doc(db, EQUIPES_COLLECTION, equipeId);

  const novaEquipe: RealEquipe = {
    id: equipeId,
    nome: nome.trim(),
    tag: tag.trim().toUpperCase().slice(0, 5),
    descricao: descricao.trim(),
    criadaPor: userId,
    liderNome: userName || "Estudante IFES",
    badgeEmoji: badgeEmoji || "⚔️",
    membros: [userId],
    totalXp: 0,
    createdAt: Date.now(),
  };

  await setDoc(ref, novaEquipe);
  return novaEquipe;
}

/**
 * Entra em uma equipe real no Firestore adicionando o usuário à lista de membros.
 */
export async function joinRealEquipe(
  equipeId: string,
  userId: string
): Promise<void> {
  const ref = doc(db, EQUIPES_COLLECTION, equipeId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) {
      throw new Error("Equipe não encontrada.");
    }
    transaction.update(ref, {
      membros: arrayUnion(userId),
    });
  });
}

/**
 * Sai de uma equipe real no Firestore.
 */
export async function leaveRealEquipe(
  equipeId: string,
  userId: string
): Promise<void> {
  const ref = doc(db, EQUIPES_COLLECTION, equipeId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;
    transaction.update(ref, {
      membros: arrayRemove(userId),
    });
  });
}
