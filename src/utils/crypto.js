// Local Zero-Knowledge Cryptographic Helpers using Web Crypto API

// Derive an AES-GCM key from a master password using PBKDF2
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt a plain text string
export async function encryptData(text, password) {
  try {
    const encoder = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(text)
    );

    // Pack salt, iv, and ciphertext together into a single base64 string
    const packed = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    packed.set(salt, 0);
    packed.set(iv, salt.length);
    packed.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...packed));
  } catch (e) {
    console.error("Encryption failed:", e);
    throw new Error("Encryption failed");
  }
}

// Decrypt a base64 ciphertext string
export async function decryptData(cipherTextBase64, password) {
  try {
    const packed = new Uint8Array(
      atob(cipherTextBase64).split("").map((c) => c.charCodeAt(0))
    );

    const salt = packed.slice(0, 16);
    const iv = packed.slice(16, 28);
    const encryptedData = packed.slice(28);

    const key = await deriveKey(password, salt);
    const decoder = new TextDecoder();

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encryptedData
    );

    return decoder.decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("Invalid Master Password or corrupted data.");
  }
}

// Generate a local verification hash to store for checking login correctness
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}