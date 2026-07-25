import { Wallet } from "ethers";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface WalletRecord {
  id: string;
  user_id: string;
  wallet_name: string;
  wallet_address: string;
  primary_network: string;
  encrypted_private_key: string;
  encrypted_mnemonic?: string;
  wallet_version: string;
  created_at?: string;
  updated_at?: string;
}

export interface WalletSettingsRecord {
  id: string;
  user_id: string;
  default_wallet?: string;
  preferred_network: string;
  currency: string;
  language: string;
  theme: string;
  biometric_enabled: boolean;
  auto_lock_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLogRecord {
  id?: string;
  user_id: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

const LOCAL_WALLETS_KEY = "tori_local_wallets";
const LOCAL_SETTINGS_KEY = "tori_local_wallet_settings";
const LOCAL_LOGS_KEY = "tori_local_activity_logs";

/**
 * Encrypt sensitive string data using Web Crypto API AES-GCM
 */
export async function encryptData(userId: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`tori_vault_salt_${userId.toLowerCase()}`);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`tori_secret_vault_key_${userId}`),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const derivedKey = await crypto.subtle.deriveKey(
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

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    encoder.encode(data),
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt ciphertext using Web Crypto API AES-GCM
 */
export async function decryptData(userId: string, cipherText: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`tori_vault_salt_${userId.toLowerCase()}`);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`tori_secret_vault_key_${userId}`),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const derivedKey = await crypto.subtle.deriveKey(
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

  const combined = new Uint8Array(
    atob(cipherText)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );
  const iv = combined.slice(0, 12);
  const dataBuffer = combined.slice(12);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    dataBuffer,
  );

  return new TextDecoder().decode(decryptedBuffer);
}

export const walletService = {
  /**
   * Fetch existing user wallet if present
   */
  async getWallet(userId: string): Promise<WalletRecord | null> {
    if (!userId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching wallet from Supabase:", error);
        } else if (data) {
          return data as WalletRecord;
        }
      } catch (e) {
        console.error("Supabase query error:", e);
      }
    }

    // Local Storage Fallback / Demo Mode check
    if (typeof window !== "undefined") {
      try {
        const localWallets: Record<string, WalletRecord> = JSON.parse(
          localStorage.getItem(LOCAL_WALLETS_KEY) || "{}",
        );
        return localWallets[userId] || null;
      } catch {
        return null;
      }
    }

    return null;
  },

  /**
   * Get or Create HD Wallet
   * Strictly avoids duplicate wallet generation and never overwrites an existing wallet.
   */
  async getOrCreateWallet(
    userId: string,
  ): Promise<{ wallet: WalletRecord; mnemonicPhrase?: string; isNew: boolean }> {
    if (!userId) {
      throw new Error("User ID is required to get or create wallet.");
    }

    // 1. Check if wallet already exists
    const existing = await this.getWallet(userId);
    if (existing) {
      return { wallet: existing, isNew: false };
    }

    // 2. Generate HD Wallet via ethers
    const randomWallet = Wallet.createRandom();
    const address = randomWallet.address;
    const privateKey = randomWallet.privateKey;
    const mnemonicPhrase = randomWallet.mnemonic?.phrase || "";

    // 3. Encrypt mnemonic and private key
    const encryptedPrivateKey = await encryptData(userId, privateKey);
    const encryptedMnemonic = mnemonicPhrase ? await encryptData(userId, mnemonicPhrase) : "";

    const newWalletId = crypto.randomUUID();
    const now = new Date().toISOString();

    const walletRecord: WalletRecord = {
      id: newWalletId,
      user_id: userId,
      wallet_name: "Main Wallet",
      wallet_address: address,
      primary_network: "Ethereum",
      encrypted_private_key: encryptedPrivateKey,
      encrypted_mnemonic: encryptedMnemonic,
      wallet_version: "v1.0",
      created_at: now,
      updated_at: now,
    };

    // 4. Store in Supabase if configured
    if (isSupabaseConfigured) {
      try {
        // Double check existing wallet in DB before insert
        const { data: dbCheck } = await supabase
          .from("wallets")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (dbCheck) {
          const existingWallet = await this.getWallet(userId);
          if (existingWallet) {
            return { wallet: existingWallet, isNew: false };
          }
        }

        const { error: walletErr } = await supabase.from("wallets").insert({
          id: walletRecord.id,
          user_id: walletRecord.user_id,
          wallet_name: walletRecord.wallet_name,
          wallet_address: walletRecord.wallet_address,
          primary_network: walletRecord.primary_network,
          encrypted_private_key: walletRecord.encrypted_private_key,
          encrypted_mnemonic: walletRecord.encrypted_mnemonic,
          wallet_version: walletRecord.wallet_version,
        });

        if (walletErr) {
          console.error("Failed to insert wallet into Supabase:", walletErr);
        }

        // Insert default wallet settings
        const { error: settingsErr } = await supabase.from("wallet_settings").insert({
          user_id: userId,
          default_wallet: walletRecord.id,
          preferred_network: "Ethereum",
          currency: "USD",
          language: "en",
          theme: "dark",
          biometric_enabled: false,
          auto_lock_minutes: 5,
        });

        if (settingsErr) {
          console.error("Failed to insert wallet settings:", settingsErr);
        }

        // Log activity
        const { error: logErr } = await supabase.from("activity_logs").insert({
          user_id: userId,
          action: "WALLET_CREATED",
          description: `HD Wallet initialized (${address.slice(0, 6)}...${address.slice(-4)})`,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });

        if (logErr) {
          console.error("Failed to log wallet creation activity:", logErr);
        }
      } catch (err) {
        console.error("Error writing to Supabase during wallet creation:", err);
      }
    }

    // Mirror to local storage for instant offline/demo mode access
    if (typeof window !== "undefined") {
      try {
        const localWallets = JSON.parse(localStorage.getItem(LOCAL_WALLETS_KEY) || "{}");
        if (!localWallets[userId]) {
          localWallets[userId] = walletRecord;
          localStorage.setItem(LOCAL_WALLETS_KEY, JSON.stringify(localWallets));
        }

        if (mnemonicPhrase) {
          sessionStorage.setItem(`tori_mnemonic_${userId}`, mnemonicPhrase);
        }

        const localSettings = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || "{}");
        if (!localSettings[userId]) {
          localSettings[userId] = {
            id: crypto.randomUUID(),
            user_id: userId,
            default_wallet: walletRecord.id,
            preferred_network: "Ethereum",
            currency: "USD",
            language: "en",
            theme: "dark",
            biometric_enabled: false,
            auto_lock_minutes: 5,
          };
          localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(localSettings));
        }

        const localLogs = JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY) || "[]");
        localLogs.unshift({
          id: crypto.randomUUID(),
          user_id: userId,
          action: "WALLET_CREATED",
          description: `HD Wallet initialized (${address.slice(0, 6)}...${address.slice(-4)})`,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
          created_at: now,
        });
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs.slice(0, 50)));
      } catch (e) {
        console.error("Failed to write wallet to local storage:", e);
      }
    }

    return {
      wallet: walletRecord,
      mnemonicPhrase,
      isNew: true,
    };
  },

  /**
   * Get decrypted mnemonic for recovery display
   */
  async getMnemonic(userId: string): Promise<string | null> {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(`tori_mnemonic_${userId}`);
      if (cached) return cached;
    }

    const wallet = await this.getWallet(userId);
    if (!wallet || !wallet.encrypted_mnemonic) return null;

    try {
      return await decryptData(userId, wallet.encrypted_mnemonic);
    } catch (e) {
      console.error("Failed to decrypt mnemonic:", e);
      return null;
    }
  },

  /**
   * Log an activity for the user
   */
  async logActivity(userId: string, action: string, description: string): Promise<void> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase.from("activity_logs").insert({
          user_id: userId,
          action,
          description,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });
      } catch (err) {
        console.error("Failed to log activity:", err);
      }
    }
    if (typeof window !== "undefined") {
      try {
        const localLogs = JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY) || "[]");
        localLogs.unshift({
          id: crypto.randomUUID(),
          user_id: userId,
          action,
          description,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
          created_at: now,
        });
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs.slice(0, 50)));
      } catch (e) {
        // ignore
      }
    }
  },
};
