import { useState } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, TrendingDown, Search, Plus, Sparkles } from "lucide-react";
import { INITIAL_WATCHLIST, WatchlistItem, fmtUsd } from "./data";
import { toast } from "sonner";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={positive ? "#34D399" : "#F87171"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);
  const [search, setSearch] = useState("");

  const togglePin = (symbol: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.symbol === symbol) {
          const nextState = !item.isPinned;
          toast.success(
            nextState
              ? `Added ${symbol} to pinned watchlist`
              : `Removed ${symbol} from pinned watchlist`,
          );
          return { ...item, isPinned: nextState };
        }
        return item;
      }),
    );
  };

  const filtered = items.filter(
    (item) =>
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-3 space-y-3">
      {/* Search & Quick filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search watchlist assets..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <ul className="glass divide-y divide-white/5 rounded-3xl overflow-hidden">
        {filtered.map((item, index) => {
          const up = item.change24h >= 0;
          return (
            <motion.li
              key={item.symbol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => togglePin(item.symbol)}
                  className="text-muted-foreground hover:text-amber-400 transition-colors p-1"
                  title={item.isPinned ? "Unpin asset" : "Pin asset"}
                >
                  <Star
                    className={`h-4 w-4 ${item.isPinned ? "fill-amber-400 text-amber-400" : ""}`}
                  />
                </button>

                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold text-white text-xs shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  {item.symbol.slice(0, 3)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-1.5 py-0.5 rounded-md">
                      {item.symbol}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Vol: {item.volume24h}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <Sparkline data={item.sparkline} positive={up} />
                </div>

                <div>
                  <div className="font-mono text-sm font-semibold">
                    {item.price < 1 ? `$${item.price}` : fmtUsd(item.price)}
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-xs font-medium ${
                      up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}
                    {item.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}

        {filtered.length === 0 && (
          <li className="p-6 text-center text-xs text-muted-foreground">
            No watchlist items match "{search}".
          </li>
        )}
      </ul>
    </div>
  );
}
