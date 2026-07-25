import { Wallet, isAddress } from "ethers";

/**
 * Derives a secure key using Web Crypto API and PBKDF2
 */
async function deriveSecureKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`tori_vault_salt_${userId.toLowerCase()}`);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`tori_secret_vault_key_${userId}`),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt sensitive string data using Web Crypto API AES-GCM
 */
export async function encryptData(userId: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const derivedKey = await deriveSecureKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    encoder.encode(data),
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  // Convert to hex string
  return Array.from(combined)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Decrypt sensitive string data using Web Crypto API AES-GCM
 */
export async function decryptData(userId: string, encryptedHex: string): Promise<string> {
  const combined = new Uint8Array(
    encryptedHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
  );
  if (combined.length < 12) {
    throw new Error("Invalid encrypted data format");
  }

  const derivedKey = await deriveSecureKey(userId);
  const iv = combined.slice(0, 12);
  const dataBuffer = combined.slice(12);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    dataBuffer,
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Generates a standard HD Wallet
 */
export function generateWallet() {
  const randomWallet = Wallet.createRandom();
  return {
    address: randomWallet.address,
    privateKey: randomWallet.privateKey,
    mnemonicPhrase: randomWallet.mnemonic?.phrase || "",
  };
}

export function isValidAddress(address: string): boolean {
  return isAddress(address);
}
