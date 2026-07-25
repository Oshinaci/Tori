import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { WalletProvider } from "@/context/WalletContext";
import { ActivityProvider } from "@/context/ActivityContext";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Tori — Wallet" },
      {
        name: "description",
        content: "Your Tori crypto wallet: balances, portfolio, activity, and settings.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <ProtectedRoute>
      <WalletProvider>
        <ActivityProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </ActivityProvider>
      </WalletProvider>
    </ProtectedRoute>
  );
}
