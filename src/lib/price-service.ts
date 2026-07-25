export interface TokenPrice {
  price: number;
  change24h: number; // in percentage
}

export type TokenPrices = Record<string, TokenPrice>;

class PriceService {
  private cache: { data: TokenPrices; expiresAt: number } | null = null;
  private CACHE_DURATION_MS = 60000; // 60 seconds cache

  // Static fallback prices in case all APIs fail
  private FALLBACK_PRICES: TokenPrices = {
    ethereum: { price: 3400.0, change24h: 0.0 },
    arbitrum: { price: 0.85, change24h: 0.0 },
    tether: { price: 1.0, change24h: 0.0 },
    "usd-coin": { price: 1.0, change24h: 0.0 },
    "wrapped-bitcoin": { price: 64000.0, change24h: 0.0 },
    dai: { price: 1.0, change24h: 0.0 },
  };

  async getETHPrice(): Promise<TokenPrice> {
    const prices = await this.getTokenPrices();
    return prices["ethereum"] || this.FALLBACK_PRICES["ethereum"];
  }

  async getTokenPrices(): Promise<TokenPrices> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.data;
    }

    const prices = await this.fetchPricesWithFallback();
    this.cache = {
      data: prices,
      expiresAt: Date.now() + this.CACHE_DURATION_MS,
    };
    return prices;
  }

  private async fetchPricesWithFallback(): Promise<TokenPrices> {
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

    // 1. CoinGecko Multi-price
    try {
      const ids = ["ethereum", "arbitrum", "tether", "usd-coin", "wrapped-bitcoin", "dai"].join(
        ",",
      );
      const res = await fetchWithTimeout(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      );
      if (res.ok) {
        const data = await res.json();
        const prices: TokenPrices = {};

        for (const id of ["ethereum", "arbitrum", "tether", "usd-coin", "wrapped-bitcoin", "dai"]) {
          if (data[id] && typeof data[id].usd === "number") {
            prices[id] = {
              price: data[id].usd,
              change24h: data[id].usd_24h_change || 0,
            };
          } else {
            prices[id] = this.FALLBACK_PRICES[id];
          }
        }
        return prices;
      }
    } catch (e) {
      console.warn(
        "CoinGecko multi-price fetch failed, attempting Binance fallback for standard pairs...",
        e,
      );
    }

    // 2. Fallback to Binance
    try {
      const binanceSymbols: Record<string, string> = {
        ethereum: "ETHUSDT",
        "wrapped-bitcoin": "BTCUSDT",
        arbitrum: "ARBUSDT",
      };

      const prices = { ...this.FALLBACK_PRICES };

      await Promise.allSettled(
        Object.entries(binanceSymbols).map(async ([id, symbol]) => {
          try {
            const res = await fetchWithTimeout(
              `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.lastPrice && data.priceChangePercent) {
                prices[id] = {
                  price: parseFloat(data.lastPrice),
                  change24h: parseFloat(data.priceChangePercent),
                };
              }
            }
          } catch (err) {
            console.warn(`Binance fetch failed for ${symbol}:`, err);
          }
        }),
      );

      return prices;
    } catch (e) {
      console.warn("Binance fallback failed, returning static fallback prices", e);
    }

    return this.FALLBACK_PRICES;
  }
}

export const priceService = new PriceService();
