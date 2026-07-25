import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CreditCard } from "lucide-react";
import { TXS, fmtUsd, type Tx } from "./data";
import { useLanguage } from "@/context/LanguageContext";

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

const LABEL_KEYS: Record<Tx["type"], string> = {
  send: "sent",
  receive: "received",
  swap: "swapped",
  buy: "bought",
};

export function TxList({ limit }: { limit?: number }) {
  const items = limit ? TXS.slice(0, limit) : TXS;
  const { t } = useLanguage();

  return (
    <ul className="glass mt-3 divide-y divide-white/5 overflow-hidden rounded-3xl">
      {items.map((tx, i) => {
        const Icon = ICONS[tx.type];
        const incoming = tx.type === "receive" || tx.type === "buy";
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
                incoming ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">
                  {t(LABEL_KEYS[tx.type], LABELS[tx.type])} {tx.asset}
                  {tx.counter ? ` → ${tx.counter}` : ""}
                </p>
                <p className={`text-sm font-semibold ${incoming ? "text-emerald-400" : ""}`}>
                  {incoming ? "+" : "−"}
                  {fmtUsd(tx.usd)}
                </p>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{tx.address ?? "Instant"}</span>
                <span>{tx.time}</span>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
