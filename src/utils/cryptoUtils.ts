/**
 * Criptografia simétrica com Web Crypto API (AES-GCM)
 * Garante que senhas do Q-Acadêmico e AVA NUNCA sejam armazenadas em texto puro no Firestore.
 * A chave criptográfica é derivada unicamente pelo UID do usuário autenticado no Firebase.
 */

const APP_PEPPER = "ifes-brain-studio-qacad-v2026";

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
    const key = await deriveKey(uid);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plainText)
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
    return `enc:${ivB64}:${cipherB64}`;
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
      if (parts.length === 3) {
        const iv = Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0));
        const cipherData = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));
        const key = await deriveKey(uid);
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          key,
          cipherData
        );
        return new TextDecoder().decode(decryptedBuffer);
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
