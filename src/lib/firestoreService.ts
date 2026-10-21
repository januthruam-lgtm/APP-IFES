/**
 * Brain Studio - Camada Única de Acesso ao Firestore
 * Centraliza e padroniza todas as operações de leitura, escrita, subscrições em tempo real
 * e transações atômicas no banco de dados NoSQL do Firebase.
 *
 * Princípios:
 * 1. Tratamento seguro de exceções e offline fallback.
 * 2. Operações atômicas com runTransaction para consistência contábil (saldos, baú, cidade).
 * 3. Prevenção de chamadas dispersas no código do cliente.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  Unsubscribe,
  Transaction,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class FirestoreService {
  /**
   * Obtém um documento específico por ID.
   */
  public static async getDocument<T = DocumentData>(
    collectionPath: string,
    documentId: string
  ): Promise<FirestoreResult<T>> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return {
          success: true,
          data: { id: snapshot.id, ...snapshot.data() } as T,
        };
      }
      return { success: false, error: "DOCUMENT_NOT_FOUND" };
    } catch (err: any) {
      console.warn(`[FirestoreService] Falha ao ler ${collectionPath}/${documentId}:`, err?.message || err);
      return { success: false, error: err?.message || "READ_ERROR" };
    }
  }

  /**
   * Salva ou mescla um documento por ID.
   */
  public static async setDocument<T extends Record<string, any>>(
    collectionPath: string,
    documentId: string,
    data: T,
    merge = true
  ): Promise<FirestoreResult<boolean>> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, payload, { merge });
      return { success: true, data: true };
    } catch (err: any) {
      console.warn(`[FirestoreService] Falha ao gravar ${collectionPath}/${documentId}:`, err?.message || err);
      return { success: false, error: err?.message || "WRITE_ERROR" };
    }
  }

  /**
   * Atualiza campos parciais em um documento existente.
   */
  public static async updateDocument(
    collectionPath: string,
    documentId: string,
    data: Partial<Record<string, any>>
  ): Promise<FirestoreResult<boolean>> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: true };
    } catch (err: any) {
      console.warn(`[FirestoreService] Falha ao atualizar ${collectionPath}/${documentId}:`, err?.message || err);
      return { success: false, error: err?.message || "UPDATE_ERROR" };
    }
  }

  /**
   * Exclui um documento por ID.
   */
  public static async deleteDocument(
    collectionPath: string,
    documentId: string
  ): Promise<FirestoreResult<boolean>> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      await deleteDoc(docRef);
      return { success: true, data: true };
    } catch (err: any) {
      console.warn(`[FirestoreService] Falha ao excluir ${collectionPath}/${documentId}:`, err?.message || err);
      return { success: false, error: err?.message || "DELETE_ERROR" };
    }
  }

  /**
   * Escuta alterações em tempo real de um documento (com limpeza via Unsubscribe).
   */
  public static subscribeDocument<T = DocumentData>(
    collectionPath: string,
    documentId: string,
    onData: (data: T | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const docRef = doc(db, collectionPath, documentId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          onData(null);
        }
      },
      (err) => {
        console.warn(`[FirestoreService] Erro no listener ${collectionPath}/${documentId}:`, err);
        if (onError) onError(err);
      }
    );
  }

  /**
   * Consulta documentos de uma coleção com filtros e ordenação estruturados.
   */
  public static async queryCollection<T = DocumentData>(
    collectionPath: string,
    constraints: QueryConstraint[] = []
  ): Promise<FirestoreResult<T[]>> {
    try {
      const colRef = collection(db, collectionPath);
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as T[];

      return { success: true, data: items };
    } catch (err: any) {
      console.warn(`[FirestoreService] Falha na query em ${collectionPath}:`, err?.message || err);
      return { success: false, error: err?.message || "QUERY_ERROR" };
    }
  }

  /**
   * Escuta alterações em tempo real de uma coleção com filtros.
   */
  public static subscribeCollection<T = DocumentData>(
    collectionPath: string,
    constraints: QueryConstraint[] = [],
    onData: (items: T[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const colRef = collection(db, collectionPath);
    const q = query(colRef, ...constraints);

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as T[];
        onData(items);
      },
      (err) => {
        console.warn(`[FirestoreService] Erro no listener da coleção ${collectionPath}:`, err);
        if (onError) onError(err);
      }
    );
  }

  /**
   * Executa uma transação atômica e idempotente no Firestore.
   * Utilizada para operações contábeis como abertura de baú, dedução de moedas e compra de estágios.
   */
  public static async runAtomicTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<FirestoreResult<T>> {
    try {
      const result = await runTransaction(db, updateFunction);
      return { success: true, data: result };
    } catch (err: any) {
      console.warn("[FirestoreService] Falha na transação atômica:", err?.message || err);
      return { success: false, error: err?.message || "TRANSACTION_FAILED" };
    }
  }
}

export default FirestoreService;
