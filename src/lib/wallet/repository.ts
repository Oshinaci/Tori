import { supabase, isSupabaseConfigured } from "../supabase";
import { WalletRecord, WalletSettingsRecord, ActivityLogRecord } from "./types";

const LOCAL_WALLETS_KEY = "tori_local_wallets";
const LOCAL_SETTINGS_KEY = "tori_local_wallet_settings";
const LOCAL_LOGS_KEY = "tori_local_activity_logs";

export const walletRepository = {
  async getWallet(userId: string): Promise<WalletRecord | null> {
    if (!userId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (!error && data) {
          return data as WalletRecord;
        }
      } catch (e) {
        console.error("Supabase query error:", e);
      }
    }

    // Local Storage Fallback
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

  async saveWallet(walletRecord: WalletRecord): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("wallets").insert({
        id: walletRecord.id,
        user_id: walletRecord.user_id,
        wallet_name: walletRecord.wallet_name,
        wallet_address: walletRecord.wallet_address,
        primary_network: walletRecord.primary_network,
        encrypted_private_key: walletRecord.encrypted_private_key,
        encrypted_mnemonic: walletRecord.encrypted_mnemonic,
        wallet_version: walletRecord.wallet_version,
      });

      if (error) {
        throw new Error(`Failed to insert wallet into Supabase: ${error.message}`);
      }
    }

    if (typeof window !== "undefined") {
      const localWallets = JSON.parse(localStorage.getItem(LOCAL_WALLETS_KEY) || "{}");
      localWallets[walletRecord.user_id] = walletRecord;
      localStorage.setItem(LOCAL_WALLETS_KEY, JSON.stringify(localWallets));
    }
  },

  async saveSettings(settings: WalletSettingsRecord): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("wallet_settings").insert({
        user_id: settings.user_id,
        default_wallet: settings.default_wallet,
        preferred_network: settings.preferred_network,
        currency: settings.currency,
        language: settings.language,
        theme: settings.theme,
        biometric_enabled: settings.biometric_enabled,
        auto_lock_minutes: settings.auto_lock_minutes,
      });
      if (error) {
        console.error("Failed to insert wallet settings:", error);
      }
    }

    if (typeof window !== "undefined") {
      const localSettings = JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || "{}");
      localSettings[settings.user_id] = settings;
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(localSettings));
    }
  },

  async saveLog(log: ActivityLogRecord): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("activity_logs").insert({
        user_id: log.user_id,
        action: log.action,
        description: log.description,
        user_agent: log.user_agent,
      });
      if (error) {
        console.error("Failed to log wallet activity:", error);
      }
    }

    if (typeof window !== "undefined") {
      const localLogs = JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY) || "[]");
      localLogs.unshift({
        ...log,
        id: log.id || crypto.randomUUID(),
        created_at: log.created_at || new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs.slice(0, 50)));
    }
  },

  cacheMnemonic(userId: string, mnemonic: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`tori_mnemonic_${userId}`, mnemonic);
    }
  },

  getCachedMnemonic(userId: string): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`tori_mnemonic_${userId}`);
    }
    return null;
  },
};
