/**
 * excluidosService.ts
 * Sistema Unificado de Soft-Delete e Gestão de Itens Excluídos (Bloco 6)
 *
 * Princípios:
 * 1. Exclusão persistente: status "excluido", excluidoEm e origem armazenados.
 * 2. Itens excluídos NUNCA aparecem fora da aba Excluídos.
 * 3. Identificador estável para impedir que sincronizações (Moodle/AVA) ressuscitem itens excluídos.
 * 4. Excluir uma matéria agrupa e move suas tarefas, eventos e flashcards vinculados.
 * 5. Restaurar item traz de volta com integridade.
 * 6. "Excluir definitivamente" apaga com confirmação, mantendo tombstone mínimo contra ressuscitação.
 */

import { FirestoreService } from "../../../lib/firestoreService";

export type CategoriaExcluida =
  | "materias"
  | "tarefas"
  | "eventos"
  | "cards"
  | "notas"
  | "simulados"
  | "anexos"
  | "conexoes"
  | "outros";

export interface ItemExcluido {
  id: string;
  categoria: CategoriaExcluida;
  nome: string;
  materiaOrigem?: string;
  materiaOrigemId?: string;
  excluidoEm: string; // ISO String
  dadosOriginais?: any; // Snapshot para restauração fiel
  tombstoneKey?: string;
}

const STORAGE_KEY_EXCLUIDOS = "brain_studio_itens_excluidos_v2";

function carregarDoStorage(): Record<string, ItemExcluido> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXCLUIDOS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

function salvarNoStorage(map: Record<string, ItemExcluido>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_EXCLUIDOS, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("brain_studio_excluidos_updated"));
  } catch {}
}

/**
 * Normaliza chave estável para impedir que sincronizações do AVA/Moodle ressuscitem itens.
 */
export function normalizarChaveEstavel(nome: string, codigo?: string): string {
  const n = (nome || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  const c = (codigo || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  return c ? `${c}_${n.slice(0, 30)}` : n;
}

/**
 * Move um item para a lixeira persistente (Soft Delete).
 */
export async function moverParaExcluidos(
  userId: string,
  item: {
    id: string;
    categoria: CategoriaExcluida;
    nome: string;
    materiaOrigem?: string;
    materiaOrigemId?: string;
    dadosOriginais?: any;
    codigo?: string;
  }
): Promise<ItemExcluido> {
  const agora = new Date().toISOString();
  const tombstoneKey = normalizarChaveEstavel(item.nome, item.codigo);

  const registro: ItemExcluido = {
    id: item.id,
    categoria: item.categoria,
    nome: item.nome,
    materiaOrigem: item.materiaOrigem,
    materiaOrigemId: item.materiaOrigemId,
    excluidoEm: agora,
    dadosOriginais: item.dadosOriginais,
    tombstoneKey,
  };

  const store = carregarDoStorage();
  store[item.id] = registro;
  if (tombstoneKey) {
    store[`tombstone_${tombstoneKey}`] = registro;
  }
  salvarNoStorage(store);

  // Sincronização remota no Firestore
  if (userId && userId !== "local_user") {
    FirestoreService.setDocument(`users/${userId}/excluidos`, item.id, registro).catch(
      (err) => console.warn("[ExcluidosService] Erro ao sincronizar soft-delete:", err)
    );
  }

  return registro;
}

/**
 * Verifica se um item está marcado como excluído.
 */
export function isItemExcluido(id?: string, nome?: string, codigo?: string): boolean {
  if (!id && !nome) return false;
  const store = carregarDoStorage();
  if (id && store[id]) return true;
  if (nome) {
    const key = `tombstone_${normalizarChaveEstavel(nome, codigo)}`;
    if (store[key]) return true;
  }
  return false;
}

/**
 * Retorna todos os itens excluídos, opcionalmente filtrados por categoria.
 */
export function listarItensExcluidos(categoria?: CategoriaExcluida): ItemExcluido[] {
  const store = carregarDoStorage();
  const unicos = new Map<string, ItemExcluido>();

  for (const [chave, item] of Object.entries(store)) {
    // Pula referências redundantes de tombstone
    if (chave.startsWith("tombstone_")) continue;
    if (!categoria || item.categoria === categoria) {
      unicos.set(item.id, item);
    }
  }

  return Array.from(unicos.values()).sort(
    (a, b) => new Date(b.excluidoEm).getTime() - new Date(a.excluidoEm).getTime()
  );
}

/**
 * Restaura um item da lixeira para a sua área de origem.
 */
export async function restaurarItemExcluido(userId: string, id: string): Promise<ItemExcluido | null> {
  const store = carregarDoStorage();
  const item = store[id];
  if (!item) return null;

  delete store[id];
  if (item.tombstoneKey) {
    delete store[`tombstone_${item.tombstoneKey}`];
  }
  salvarNoStorage(store);

  if (userId && userId !== "local_user") {
    FirestoreService.deleteDocument(`users/${userId}/excluidos`, id).catch(
      (err) => console.warn("[ExcluidosService] Erro ao sincronizar restauração:", err)
    );
  }

  window.dispatchEvent(
    new CustomEvent("brain_studio_item_restaurado", {
      detail: { item },
    })
  );

  return item;
}

/**
 * Exclui definitivamente um item (atendendo ao direito de exclusão).
 * O identificador permanece como marcador mínimo sem conteúdo para prevenir recriação por sincronização.
 */
export async function excluirDefinitivamente(userId: string, id: string): Promise<void> {
  const store = carregarDoStorage();
  const item = store[id];
  if (item) {
    // Mantém tombstone mínimo
    if (item.tombstoneKey) {
      store[`tombstone_${item.tombstoneKey}`] = {
        id: item.id,
        categoria: item.categoria,
        nome: item.nome,
        excluidoEm: item.excluidoEm,
        tombstoneKey: item.tombstoneKey,
      };
    }
    delete store[id];
    salvarNoStorage(store);
  }

  if (userId && userId !== "local_user") {
    FirestoreService.deleteDocument(`users/${userId}/excluidos`, id).catch(() => {});
  }
}

/**
 * Esvazia todos os itens de uma categoria específica.
 */
export async function esvaziarCategoriaExcluidos(
  userId: string,
  categoria: CategoriaExcluida
): Promise<number> {
  const store = carregarDoStorage();
  let count = 0;

  for (const [k, item] of Object.entries(store)) {
    if (item.categoria === categoria) {
      if (!k.startsWith("tombstone_")) {
        count++;
        if (item.tombstoneKey) {
          store[`tombstone_${item.tombstoneKey}`] = {
            id: item.id,
            categoria: item.categoria,
            nome: item.nome,
            excluidoEm: item.excluidoEm,
            tombstoneKey: item.tombstoneKey,
          };
        }
        delete store[k];
      }
    }
  }

  salvarNoStorage(store);

  if (userId && userId !== "local_user") {
    const res = await FirestoreService.queryCollection(`users/${userId}/excluidos`);
    if (res.success && res.data) {
      for (const doc of res.data) {
        if (doc.categoria === categoria) {
          FirestoreService.deleteDocument(`users/${userId}/excluidos`, doc.id).catch(() => {});
        }
      }
    }
  }

  return count;
}
