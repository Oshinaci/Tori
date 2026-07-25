import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CreditCard, ShieldCheck } from "lucide-react";
import { useActivity, WalletActivity } from "@/context/ActivityContext";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = {
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  swap: ArrowLeftRight,
  bridge: ArrowLeftRight,
  buy: CreditCard,
  sell: ArrowUpRight,
  wallet_created: ShieldCheck,
  wallet_imported: ShieldCheck,
  backup_completed: ShieldCheck,
  security: ShieldCheck,
} as const;

// Helper for relative time formatting
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return "Just now";
  }
  if (diffMin < 60) {
    return `${diffMin}m`;
  }
  if (diffHr < 24) {
    return `${diffHr}h`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TxList({ limit }: { limit?: number }) {
  const { activity, loading } = useActivity();
  const { t } = useLanguage();

  // Filter to show transactions and monetary operations only
  const txActivities = activity.filter((act) =>
    ["deposit", "withdraw", "swap", "bridge", "buy", "sell"].includes(act.activity_type),
  );

  const items = limit ? txActivities.slice(0, limit) : txActivities;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 rounded-3xl border border-white/5 bg-white/[0.02]">
        <p className="text-xs text-muted-foreground animate-pulse">Loading activities...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-3xl border border-white/5 bg-white/[0.02] text-center px-4">
        <p className="text-sm font-medium text-muted-foreground">
          {t("noTransactions", "No transactions yet.")}
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Perform actions or simulate events in settings.
        </p>
      </div>
    );
  }

  return (
    <ul className="glass mt-3 divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/5">
      {items.map((tx, i) => {
        const Icon = ICONS[tx.activity_type] || ShieldCheck;
        const incoming = tx.activity_type === "deposit" || tx.activity_type === "buy";

        // Dynamic labels based on type
        let label = "Activity";
        if (tx.activity_type === "deposit") label = "Received";
        else if (tx.activity_type === "withdraw") label = "Sent";
        else if (tx.activity_type === "swap") label = "Swapped";
        else if (tx.activity_type === "bridge") label = "Bridged";
        else if (tx.activity_type === "buy") label = "Bought";

        // Details mapping
        const assetName = tx.token_symbol || "ETH";
        const displayAmount = tx.amount ? `${tx.amount} ${assetName}` : "Pending";

        return (
          <motion.li
            key={tx.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                incoming
                  ? "bg-emerald-500/15 text-emerald-400"
                  : tx.activity_type === "swap"
                    ? "bg-sky-500/15 text-sky-400"
                    : tx.activity_type === "bridge"
                      ? "bg-purple-500/15 text-purple-400"
                      : "bg-white/5 text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {label} {assetName}
                  {tx.activity_type === "swap" && tx.metadata?.swappedFrom && (
                    <span className="text-xs font-medium text-muted-foreground ml-1">
                      ({tx.metadata.swappedFrom} → {assetName})
                    </span>
                  )}
                  {tx.activity_type === "bridge" && tx.metadata?.toChain && (
                    <span className="text-xs font-medium text-muted-foreground ml-1">
                      (To {tx.metadata.toChain})
                    </span>
                  )}
                </p>
                <p
                  className={`text-sm font-bold ${incoming ? "text-emerald-400" : "text-white/90"}`}
                >
                  {incoming ? "+" : "−"}
                  {displayAmount}
                </p>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate font-mono text-[10px]">
                  {tx.tx_hash ? `${tx.tx_hash.slice(0, 10)}...${tx.tx_hash.slice(-8)}` : "Instant"}
                </span>
                <span className="font-medium text-muted-foreground/80">
                  {getRelativeTime(tx.created_at)}
                </span>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
