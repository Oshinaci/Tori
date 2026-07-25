export type NetworkId = "ethereum" | "arbitrum" | "optimism" | "base" | "polygon";

export interface Asset {
  id: string; // Internal UUID or unique string
  networkId: NetworkId;
  contractAddress: string | null; // null for native token
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string | null;
  color?: string; // For UI allocation charts
}

export interface PortfolioBalance {
  asset: Asset;
  balanceRaw: string; // Raw BigInt as string
  balanceFormatted: string; // Human readable
  balanceNum: number; // For easy math
  fiatPrice: number;
  fiatValue: number;
  priceChange24h: number; // percentage
}

export interface PortfolioSummary {
  totalFiatValue: number;
  totalChange24h: number; // Absolute fiat value change
  totalChange24hPct: number; // Percentage change
  balances: PortfolioBalance[];
}
