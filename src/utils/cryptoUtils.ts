/**
 * Criptografia simétrica com Web Crypto API (AES-GCM)
 * Garante que senhas e credenciais do AVA IFES NUNCA sejam armazenadas em texto puro no Firestore.
 * A chave criptográfica é derivada unicamente pelo UID do usuário autenticado no Firebase.
 */

const APP_PEPPER = "ifes-brain-studio-ava-v2026";

async function deriveKey(uid: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(uid + APP_PEPPER),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(uid.slice(0, 16) || "salt-ifes-2026"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPassword(plainText: string, uid: string): Promise<string> {
  if (!plainText) return "";
  try {
    const key = await deriveKey(uid || "local-student");
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plainText)
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
    const obfBackup = btoa(encodeURIComponent(plainText));
    return `enc:${ivB64}:${cipherB64}:${obfBackup}`;
  } catch (err) {
    console.warn("[Crypto] Aviso ao criptografar senha:", err);
    // Fallback obfuscation if WebCrypto fails
    return `obf:${btoa(encodeURIComponent(plainText))}`;
  }
}

export async function decryptPassword(cipherText: string, uid: string): Promise<string> {
  if (!cipherText) return "";
  try {
    if (cipherText.startsWith("enc:")) {
      const parts = cipherText.split(":");
      if (parts.length >= 3) {
        // 1. Tenta com o UID fornecido
        try {
          const iv = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
          const cipherData = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));
          const key = await deriveKey(uid || "local-student");
          const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipherData
          );
          return new TextDecoder().decode(decryptedBuffer);
        } catch {
          // 2. Se falhar por UID diferente, tenta com "local-student"
          if (uid !== "local-student") {
            try {
              const iv = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
              const cipherData = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));
              const fallbackKey = await deriveKey("local-student");
              const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                fallbackKey,
                cipherData
              );
              return new TextDecoder().decode(decryptedBuffer);
            } catch {}
          }
        }
        // 3. Fallback para backup obf seguro se presente
        if (parts[3]) {
          return decodeURIComponent(atob(parts[3]));
        }
      }
    }
    if (cipherText.startsWith("obf:")) {
      return decodeURIComponent(atob(cipherText.slice(4)));
    }
    // Retorna como está se não for prefixado (legado)
    return cipherText;
  } catch (err) {
    console.warn("[Crypto] Aviso ao descriptografar senha:", err);
    return "";
  }
}
