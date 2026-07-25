import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { AssetList } from "./AssetList";
import { portfolioService, PortfolioSummary } from "@/lib/portfolio";
import { useWallet } from "@/context/WalletContext";
import { Eye, EyeOff } from "lucide-react";

export function PortfolioPage() {
  const { walletAddress, loading: walletLoading } = useWallet();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Persist hidden state in localStorage
  const [hidden, setHidden] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tori_portfolio_hidden") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("tori_portfolio_hidden", hidden.toString());
  }, [hidden]);

  useEffect(() => {
    if (walletLoading) return;
    let isMounted = true;
    async function loadPortfolio() {
      setLoading(true);

      if (walletAddress) {
        const data = await portfolioService.getPortfolio(walletAddress);
        if (isMounted) {
          setSummary(data);
        }
      } else {
        if (isMounted) {
          setSummary(await portfolioService.getPortfolio(null));
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }
    loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, [walletAddress, walletLoading]);

  const positive = summary ? summary.totalChange24h >= 0 : true;

  // Allocation bar
  const totalFiat = summary?.totalFiatValue || 0;
  const segments =
    summary?.balances
      .map((b) => ({
        symbol: b.asset.symbol,
        color: b.asset.color || "#0095FF",
        pct: totalFiat > 0 ? (b.fiatValue / totalFiat) * 100 : 0,
      }))
      .sort((a, b) => b.pct - a.pct) || [];

  return (
    <div className="flex h-full flex-col pb-20">
      <div className="px-4">
        <TopBar title="Portfolio" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-4 overflow-hidden rounded-3xl p-5 shadow-premium"
          style={{
            background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 55%, #0F3460 130%)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Total Portfolio
            </p>
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/5 backdrop-blur transition-colors hover:bg-white/10 text-white/70"
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-2 text-4xl font-bold tracking-tight text-white">
            {loading ? (
              <span className="opacity-50 blur-sm">$0.00</span>
            ) : hidden ? (
              "••••••"
            ) : (
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                summary?.totalFiatValue || 0,
              )
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Today's Change</p>
            {!loading && !hidden && (
              <p
                className={`text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}
              >
                {positive ? "+" : ""}
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                  summary?.totalChange24h || 0,
                )}{" "}
                ({summary?.totalChange24hPct.toFixed(2) || "0.00"}%)
              </p>
            )}
            {hidden && <p className="text-xs font-semibold text-muted-foreground">•••</p>}
          </div>

          {segments.length > 0 && (
            <>
              <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-white/5">
                {segments.map((s) => (
                  <span
                    key={s.symbol}
                    style={{ width: `${s.pct}%`, background: s.color }}
                    className="h-full"
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground font-medium">
                {segments.map((s) => (
                  <span key={s.symbol} className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shadow-sm"
                      style={{ background: s.color }}
                    />
                    {s.symbol} · {s.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </>
          )}
        </motion.section>

        <h2 className="mt-8 text-base font-bold text-white px-1">All Assets</h2>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : (
          <AssetList balances={summary?.balances || []} />
        )}
      </div>
    </div>
  );
}
