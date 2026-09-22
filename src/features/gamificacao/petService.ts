import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { UserPet } from "../../types";
import {
  DEFAULT_PET_DEFINITION,
  DEFAULT_PET_ID,
  getPetDefinition,
} from "./petCatalog";
import { debitCoins } from "./economyService";

export interface StoredUserPetData {
  uid: string;
  petId: string;
  nome: string;
  nivel: number;
  exp: number;
  maxExp: number;
  fome: number;
  felicidade: number;
  desbloqueados: string[];
  updatedAt: number;
}

export function getUserPetDocRef(uid: string) {
  return doc(db, "petsUsuario", uid);
}

/**
 * Converte os dados do Firestore para o tipo UserPet da interface do app,
 * garantindo sempre um pet válido do catálogo através de getPetDefinition.
 */
export function convertToUserPet(data: Partial<StoredUserPetData>): UserPet {
  const definition = getPetDefinition(data.petId);

  return {
    id: data.petId || DEFAULT_PET_ID,
    name: data.nome || definition.nome,
    type: "coruja" as any, // Mantém compatibilidade com tipos existentes
    level: typeof data.nivel === "number" && data.nivel > 0 ? data.nivel : 1,
    exp: typeof data.exp === "number" ? data.exp : 0,
    maxExp: typeof data.maxExp === "number" ? data.maxExp : 100,
    hunger: typeof data.fome === "number" ? data.fome : 80,
    happiness: typeof data.felicidade === "number" ? data.felicidade : 85,
    customSpeciesName: definition.nome,
    customSpeciesEmoji: definition.emoji,
    activePetId: definition.id,
    unlockedPets: Array.isArray(data.desbloqueados) ? data.desbloqueados : [DEFAULT_PET_ID],
    lastFed: new Date(data.updatedAt || Date.now()).toISOString(),
  };
}

/**
 * Inicializa ou garante o pet padrão no Firestore (petsUsuario/{uid})
 */
export async function initializeUserPet(uid: string): Promise<UserPet> {
  const ref = getUserPetDocRef(uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const initialData: StoredUserPetData = {
        uid,
        petId: DEFAULT_PET_ID,
        nome: DEFAULT_PET_DEFINITION.nome,
        nivel: 1,
        exp: 0,
        maxExp: 100,
        fome: 80,
        felicidade: 85,
        desbloqueados: [DEFAULT_PET_ID],
        updatedAt: Date.now(),
      };
      await setDoc(ref, initialData);
      return convertToUserPet(initialData);
    }
    return convertToUserPet(snap.data() as StoredUserPetData);
  } catch (err) {
    console.warn("[PetService] Erro ao inicializar pet, retornando padrão:", err);
    return convertToUserPet({
      uid,
      petId: DEFAULT_PET_ID,
      nome: DEFAULT_PET_DEFINITION.nome,
      desbloqueados: [DEFAULT_PET_ID],
    });
  }
}

/**
 * Escuta atualizações em tempo real do pet do usuário no Firestore (petsUsuario/{uid})
 */
export function subscribeUserPet(
  uid: string,
  onUpdate: (pet: UserPet) => void
): () => void {
  if (!uid) return () => {};
  const ref = getUserPetDocRef(uid);

  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate(convertToUserPet(snap.data() as StoredUserPetData));
      } else {
        initializeUserPet(uid).then(onUpdate).catch(() => {});
      }
    },
    (err) => {
      console.warn("[PetService] Listener error petsUsuario:", err);
    }
  );
}

/**
 * Equipa um pet já desbloqueado
 */
export async function equipUserPet(uid: string, petId: string): Promise<UserPet> {
  const definition = getPetDefinition(petId);
  const ref = getUserPetDocRef(uid);

  try {
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as StoredUserPetData) : null;
    const desbloqueados = existing?.desbloqueados || [DEFAULT_PET_ID];

    if (!desbloqueados.includes(petId) && petId !== DEFAULT_PET_ID) {
      desbloqueados.push(petId);
    }

    const updated: Partial<StoredUserPetData> = {
      petId: definition.id,
      nome: definition.nome,
      desbloqueados,
      updatedAt: Date.now(),
    };

    await setDoc(ref, updated, { merge: true });
    return convertToUserPet({ ...existing, ...updated });
  } catch (err) {
    console.warn("[PetService] Erro ao equipar pet:", err);
    return convertToUserPet({ petId: definition.id });
  }
}

/**
 * Adota/compra um novo pet debitando moedas via economyService e gravando no Firestore
 */
export async function buyAndEquipPet(
  uid: string,
  petId: string
): Promise<{ success: boolean; error?: string; pet?: UserPet }> {
  const definition = getPetDefinition(petId);
  if (definition.custoMoedas > 0) {
    const debited = await debitCoins(uid, definition.custoMoedas, `Adoção do pet ${definition.nome}`);
    if (!debited) {
      return {
        success: false,
        error: `Moedas insuficientes. O mascote ${definition.nome} custa ${definition.custoMoedas} moedas.`,
      };
    }
  }

  const pet = await equipUserPet(uid, petId);
  return { success: true, pet };
}

/**
 * Alimenta o pet no Firestore aumentando felicidade e saciedade
 */
export async function feedUserPetInDb(uid: string, foodAmount: number = 15): Promise<UserPet> {
  const ref = getUserPetDocRef(uid);
  try {
    const snap = await getDoc(ref);
    const existing = snap.exists()
      ? (snap.data() as StoredUserPetData)
      : {
          uid,
          petId: DEFAULT_PET_ID,
          nome: DEFAULT_PET_DEFINITION.nome,
          nivel: 1,
          exp: 0,
          maxExp: 100,
          fome: 80,
          felicidade: 85,
          desbloqueados: [DEFAULT_PET_ID],
          updatedAt: Date.now(),
        };

    const newFome = Math.min(100, (existing.fome || 80) + foodAmount);
    const newFelicidade = Math.min(100, (existing.felicidade || 85) + 10);
    const newExp = (existing.exp || 0) + 20;
    let newNivel = existing.nivel || 1;
    let newMaxExp = existing.maxExp || 100;

    if (newExp >= newMaxExp) {
      newNivel += 1;
      newMaxExp = newNivel * 100;
    }

    const updated: StoredUserPetData = {
      ...existing,
      fome: newFome,
      felicidade: newFelicidade,
      exp: newExp,
      nivel: newNivel,
      maxExp: newMaxExp,
      updatedAt: Date.now(),
    };

    await setDoc(ref, updated, { merge: true });
    return convertToUserPet(updated);
  } catch (err) {
    console.warn("[PetService] Erro ao alimentar pet:", err);
    return convertToUserPet({});
  }
}
