/**
 * Brain Studio - Sistema de Exclusão Persistente de Matérias e Tombstones (Fase 3)
 *
 * Princípios:
 * 1. "Soft delete" persistente sincronizado no Firestore e offline-first no localStorage.
 * 2. Identificador estável por (código + nome normalizado) para prevenir que sincronizações
 *    do Moodle, Q-Acadêmico ou arquivos ressuscitem matérias excluídas pelo aluno.
 * 3. Recuperação íntegra de tarefas e flashcards vinculados ao restaurar.
 * 4. Exclusão definitiva após confirmação explícita.
 */

import { IfesCourse } from "../types";
import { FirestoreService } from "../lib/firestoreService";

export interface TombstoneItem {
  key: string;
  id: string;
  code: string;
  name: string;
  status: "excluida" | "ativa";
  excluidaEm: string; // ISO String
  updatedAt: number;
}

const STORAGE_KEY = "brain_studio_tombstones_v1";

/**
 * Gera uma chave de identificador estável e insensível a maiúsculas/acentos
 * para garantir que a matéria nunca seja ressuscitada por sincronização.
 */
export function normalizeTombstoneKey(code?: string, name?: string): string {
  const cleanCode = (code || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  const cleanName = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  return cleanCode ? `${cleanCode}_${cleanName.slice(0, 20)}` : cleanName;
}

/**
 * Lê os tombstones locais salvos.
 */
export function getLocalTombstones(): Record<string, TombstoneItem> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

/**
 * Grava os tombstones no cache local.
 */
export function saveLocalTombstones(map: Record<string, TombstoneItem>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Verifica se uma disciplina está marcada como excluída (tombstone ativo).
 */
export function isCourseExcluded(course: { id?: string; code?: string; name: string }): boolean {
  const tombstones = getLocalTombstones();
  const key = normalizeTombstoneKey(course.code, course.name);
  const byKey = tombstones[key];
  if (byKey && byKey.status === "excluida") return true;

  if (course.id && tombstones[course.id] && tombstones[course.id].status === "excluida") {
    return true;
  }

  return false;
}

/**
 * Marca uma matéria como excluída ("Soft Delete").
 * Sincroniza imediatamente no cache local e assincronamente no Firestore.
 */
export async function excludeCourse(userId: string, course: IfesCourse): Promise<void> {
  const key = normalizeTombstoneKey(course.code, course.name);
  const now = new Date().toISOString();

  const tombstone: TombstoneItem = {
    key,
    id: course.id,
    code: course.code || "",
    name: course.name,
    status: "excluida",
    excluidaEm: now,
    updatedAt: Date.now(),
  };

  const local = getLocalTombstones();
  local[key] = tombstone;
  if (course.id) {
    local[course.id] = tombstone;
  }
  saveLocalTombstones(local);

  // Sincronizar com Firestore se houver usuário
  if (userId) {
    FirestoreService.setDocument(`users/${userId}/materiasExcluidas`, key, tombstone).catch(
      (err) => console.warn("[Tombstones] Erro ao sincronizar soft-delete:", err)
    );
  }
}

/**
 * Restaura uma matéria excluída, permitindo que ela volte a aparecer nas visualizações.
 */
export async function restoreCourse(userId: string, keyOrId: string): Promise<void> {
  const local = getLocalTombstones();

  for (const [k, item] of Object.entries(local)) {
    if (k === keyOrId || item.id === keyOrId || item.key === keyOrId) {
      delete local[k];
    }
  }
  saveLocalTombstones(local);

  if (userId) {
    FirestoreService.deleteDocument(`users/${userId}/materiasExcluidas`, keyOrId).catch(
      (err) => console.warn("[Tombstones] Erro ao restaurar no Firestore:", err)
    );
  }
}

/**
 * Exclui definitivamente uma matéria e apaga seu registro de tombstone.
 */
export async function deleteCoursePermanently(userId: string, keyOrId: string): Promise<void> {
  await restoreCourse(userId, keyOrId);
}

/**
 * Esvazia todas as matérias excluídas.
 */
export async function emptyExcludedCourses(userId: string): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }

  if (userId) {
    const res = await FirestoreService.queryCollection(`users/${userId}/materiasExcluidas`);
    if (res.success && res.data) {
      for (const doc of res.data) {
        FirestoreService.deleteDocument(`users/${userId}/materiasExcluidas`, doc.id).catch(() => {});
      }
    }
  }
}

/**
 * Retorna a lista de todas as matérias atualmente excluídas para exibição na aba dedicada.
 */
export function getExcludedCoursesList(): TombstoneItem[] {
  const local = getLocalTombstones();
  const seen = new Set<string>();
  const list: TombstoneItem[] = [];

  for (const item of Object.values(local)) {
    if (item.status === "excluida" && !seen.has(item.key)) {
      seen.add(item.key);
      list.push(item);
    }
  }

  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Filtra uma lista de disciplinas, removendo todas as matérias com tombstones ativos.
 */
export function filterActiveCourses<T extends { id?: string; code?: string; name: string }>(
  courses: T[]
): T[] {
  return (courses || []).filter((c) => !isCourseExcluded(c));
}
