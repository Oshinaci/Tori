import { encryptData, decryptData, generateWallet, isValidAddress } from "./crypto";
import { walletRepository } from "./repository";
import { WalletRecord } from "./types";

export class WalletEngine {
  private static instance: WalletEngine;
  private currentWalletCache: Record<string, WalletRecord> = {};

  private constructor() {}

  public static getInstance(): WalletEngine {
    if (!WalletEngine.instance) {
      WalletEngine.instance = new WalletEngine();
    }
    return WalletEngine.instance;
  }

  /**
   * Load Wallet
   * Fetches the wallet from cache or repository.
   */
  async loadWallet(userId: string): Promise<WalletRecord | null> {
    if (this.currentWalletCache[userId]) {
      return this.currentWalletCache[userId];
    }

    const wallet = await walletRepository.getWallet(userId);
    if (wallet) {
      this.currentWalletCache[userId] = wallet;
    }
    return wallet;
  }

  /**
   * Generate Wallet
   * Strictly avoids duplicate wallet generation and never overwrites an existing wallet.
   */
  async generateWallet(
    userId: string,
  ): Promise<{ wallet: WalletRecord; mnemonicPhrase?: string; isNew: boolean }> {
    if (!userId) {
      throw new Error("User ID is required to generate wallet.");
    }

    // 1. Check if wallet already exists
    const existing = await this.loadWallet(userId);
    if (existing) {
      return { wallet: existing, isNew: false };
    }

    // 2. Generate HD Wallet via crypto layer
    const generated = generateWallet();

    if (!isValidAddress(generated.address)) {
      throw new Error("Generated address is invalid");
    }

    // 3. Encrypt mnemonic and private key
    const encryptedPrivateKey = await encryptData(userId, generated.privateKey);
    const encryptedMnemonic = generated.mnemonicPhrase
      ? await encryptData(userId, generated.mnemonicPhrase)
      : "";

    const newWalletId = crypto.randomUUID();
    const now = new Date().toISOString();

    const walletRecord: WalletRecord = {
      id: newWalletId,
      user_id: userId,
      wallet_name: "Main Wallet",
      wallet_address: generated.address,
      primary_network: "Arbitrum One",
      encrypted_private_key: encryptedPrivateKey,
      encrypted_mnemonic: encryptedMnemonic,
      wallet_version: "v1.0",
      is_default: true,
      created_at: now,
      updated_at: now,
    };

    try {
      // Double check before saving
      const doubleCheck = await walletRepository.getWallet(userId);
      if (doubleCheck) {
        return { wallet: doubleCheck, isNew: false };
      }

      // 4. Save to Repository
      await walletRepository.saveWallet(walletRecord);

      // Update cache
      this.currentWalletCache[userId] = walletRecord;

      // Save default settings
      await walletRepository.saveSettings({
        id: crypto.randomUUID(),
        user_id: userId,
        default_wallet: walletRecord.id,
        preferred_network: "Arbitrum One",
        currency: "USD",
        language: "en",
        theme: "dark",
        biometric_enabled: false,
        auto_lock_minutes: 5,
        created_at: now,
        updated_at: now,
      });

      // Log activity
      await this.logActivity(
        userId,
        "WALLET_CREATED",
        `HD Wallet initialized (${generated.address.slice(0, 6)}...${generated.address.slice(-4)})`,
      );

      if (generated.mnemonicPhrase) {
        walletRepository.cacheMnemonic(userId, generated.mnemonicPhrase);
      }

      return {
        wallet: walletRecord,
        mnemonicPhrase: generated.mnemonicPhrase,
        isNew: true,
      };
    } catch (e) {
      console.error("Wallet generation failed, rolling back:", e);
      // Evict cache
      delete this.currentWalletCache[userId];
      // Rollback database writes
      try {
        await walletRepository.deleteWallet(userId);
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
      throw new Error("Wallet initialization failed. Please try again.");
    }
  }

  /**
   * Get decrypted mnemonic for recovery display
   */
  async decryptMnemonic(userId: string): Promise<string | null> {
    const cached = walletRepository.getCachedMnemonic(userId);
    if (cached) return cached;

    const wallet = await this.loadWallet(userId);
    if (!wallet || !wallet.encrypted_mnemonic) return null;

    try {
      return await decryptData(userId, wallet.encrypted_mnemonic);
    } catch (e) {
      console.error("Failed to decrypt mnemonic:", e);
      return null;
    }
  }

  /**
   * Log an activity for the user
   */
  async logActivity(userId: string, action: string, description: string): Promise<void> {
    await walletRepository.saveLog({
      user_id: userId,
      action,
      description,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
      created_at: new Date().toISOString(),
    });
  }
}
