import { blockchainService } from "@/lib/wallet/blockchain";
import { PortfolioBalance } from "./types";

export interface IPortfolioRepository {
  getBalances(walletAddress: string): Promise<PortfolioBalance[]>;
}

export class PortfolioRepository implements IPortfolioRepository {
  async getBalances(walletAddress: string): Promise<PortfolioBalance[]> {
    if (!walletAddress) return [];

    try {
      const ethResult = await blockchainService.getBalance(walletAddress);
      const balanceNum = parseFloat(ethResult.formatted) || 0;

      return [
        {
          asset: {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
            color: "#627EEA",
            chain: "Arbitrum One",
          },
          balance: balanceNum,
          fiatValue: 0,
          priceChange24h: 0,
        },
      ];
    } catch {
      return [];
    }
  }
}

export const portfolioRepository = new PortfolioRepository();
