import { JsonRpcProvider, formatEther, isAddress, formatUnits } from "ethers";
import { ARBITRUM_ONE, NetworkConfig } from "./network";

export interface RpcHealthStatus {
  isHealthy: boolean;
  chainId: number;
  activeRpcUrl: string;
  latencyMs: number;
  error?: string;
}

export interface BalanceResult {
  formatted: string;
  symbol: string;
  rawWei: string;
  lastUpdated: string;
}

export class BlockchainService {
  private static instance: BlockchainService;
  private networkConfig: NetworkConfig = ARBITRUM_ONE;
  private currentProvider: JsonRpcProvider | null = null;
  private currentRpcIndex: number = 0;
  private lastHealthStatus: RpcHealthStatus | null = null;

  private constructor() {}

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  /**
   * Get an active JsonRpcProvider with failover support across primary & fallback endpoints
   */
  async getProvider(): Promise<JsonRpcProvider> {
    if (this.currentProvider) {
      return this.currentProvider;
    }

    const rpcUrls = this.networkConfig.rpcUrls;
    let lastError: Error | null = null;

    for (let i = 0; i < rpcUrls.length; i++) {
      const index = (this.currentRpcIndex + i) % rpcUrls.length;
      const url = rpcUrls[index];

      try {
        const provider = new JsonRpcProvider(url, {
          chainId: this.networkConfig.chainId,
          name: "arbitrum",
        });

        // 5-second connection timeout per endpoint
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("RPC Connection Timeout")), 5000),
        );

        const network = await Promise.race([provider.getNetwork(), timeoutPromise]);

        if (Number(network.chainId) === this.networkConfig.chainId) {
          this.currentProvider = provider;
          this.currentRpcIndex = index;
          return provider;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`RPC endpoint failed [${url}]:`, lastError.message);
      }
    }

    throw new Error(
      `Failed to connect to any Arbitrum One RPC endpoint. ${lastError?.message || ""}`,
    );
  }

  /**
   * Reset cached provider to trigger failover to the next RPC endpoint
   */
  resetProvider() {
    this.currentProvider = null;
    this.currentRpcIndex = (this.currentRpcIndex + 1) % this.networkConfig.rpcUrls.length;
  }

  /**
   * Check RPC Health and Network Verification
   */
  async checkHealth(): Promise<RpcHealthStatus> {
    const start = Date.now();
    try {
      const provider = await this.getProvider();
      const network = await provider.getNetwork();
      const latencyMs = Date.now() - start;
      const chainId = Number(network.chainId);

      const status: RpcHealthStatus = {
        isHealthy: chainId === this.networkConfig.chainId,
        chainId,
        activeRpcUrl: this.networkConfig.rpcUrls[this.currentRpcIndex],
        latencyMs,
      };
      this.lastHealthStatus = status;
      return status;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Connection failed";
      const status: RpcHealthStatus = {
        isHealthy: false,
        chainId: 0,
        activeRpcUrl: this.networkConfig.rpcUrls[this.currentRpcIndex] || "",
        latencyMs: Date.now() - start,
        error: errMsg,
      };
      this.lastHealthStatus = status;
      return status;
    }
  }

  /**
   * Fetch Live Native ETH Balance for a Wallet Address
   */
  async getBalance(address: string): Promise<BalanceResult> {
    if (!address || !isAddress(address)) {
      throw new Error("Invalid EVM wallet address");
    }

    let retries = 2;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        const provider = await this.getProvider();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("getBalance Timeout")), 6000),
        );

        const balanceWei = await Promise.race([provider.getBalance(address), timeoutPromise]);

        const formatted = formatEther(balanceWei);

        return {
          formatted,
          symbol: this.networkConfig.nativeToken,
          rawWei: balanceWei.toString(),
          lastUpdated: new Date().toISOString(),
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn("getBalance attempt failed, cycling RPC provider...", lastError.message);
        this.resetProvider();
        retries--;
      }
    }

    throw new Error(
      `Unable to fetch balance from Arbitrum One RPC: ${lastError?.message || "RPC unavailable"}`,
    );
  }

  /**
   * Fetch Current Block Number
   */
  async getBlockNumber(): Promise<number> {
    const provider = await this.getProvider();
    return await provider.getBlockNumber();
  }

  /**
   * Fetch Current Gas Price in Gwei
   */
  async getGasPrice(): Promise<string> {
    const provider = await this.getProvider();
    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) return "0";
    return formatUnits(feeData.gasPrice, "gwei");
  }

  /**
   * Get Network Config
   */
  getNetwork(): NetworkConfig {
    return this.networkConfig;
  }

  /**
   * Get Last Checked Health Status
   */
  getLastHealthStatus(): RpcHealthStatus | null {
    return this.lastHealthStatus;
  }
}

export const blockchainService = BlockchainService.getInstance();
