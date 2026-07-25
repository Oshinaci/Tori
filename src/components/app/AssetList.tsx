import { memo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PortfolioBalance } from "@/lib/portfolio";
import { Coins, ArrowDownToLine } from "lucide-react";

interface AssetListProps {
  balances: PortfolioBalance[];
}

// Memoized row to avoid unnecessary renders
const AssetRow = memo(({ b, i }: { b: PortfolioBalance; i: number }) => {
  const up = b.priceChange24h >= 0;
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * i, duration: 0.3 }}
    >
      <Link
        to={`/app/portfolio/$asset`}
        params={{ asset: b.asset.symbol.toLowerCase() }}
        className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white bg-white/10"
          style={b.asset.color ? { background: b.asset.color } : undefined}
          aria-hidden
        >
          {b.asset.logoUrl ? (
            <img
              src={b.asset.logoUrl}
              alt={b.asset.symbol}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            b.asset.symbol.slice(0, 3)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-white">{b.asset.name}</p>
            <p className="text-sm font-semibold text-white">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                b.fiatValue,
              )}
            </p>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">
              {b.balanceFormatted} {b.asset.symbol}
            </span>
            <span className={up ? "text-emerald-400" : "text-red-400"}>
              {up ? "+" : ""}
              {b.priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  );
});

AssetRow.displayName = "AssetRow";

export function AssetList({ balances }: AssetListProps) {
  const navigate = useNavigate();

  if (!balances || balances.length === 0) {
    return (
      <div className="glass mt-3 flex flex-col items-center justify-center overflow-hidden rounded-3xl py-12 px-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/5 border border-white/10 text-muted-foreground mb-4 shadow-inner">
          <Coins className="h-6 w-6 opacity-50" />
        </div>
        <p className="text-base font-semibold text-white mb-1">No crypto assets yet</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-[240px]">
          Deposit assets to your wallet to start tracking your portfolio.
        </p>
        <button
          onClick={() => navigate({ to: "/app/receive" })}
          className="flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Receive Assets
        </button>
      </div>
    );
  }

  return (
    <ul className="glass mt-3 divide-y divide-white/5 overflow-hidden rounded-3xl">
      {balances.map((b, i) => (
        <AssetRow key={b.asset.id} b={b} i={i} />
      ))}
    </ul>
  );
}
