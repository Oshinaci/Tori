import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { AssetList } from "./AssetList";
import { portfolioService, PortfolioSummary } from "@/lib/portfolio";
import { useWallet } from "@/context/WalletContext";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, Search, RefreshCw } from "lucide-react";

export function PortfolioPage() {
  const {
    walletAddress,
    loading: walletLoading,
    isRefetching,
    refetchBalance,
    tokenBalances,
  } = useWallet();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      // Only show full loading skeleton on initial fetch
      if (!summary) {
        setLoading(true);
      }

      if (walletAddress) {
        const data = await portfolioService.getPortfolio(walletAddress);
        if (isMounted) {
          setSummary(data);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setSummary(await portfolioService.getPortfolio(null));
          setLoading(false);
        }
      }
    }
    loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, [walletAddress, walletLoading, tokenBalances]);

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

  // Filter balances based on search query
  const filteredBalances =
    summary?.balances.filter(
      (b) =>
        b.asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <div className="flex h-full flex-col pb-20">
      <div className="px-4">
        <TopBar title={t("portfolio", "Portfolio")} />
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
              {t("totalPortfolio", "Total Portfolio")}
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
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(summary?.totalFiatValue || 0)
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium">
              {t("todaysChange", "Today's Change")}
            </p>
            {!loading && !hidden && (
              <p
                className={`text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}
              >
                {positive ? "+" : ""}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(summary?.totalChange24h || 0)}{" "}
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

        <div className="mt-8 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white">{t("assets", "All Assets")}</h2>
          <button
            onClick={refetchBalance}
            disabled={isRefetching}
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 px-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-brand/50 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-3xl border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : (
          <AssetList balances={filteredBalances} />
        )}
      </div>
    </div>
  );
}
