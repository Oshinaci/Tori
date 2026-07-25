import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/market")({
  component: MarketPage,
});

function MarketPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col p-8 items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-white mb-2">Market</h1>
      <h2 className="text-xl font-semibold text-[#F59E0B] mb-6">Coming Soon</h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Live prices, trending tokens, watchlist, market movers, gainers, losers, and token discovery
        will be available in a future update.
      </p>
      <button
        onClick={() => navigate({ to: "/app" })}
        className="flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back Home
      </button>
    </div>
  );
}
