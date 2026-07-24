import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CreditCard } from "lucide-react";
import { TXS, fmtUsd, type Tx } from "./data";

const ICONS = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  swap: ArrowLeftRight,
  buy: CreditCard,
} as const;

const LABELS: Record<Tx["type"], string> = {
  send: "Sent",
  receive: "Received",
  swap: "Swapped",
  buy: "Bought",
};

export function TxList({ limit }: { limit?: number }) {
  const items = limit ? TXS.slice(0, limit) : TXS;
  return (
    <ul className="glass mt-3 divide-y divide-white/5 overflow-hidden rounded-3xl">
      {items.map((t, i) => {
        const Icon = ICONS[t.type];
        const incoming = t.type === "receive" || t.type === "buy";
        return (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                incoming ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">
                  {LABELS[t.type]} {t.asset}
                  {t.counter ? ` → ${t.counter}` : ""}
                </p>
                <p className={`text-sm font-semibold ${incoming ? "text-emerald-400" : ""}`}>
                  {incoming ? "+" : "−"}
                  {fmtUsd(t.usd)}
                </p>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{t.address ?? "Instant"}</span>
                <span>{t.time}</span>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
