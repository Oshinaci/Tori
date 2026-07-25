import { useState } from "react";
import { TopBar } from "./TopBar";
import { TxList } from "./TxList";
import { useLanguage } from "@/context/LanguageContext";

const FILTERS = ["All", "Sent", "Received", "Swaps", "Buys"] as const;

const FILTER_KEYS: Record<(typeof FILTERS)[number], string> = {
  All: "all",
  Sent: "sent",
  Received: "received",
  Swaps: "swapped",
  Buys: "bought",
};

export function ActivityPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { t } = useLanguage();

  return (
    <>
      <TopBar title={t("activity", "Activity")} />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "gradient-brand text-white shadow-premium"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(FILTER_KEYS[f], f)}
          </button>
        ))}
      </div>
      <TxList />
    </>
  );
}
