import { motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { AssetList } from "./AssetList";
import { ASSETS, fmtUsd, pnl24h, totalBalance } from "./data";

export function PortfolioPage() {
  const positive = pnl24h >= 0;
  // Allocation bar
  const segments = ASSETS.map((a) => ({
    symbol: a.symbol,
    color: a.color,
    pct: ((a.price * a.balance) / totalBalance) * 100,
  })).sort((a, b) => b.pct - a.pct);

  return (
    <>
      <TopBar title="Portfolio" />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass mt-4 rounded-3xl p-5"
      >
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Net worth</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{fmtUsd(totalBalance)}</p>
        <p className={`mt-1 text-xs ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? "+" : ""}
          {fmtUsd(pnl24h)} today
        </p>

        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/5">
          {segments.map((s) => (
            <span
              key={s.symbol}
              style={{ width: `${s.pct}%`, background: s.color }}
              className="h-full"
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {segments.map((s) => (
            <span key={s.symbol} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.symbol} · {s.pct.toFixed(1)}%
            </span>
          ))}
        </div>
      </motion.section>

      <h2 className="mt-8 text-base font-semibold">All assets</h2>
      <AssetList />
    </>
  );
}
