import { TopBar } from "./TopBar";
import { BalanceCard } from "./BalanceCard";
import { QuickActions } from "./QuickActions";
import { SectionHeader } from "./SectionHeader";
import { Watchlist } from "./Watchlist";
import { MarketOverview } from "./MarketOverview";

export function Dashboard() {
  return (
    <>
      <TopBar />
      <BalanceCard />
      <QuickActions />
      <SectionHeader title="Watchlist" />
      <Watchlist />
      <SectionHeader title="Market" />
      <MarketOverview />
    </>
  );
}
