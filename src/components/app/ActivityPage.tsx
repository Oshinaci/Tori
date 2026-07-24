import { useState } from "react";
import { TopBar } from "./TopBar";
import { TxList } from "./TxList";

const FILTERS = ["All", "Sent", "Received", "Swaps", "Buys"] as const;

export function ActivityPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  return (
    <>
      <TopBar title="Activity" />
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
            {f}
          </button>
        ))}
      </div>
      <TxList />
    </>
  );
}
