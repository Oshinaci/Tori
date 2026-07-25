import { blockchainService } from "@/lib/wallet/blockchain";
import { priceService } from "@/lib/price-service";
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

      let fiatPrice = 3400;
      let priceChange24h = 0;
      try {
        const livePrice = await priceService.getETHPrice();
        fiatPrice = livePrice.price;
        priceChange24h = livePrice.change24h;
      } catch (err) {
        console.warn("Failed to fetch live ETH price, using fallback:", err);
      }

      const fiatValue = balanceNum * fiatPrice;

      return [
        {
          asset: {
            id: "ethereum",
            networkId: "arbitrum",
            contractAddress: null,
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
            logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
            color: "#627EEA",
          },
          balanceRaw: ethResult.rawWei,
          balanceFormatted: ethResult.formatted,
          balanceNum: balanceNum,
          fiatPrice,
          fiatValue,
          priceChange24h,
        },
      ];
    } catch (err) {
      console.error("PortfolioRepository.getBalances error:", err);
      return [];
    }
  }
}

export const portfolioRepository = new PortfolioRepository();
