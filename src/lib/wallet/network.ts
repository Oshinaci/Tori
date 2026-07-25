export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  nativeToken: string;
  rpcUrl: string;
  rpcUrls: string[];
  explorerUrl: string;
}

export const ARBITRUM_ONE: NetworkConfig = {
  id: "arbitrum-one",
  name: "Arbitrum One",
  chainId: 42161,
  nativeToken: "ETH",
  rpcUrl: "https://arb1.arbitrum.io/rpc",
  rpcUrls: [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum.llamarpc.com",
    "https://1rpc.io/arb",
    "https://rpc.ankr.com/arbitrum",
  ],
  explorerUrl: "https://arbiscan.io",
};

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  [ARBITRUM_ONE.id]: ARBITRUM_ONE,
  "42161": ARBITRUM_ONE,
};

export const DEFAULT_NETWORK = ARBITRUM_ONE;

/**
 * Get network configuration by ID
 */
export function getNetworkConfig(networkId: string): NetworkConfig {
  return SUPPORTED_NETWORKS[networkId] || DEFAULT_NETWORK;
}
