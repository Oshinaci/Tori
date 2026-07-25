import { IPortfolioRepository, portfolioRepository } from "./portfolio-repository";
import { PortfolioSummary } from "./types";

export class PortfolioService {
  constructor(private repo: IPortfolioRepository) {}

  async getPortfolio(walletAddress: string | undefined | null): Promise<PortfolioSummary> {
    if (!walletAddress) {
      return {
        totalFiatValue: 0,
        totalChange24h: 0,
        totalChange24hPct: 0,
        balances: [],
      };
    }

    const balances = await this.repo.getBalances(walletAddress);

    let totalFiatValue = 0;
    let totalPastFiatValue = 0; // Value 24h ago

    balances.forEach((b) => {
      totalFiatValue += b.fiatValue;
      // Reverse engineer past value: current = past * (1 + change/100)
      // past = current / (1 + change/100)
      const pastValue = b.fiatValue / (1 + b.priceChange24h / 100);
      totalPastFiatValue += pastValue;
    });

    const totalChange24h = totalFiatValue - totalPastFiatValue;
    const totalChange24hPct =
      totalPastFiatValue > 0 ? (totalChange24h / totalPastFiatValue) * 100 : 0;

    return {
      totalFiatValue,
      totalChange24h,
      totalChange24hPct,
      balances,
    };
  }
}

export const portfolioService = new PortfolioService(portfolioRepository);

/**
 * Calculate total USD portfolio value by summing every asset owned by the wallet using live market prices.
 */
export async function calculatePortfolioValue(walletAddress?: string | null): Promise<number> {
  if (!walletAddress) return 0;
  try {
    const summary = await portfolioService.getPortfolio(walletAddress);
    return summary.totalFiatValue;
  } catch (err) {
    console.warn("calculatePortfolioValue error:", err);
    return 0;
  }
}
