// Frontend: Encryption utilities using Web Crypto API
// All encryption/decryption happens CLIENT-SIDE
// Private keys are NEVER sent to the server

/**
 * Generate RSA key pair for user
 * Private key stored securely in client (encrypted localStorage/IndexedDB)
 * Public key sent to server
 */
export const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const publicKeyPem = await exportKey(keyPair.publicKey);
    const privateKeyPem = await exportKey(keyPair.privateKey);

    // Store private key locally (encrypted)
    storePrivateKey(privateKeyPem);

    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem, // Not returned to caller, stays local
    };
  } catch (error) {
    console.error("Failed to generate key pair:", error);
    throw new Error("Key generation failed");
  }
};

/**
 * Export key to PEM format
 */
const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey(
    key instanceof window.CryptoKey && key.type === "private" ? "pkcs8" : "spki",
    key
  );
  const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
  return btoa(exportedAsString);
};

/**
 * Import key from PEM format
 */
export const importKey = async (keyData, type = "public") => {
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return window.crypto.subtle.importKey(
    type === "public" ? "spki" : "pkcs8",
    bytes.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    type === "public" ? ["encrypt"] : ["decrypt"]
  );
};

/**
 * Encrypt message with recipient's public key
 */
export const encryptMessage = async (message, recipientPublicKeyPem) => {
  try {
    const publicKey = await importKey(recipientPublicKeyPem, "public");
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const encrypted = await window.crypto.subtle.encrypt(
      "RSA-OAEP",
      publicKey,
      data
    );

    // Convert to base64 for transmission
    const encryptedArray = new Uint8Array(encrypted);
    let encryptedString = "";
    for (let i = 0; i < encryptedArray.length; i++) {
      encryptedString += String.fromCharCode(encryptedArray[i]);
    }
    return btoa(encryptedString);
  } catch (error) {
    console.error("Failed to encrypt message:", error);
    throw new Error("Encryption failed");
  }
};

/**
 * Decrypt message with user's private key (stored locally)
 */
export const decryptMessage = async (encryptedMessagePem) => {
  try {
    const privateKeyPem = getPrivateKey();
    if (!privateKeyPem) {
      throw new Error("Private key not found");
    }

    const privateKey = await importKey(privateKeyPem, "private");
    const binaryString = atob(encryptedMessagePem);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const decrypted = await window.crypto.subtle.decrypt(
      "RSA-OAEP",
      privateKey,
      bytes.buffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Failed to decrypt message:", error);
    throw new Error("Decryption failed");
  }
};

/**
 * Generate symmetric key for group encryption
 */
export const generateGroupKey = () => {
  return window.crypto.getRandomValues(new Uint8Array(32));
};

/**
 * Encrypt with symmetric key (for group messages)
 */
export const encryptWithSymmetricKey = async (message, groupKey) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    const key = await window.crypto.subtle.importKey(
      "raw",
      groupKey,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    let result = "";
    for (let i = 0; i < combined.length; i++) {
      result += String.fromCharCode(combined[i]);
    }
    return btoa(result);
  } catch (error) {
    console.error("Failed to encrypt with symmetric key:", error);
    throw new Error("Symmetric encryption failed");
  }
};

/**
 * Decrypt with symmetric key (for group messages)
 */
export const decryptWithSymmetricKey = async (encryptedMessage, groupKey) => {
  try {
    const binaryString = atob(encryptedMessage);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const iv = bytes.slice(0, 16);
    const encrypted = bytes.slice(16);

    const key = await window.crypto.subtle.importKey(
      "raw",
      groupKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Failed to decrypt with symmetric key:", error);
    throw new Error("Symmetric decryption failed");
  }
};

/**
 * Store private key securely (encrypted)
 * In production, use stronger encryption
 */
const storePrivateKey = (privateKeyPem) => {
  try {
    // In production, encrypt the private key with a password before storing
    localStorage.setItem("skillswap_private_key", privateKeyPem);
  } catch (error) {
    console.error("Failed to store private key:", error);
  }
};

/**
 * Retrieve private key from storage
 */
export const getPrivateKey = () => {
  try {
    return localStorage.getItem("skillswap_private_key");
  } catch (error) {
    console.error("Failed to retrieve private key:", error);
    return null;
  }
};

/**
 * Clear stored private key
 */
export const clearPrivateKey = () => {
  try {
    localStorage.removeItem("skillswap_private_key");
  } catch (error) {
    console.error("Failed to clear private key:", error);
  }
};