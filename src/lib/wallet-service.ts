import { WalletEngine } from "./wallet/engine";
import type { WalletRecord } from "./wallet/types";

// Maintain backward compatibility with existing imports
const engine = WalletEngine.getInstance();

export const walletService = {
  getWallet: (userId: string) => engine.loadWallet(userId),
  getOrCreateWallet: (userId: string) => engine.generateWallet(userId),
  getMnemonic: (userId: string) => engine.decryptMnemonic(userId),
  logActivity: (userId: string, action: string, description: string) =>
    engine.logActivity(userId, action, description),
};

export type { WalletRecord };
