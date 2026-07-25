import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { WalletProvider } from "@/context/WalletContext";

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
        <AppShell>
          <Outlet />
        </AppShell>
      </WalletProvider>
    </ProtectedRoute>
  );
}
