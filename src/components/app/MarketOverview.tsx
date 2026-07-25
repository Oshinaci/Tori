import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Layers, ArrowUpDown } from "lucide-react";
import { MARKET_ITEMS, MarketItem, fmtUsd } from "./data";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = ["All", "DeFi", "Layer 1", "Meme", "AI"] as const;

export function MarketOverview() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"rank" | "change">("rank");
  const { t } = useLanguage();

  let filtered = MARKET_ITEMS.filter((item) =>
    selectedCategory === "All" ? true : item.category === selectedCategory,
  );

  if (sortBy === "change") {
    filtered = [...filtered].sort((a, b) => b.change24h - a.change24h);
  } else {
    filtered = [...filtered].sort((a, b) => a.rank - b.rank);
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Category Pills & Sort Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "gradient-brand text-white shadow-premium"
                  : "glass text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSortBy((s) => (s === "rank" ? "change" : "rank"))}
          className="glass shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortBy === "rank" ? t("byRank", "By Rank") : t("topGainers", "Top Gainers")}
        </button>
      </div>

      {/* Market Tokens List */}
      <div className="glass rounded-3xl overflow-hidden divide-y divide-white/5">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider bg-white/5">
          <span className="col-span-1">#</span>
          <span className="col-span-6">{t("assets", "Asset")}</span>
          <span className="col-span-5 text-right">{t("price", "Price")} / 24h</span>
        </div>

        {filtered.map((m, index) => {
          const up = m.change24h >= 0;
          return (
            <motion.div
              key={m.symbol}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="grid grid-cols-12 items-center px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <span className="col-span-1 font-mono text-xs text-muted-foreground">{m.rank}</span>

              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold text-white text-[10px]"
                  style={{ backgroundColor: m.color }}
                >
                  {m.symbol.slice(0, 3)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs truncate">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.2 rounded font-mono">
                      {m.symbol}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.category}</span>
                </div>
              </div>

              <div className="col-span-5 text-right font-mono">
                <div className="text-xs font-semibold">
                  {m.price < 0.001
                    ? `$${m.price}`
                    : m.price < 1
                      ? `$${m.price.toFixed(2)}`
                      : fmtUsd(m.price)}
                </div>
                <div
                  className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                    up ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {up ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {up ? "+" : ""}
                  {m.change24h.toFixed(2)}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
