import { tokenService } from "@/lib/tokenService";
import { PortfolioBalance } from "./types";

export interface IPortfolioRepository {
  getBalances(walletAddress: string): Promise<PortfolioBalance[]>;
}

export class PortfolioRepository implements IPortfolioRepository {
  async getBalances(walletAddress: string): Promise<PortfolioBalance[]> {
    if (!walletAddress) return [];

    try {
      const balances = await tokenService.getTokenBalances(walletAddress);

      return balances.map((b) => ({
        asset: {
          id: b.metadata.id,
          networkId: "arbitrum",
          contractAddress: b.metadata.contractAddress,
          symbol: b.metadata.symbol,
          name: b.metadata.name,
          decimals: b.metadata.decimals,
          logoUrl: b.metadata.logoUrl,
          color: b.metadata.color,
        },
        balanceRaw: b.balanceRaw,
        balanceFormatted: b.balanceFormatted,
        balanceNum: b.balanceNum,
        fiatPrice: b.fiatPrice,
        fiatValue: b.fiatValue,
        priceChange24h: b.priceChange24h,
      }));
    } catch (err) {
      console.error("PortfolioRepository.getBalances error:", err);
      return [];
    }
  }
}

export const portfolioRepository = new PortfolioRepository();
