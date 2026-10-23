/**
 * Brain Studio - Armazenamento Seguro de Tokens no Dispositivo (Fase 7)
 * Criptografia AES-GCM de 256 bits via WebCrypto API no cliente.
 * NUNCA transmite, registra ou grava tokens no Firestore, em logs ou em URLs.
 */

const DB_NAME = "BrainStudio_SecureVault_v1";
const STORE_TOKENS = "tokens";
const STORE_KEY = "vault_keys";
const KEY_NAME = "client_vault_aes_gcm";

interface EncryptedRecord {
  sistemaId: string;
  iv: number[];
  ciphertext: number[];
  updatedAt: number;
}

let cachedKey: CryptoKey | null = null;

function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB não disponível neste ambiente"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_TOKENS)) {
        db.createObjectStore(STORE_TOKENS, { keyPath: "sistemaId" });
      }
      if (!db.objectStoreNames.contains(STORE_KEY)) {
        db.createObjectStore(STORE_KEY, { keyPath: "name" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Falha ao abrir IndexedDB"));
  });
}

/**
 * Obtém ou gera a chave mestra AES-GCM de 256 bits no dispositivo.
 */
async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const cryptoObj = typeof window !== "undefined" ? window.crypto : (globalThis as unknown as { crypto: Crypto }).crypto;
  if (!cryptoObj?.subtle) {
    throw new Error("WebCrypto SubtleCrypto não suportado neste dispositivo");
  }

  const db = await getIndexedDB();

  // Verifica se chave já existe
  const existingKey = await new Promise<CryptoKey | null>((resolve) => {
    try {
      const tx = db.transaction(STORE_KEY, "readonly");
      const store = tx.objectStore(STORE_KEY);
      const req = store.get(KEY_NAME);
      req.onsuccess = () => {
        if (req.result?.key) {
          resolve(req.result.key as CryptoKey);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  if (existingKey) {
    cachedKey = existingKey;
    return existingKey;
  }

  // Gera nova chave AES-GCM 256
  const newKey = await cryptoObj.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    false, // extractable = false (segurança máxima)
    ["encrypt", "decrypt"]
  );

  // Armazena no IndexedDB (StructuredClone do CryptoKey nativo)
  await new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_KEY, "readwrite");
      const store = tx.objectStore(STORE_KEY);
      const req = store.put({ name: KEY_NAME, key: newKey, createdAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });

  cachedKey = newKey;
  return newKey;
}

/**
 * Salva com segurança um token institucional criptografado apenas no aparelho.
 */
export async function salvarTokenNoAparelho(sistemaId: string, token: string): Promise<boolean> {
  if (!sistemaId || !token) return false;

  try {
    const cryptoObj = typeof window !== "undefined" ? window.crypto : (globalThis as unknown as { crypto: Crypto }).crypto;
    const key = await getOrCreateCryptoKey();

    const iv = cryptoObj.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(token);

    const ciphertext = await cryptoObj.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedData
    );

    const record: EncryptedRecord = {
      sistemaId,
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext)),
      updatedAt: Date.now(),
    };

    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_TOKENS, "readwrite");
      const store = tx.objectStore(STORE_TOKENS);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return true;
  } catch (error) {
    console.error("[SecureStorage] Erro ao salvar token seguro local:", error);
    return false;
  }
}

/**
 * Recupera e descriptografa o token salvo para o sistema especificado.
 */
export async function obterTokenDoAparelho(sistemaId: string): Promise<string | null> {
  if (!sistemaId) return null;

  try {
    const db = await getIndexedDB();
    const record = await new Promise<EncryptedRecord | null>((resolve) => {
      const tx = db.transaction(STORE_TOKENS, "readonly");
      const store = tx.objectStore(STORE_TOKENS);
      const req = store.get(sistemaId);
      req.onsuccess = () => resolve((req.result as EncryptedRecord) || null);
      req.onerror = () => resolve(null);
    });

    if (!record || !record.ciphertext || !record.iv) {
      return null;
    }

    const cryptoObj = typeof window !== "undefined" ? window.crypto : (globalThis as unknown as { crypto: Crypto }).crypto;
    const key = await getOrCreateCryptoKey();

    const iv = new Uint8Array(record.iv);
    const ciphertext = new Uint8Array(record.ciphertext);

    const decrypted = await cryptoObj.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("[SecureStorage] Erro ao recuperar token descriptografado:", error);
    return null;
  }
}

/**
 * Remove com segurança o token de um sistema do aparelho.
 */
export async function removerTokenDoAparelho(sistemaId: string): Promise<boolean> {
  if (!sistemaId) return false;

  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_TOKENS, "readwrite");
      const store = tx.objectStore(STORE_TOKENS);
      const req = store.delete(sistemaId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (error) {
    console.error("[SecureStorage] Erro ao remover token:", error);
    return false;
  }
}

/**
 * Limpa todos os tokens salvos no dispositivo (ex: ao fazer logout total ou limpar dados).
 */
export async function limparTodosTokensDoAparelho(): Promise<boolean> {
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_TOKENS, STORE_KEY], "readwrite");
      tx.objectStore(STORE_TOKENS).clear();
      tx.objectStore(STORE_KEY).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    cachedKey = null;
    return true;
  } catch (error) {
    console.error("[SecureStorage] Erro ao limpar cofre de tokens:", error);
    return false;
  }
}

/**
 * Barreira de Segurança Estrita: Valida que NENHUM campo sensível seja enviado ao Firestore.
 * Dispara erro caso encontre qualquer chave que denote token, senha, segredo ou credencial.
 */
export function validarSegurancaPayloadFirestore(payload: Record<string, unknown>): boolean {
  if (!payload || typeof payload !== "object") return true;

  const chavesProibidas = [
    "token",
    "password",
    "senha",
    "secret",
    "credential",
    "access_token",
    "refresh_token",
    "jwt",
    "auth_token",
  ];

  function verificarObjeto(obj: Record<string, unknown>, path = ""): void {
    for (const [key, val] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      for (const proibida of chavesProibidas) {
        if (lowerKey === proibida || lowerKey.includes(proibida)) {
          throw new Error(
            `[VIOLAÇÃO DE SEGURANÇA]: Tentativa de gravar campo sensível '${path}${key}' no Firestore! Tokens devem permanecer exclusivamente no dispositivo via secureTokenStorage.`
          );
        }
      }
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        verificarObjeto(val as Record<string, unknown>, `${path}${key}.`);
      }
    }
  }

  verificarObjeto(payload);
  return true;
}
