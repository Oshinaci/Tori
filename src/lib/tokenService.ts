import { blockchainService } from "./wallet/blockchain";
import { priceService } from "./price-service";
import { Contract, formatUnits, isAddress } from "ethers";

export interface TokenMetadata {
  id: string; // CoinGecko id
  symbol: string;
  name: string;
  decimals: number;
  contractAddress: string | null; // null for native ETH
  logoUrl: string;
  color: string;
}

export interface TokenBalance {
  metadata: TokenMetadata;
  balanceRaw: string;
  balanceFormatted: string;
  balanceNum: number;
  fiatPrice: number;
  fiatValue: number;
  priceChange24h: number;
}

const SUPPORTED_TOKENS: TokenMetadata[] = [
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    contractAddress: null,
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    color: "#627EEA",
  },
  {
    id: "arbitrum",
    symbol: "ARB",
    name: "Arbitrum",
    decimals: 18,
    contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    logoUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    color: "#12AAFF",
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    color: "#26A17B",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USDC",
    decimals: 6,
    contractAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    color: "#2775CA",
  },
  {
    id: "wrapped-bitcoin",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    contractAddress: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    logoUrl: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
    color: "#F7931A",
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    decimals: 18,
    contractAddress: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    logoUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
    color: "#F2A900",
  },
];

const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];

export class TokenService {
  private static instance: TokenService;

  private constructor() {}

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  getSupportedTokens(): TokenMetadata[] {
    return SUPPORTED_TOKENS;
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    if (!walletAddress || !isAddress(walletAddress)) {
      return [];
    }

    let provider;
    try {
      provider = await blockchainService.getProvider();
    } catch (err) {
      console.error("Provider initialization failed in getTokenBalances:", err);
      // Fallback prices and empty balances if RPC completely down
      const prices = await priceService.getTokenPrices();
      return SUPPORTED_TOKENS.map((token) => {
        const priceInfo = prices[token.id] || { price: 0, change24h: 0 };
        return {
          metadata: token,
          balanceRaw: "0",
          balanceFormatted: "0.0",
          balanceNum: 0,
          fiatPrice: priceInfo.price,
          fiatValue: 0,
          priceChange24h: priceInfo.change24h,
        };
      });
    }

    const prices = await priceService.getTokenPrices();

    const balancePromises = SUPPORTED_TOKENS.map(async (token) => {
      try {
        let rawWei: string;
        let formatted: string;

        if (token.contractAddress === null) {
          // Native ETH
          const ethResult = await blockchainService.getBalance(walletAddress);
          rawWei = ethResult.rawWei;
          formatted = ethResult.formatted;
        } else {
          // ERC-20 Token
          const contract = new Contract(token.contractAddress, ERC20_ABI, provider);
          // Standard 3-second timeout for contract calls to keep responsiveness high
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`ERC20 Balance timeout for ${token.symbol}`)), 3000),
          );
          const rawBalance = await Promise.race([
            contract.balanceOf(walletAddress),
            timeoutPromise,
          ]);
          rawWei = rawBalance.toString();
          formatted = formatUnits(rawBalance, token.decimals);
        }

        const balanceNum = parseFloat(formatted) || 0;
        const priceInfo = prices[token.id] || { price: 0, change24h: 0 };
        const fiatValue = balanceNum * priceInfo.price;

        return {
          metadata: token,
          balanceRaw: rawWei,
          balanceFormatted: formatted,
          balanceNum,
          fiatPrice: priceInfo.price,
          fiatValue,
          priceChange24h: priceInfo.change24h,
        };
      } catch (error) {
        console.warn(`Failed to fetch balance for token ${token.symbol}:`, error);
        const priceInfo = prices[token.id] || { price: 0, change24h: 0 };
        return {
          metadata: token,
          balanceRaw: "0",
          balanceFormatted: "0.0",
          balanceNum: 0,
          fiatPrice: priceInfo.price,
          fiatValue: 0,
          priceChange24h: priceInfo.change24h,
        };
      }
    });

    return await Promise.all(balancePromises);
  }

  getTokenMetadata(symbol: string): TokenMetadata | undefined {
    return SUPPORTED_TOKENS.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
  }
}

export const tokenService = TokenService.getInstance();
