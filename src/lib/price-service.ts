export interface TokenPrice {
  price: number;
  change24h: number; // in percentage
}

class PriceService {
  private cache: Record<string, { data: TokenPrice; expiresAt: number }> = {};
  private CACHE_DURATION_MS = 60000; // 60 seconds cache

  async getETHPrice(): Promise<TokenPrice> {
    const cached = this.cache["ETH"];
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const price = await this.fetchETHPriceWithFallback();
    this.cache["ETH"] = {
      data: price,
      expiresAt: Date.now() + this.CACHE_DURATION_MS,
    };
    return price;
  }

  private async fetchETHPriceWithFallback(): Promise<TokenPrice> {
    // Helper for fetch with timeout
    const fetchWithTimeout = async (url: string, timeoutMs = 3000): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    // 1. CoinGecko
    try {
      const res = await fetchWithTimeout(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ethereum && typeof data.ethereum.usd === "number") {
          return {
            price: data.ethereum.usd,
            change24h: data.ethereum.usd_24h_change || 0,
          };
        }
      }
    } catch (e) {
      console.warn("CoinGecko price fetch failed, trying Binance...", e);
    }

    // 2. Binance
    try {
      const res = await fetchWithTimeout(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT",
      );
      if (res.ok) {
        const data = await res.json();
        if (data.lastPrice && data.priceChangePercent) {
          return {
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
          };
        }
      }
    } catch (e) {
      console.warn("Binance price fetch failed, trying CryptoCompare...", e);
    }

    // 3. CryptoCompare
    try {
      const res = await fetchWithTimeout(
        "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD",
      );
      if (res.ok) {
        const data = await res.json();
        if (data.RAW?.ETH?.USD) {
          const ethUsd = data.RAW.ETH.USD;
          return {
            price: ethUsd.PRICE,
            change24h: ethUsd.CHANGEPCT24HOUR || 0,
          };
        }
      }
    } catch (e) {
      console.warn("CryptoCompare price fetch failed, using fallback static price", e);
    }

    // Static fallback if all APIs fail
    return {
      price: 3400.0,
      change24h: 0.0,
    };
  }
}

export const priceService = new PriceService();
