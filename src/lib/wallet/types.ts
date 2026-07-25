export interface WalletRecord {
  id: string;
  user_id: string;
  wallet_name: string;
  wallet_address: string;
  primary_network: string;
  encrypted_private_key: string;
  encrypted_mnemonic?: string;
  wallet_version: string;
  is_default?: boolean;
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
