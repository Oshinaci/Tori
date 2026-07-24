import { motion } from "framer-motion";
import { ASSETS, fmtUsd } from "./data";

export function AssetList({ limit }: { limit?: number }) {
  const items = limit ? ASSETS.slice(0, limit) : ASSETS;
  return (
    <ul className="glass mt-3 divide-y divide-white/5 overflow-hidden rounded-3xl">
      {items.map((a, i) => {
        const value = a.price * a.balance;
        const up = a.change24h >= 0;
        return (
          <motion.li
            key={a.symbol}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
              style={{ background: a.color }}
              aria-hidden
            >
              {a.symbol.slice(0, 3)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{a.name}</p>
                <p className="text-sm font-semibold">{fmtUsd(value)}</p>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {a.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {a.symbol}
                </span>
                <span className={up ? "text-emerald-400" : "text-red-400"}>
                  {up ? "+" : ""}
                  {a.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
