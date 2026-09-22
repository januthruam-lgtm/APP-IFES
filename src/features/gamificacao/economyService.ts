import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface UserBalance {
  uid: string;
  moedas: number;
  xp: number;
  nivel: number;
  updatedAt: number;
}

export const INITIAL_USER_BALANCE = {
  moedas: 250,
  xp: 120,
  nivel: 1,
};

/**
 * Calcula o nível com base no XP total acumulado.
 * Nível 1: 0 - 99 XP
 * Nível 2: 100 - 249 XP
 * etc. Fórmula: Math.floor(Math.sqrt(xp / 25)) + 1
 */
export function calculateLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(xp / 25)) + 1);
}

/**
 * Retorna a referência do documento de saldo do usuário no Firestore: saldos/{uid}
 */
export function getBalanceDocRef(uid: string) {
  return doc(db, "saldos", uid);
}

/**
 * Inicializa ou garante que o documento saldos/{uid} existe no Firestore.
 */
export async function initializeBalance(
  uid: string,
  initialCoins: number = INITIAL_USER_BALANCE.moedas,
  initialXp: number = INITIAL_USER_BALANCE.xp
): Promise<UserBalance> {
  const ref = getBalanceDocRef(uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const newBalance: UserBalance = {
        uid,
        moedas: initialCoins,
        xp: initialXp,
        nivel: calculateLevelFromXp(initialXp),
        updatedAt: Date.now(),
      };
      await setDoc(ref, newBalance);
      return newBalance;
    }
    const data = snap.data();
    return {
      uid,
      moedas: typeof data.moedas === "number" ? data.moedas : initialCoins,
      xp: typeof data.xp === "number" ? data.xp : initialXp,
      nivel: typeof data.nivel === "number" ? data.nivel : calculateLevelFromXp(data.xp || initialXp),
      updatedAt: data.updatedAt || Date.now(),
    };
  } catch (err) {
    console.warn("[EconomyService] Erro ao inicializar saldo, usando fallback local:", err);
    return {
      uid,
      moedas: initialCoins,
      xp: initialXp,
      nivel: calculateLevelFromXp(initialXp),
      updatedAt: Date.now(),
    };
  }
}

/**
 * Obtém o saldo atual do Firestore.
 */
export async function getBalance(uid: string): Promise<UserBalance> {
  const ref = getBalanceDocRef(uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const xp = typeof data.xp === "number" ? data.xp : INITIAL_USER_BALANCE.xp;
      return {
        uid,
        moedas: typeof data.moedas === "number" ? data.moedas : INITIAL_USER_BALANCE.moedas,
        xp,
        nivel: typeof data.nivel === "number" ? data.nivel : calculateLevelFromXp(xp),
        updatedAt: data.updatedAt || Date.now(),
      };
    }
    return initializeBalance(uid);
  } catch (err) {
    console.warn("[EconomyService] Erro ao obter saldo:", err);
    return {
      uid,
      moedas: INITIAL_USER_BALANCE.moedas,
      xp: INITIAL_USER_BALANCE.xp,
      nivel: calculateLevelFromXp(INITIAL_USER_BALANCE.xp),
      updatedAt: Date.now(),
    };
  }
}

/**
 * Escuta em tempo real atualizações no documento saldos/{uid}.
 */
export function subscribeBalance(
  uid: string,
  onUpdate: (balance: UserBalance) => void
): () => void {
  if (!uid) return () => {};
  const ref = getBalanceDocRef(uid);

  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const xp = typeof data.xp === "number" ? data.xp : INITIAL_USER_BALANCE.xp;
        onUpdate({
          uid,
          moedas: typeof data.moedas === "number" ? data.moedas : INITIAL_USER_BALANCE.moedas,
          xp,
          nivel: typeof data.nivel === "number" ? data.nivel : calculateLevelFromXp(xp),
          updatedAt: data.updatedAt || Date.now(),
        });
      } else {
        // Se ainda não existir, cria o documento inicial
        initializeBalance(uid).then(onUpdate).catch(() => {});
      }
    },
    (err) => {
      console.warn("[EconomyService] Listener de saldo Firestore error:", err);
    }
  );
}

/**
 * Credita moedas de forma atômica no Firestore via FieldValue.increment.
 * Nunca sobrescreve diretamente.
 */
export async function creditCoins(
  uid: string,
  amount: number,
  _reason?: string
): Promise<number> {
  if (!uid || amount <= 0) return 0;
  const ref = getBalanceDocRef(uid);

  try {
    await updateDoc(ref, {
      moedas: increment(amount),
      updatedAt: Date.now(),
    });
  } catch (err: any) {
    // Se o documento ainda não existir, cria-o
    if (err?.code === "not-found") {
      await setDoc(
        ref,
        {
          uid,
          moedas: INITIAL_USER_BALANCE.moedas + amount,
          xp: INITIAL_USER_BALANCE.xp,
          nivel: calculateLevelFromXp(INITIAL_USER_BALANCE.xp),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } else {
      console.warn("[EconomyService] Erro ao creditar moedas:", err);
    }
  }

  const updated = await getBalance(uid);
  return updated.moedas;
}

/**
 * Debita moedas de forma atômica utilizando transação para garantir que não fique negativo.
 * Retorna true se a transação teve sucesso, ou false se o saldo for insuficiente.
 */
export async function debitCoins(
  uid: string,
  amount: number,
  _reason?: string
): Promise<boolean> {
  if (!uid || amount <= 0) return false;
  const ref = getBalanceDocRef(uid);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        if (INITIAL_USER_BALANCE.moedas < amount) return false;
        transaction.set(ref, {
          uid,
          moedas: INITIAL_USER_BALANCE.moedas - amount,
          xp: INITIAL_USER_BALANCE.xp,
          nivel: calculateLevelFromXp(INITIAL_USER_BALANCE.xp),
          updatedAt: Date.now(),
        });
        return true;
      }

      const currentCoins = snap.data().moedas ?? 0;
      if (currentCoins < amount) {
        return false;
      }

      transaction.update(ref, {
        moedas: currentCoins - amount,
        updatedAt: Date.now(),
      });
      return true;
    });
  } catch (err) {
    console.warn("[EconomyService] Erro na transação de débito de moedas:", err);
    return false;
  }
}

/**
 * Credita XP de forma atômica no Firestore e recalcula o nível do usuário.
 */
export async function creditXp(
  uid: string,
  amount: number,
  _reason?: string
): Promise<{ xp: number; nivel: number }> {
  if (!uid || amount <= 0) return { xp: 0, nivel: 1 };
  const ref = getBalanceDocRef(uid);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      let currentXp = INITIAL_USER_BALANCE.xp;
      let currentCoins = INITIAL_USER_BALANCE.moedas;

      if (snap.exists()) {
        const data = snap.data();
        currentXp = typeof data.xp === "number" ? data.xp : currentXp;
        currentCoins = typeof data.moedas === "number" ? data.moedas : currentCoins;
      }

      const newXp = currentXp + amount;
      const newNivel = calculateLevelFromXp(newXp);

      if (!snap.exists()) {
        transaction.set(ref, {
          uid,
          moedas: currentCoins,
          xp: newXp,
          nivel: newNivel,
          updatedAt: Date.now(),
        });
      } else {
        transaction.update(ref, {
          xp: newXp,
          nivel: newNivel,
          updatedAt: Date.now(),
        });
      }

      return { xp: newXp, nivel: newNivel };
    });
  } catch (err) {
    console.warn("[EconomyService] Erro ao creditar XP:", err);
    const balance = await getBalance(uid);
    return { xp: balance.xp, nivel: balance.nivel };
  }
}
