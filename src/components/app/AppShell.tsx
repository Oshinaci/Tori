import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PieChart, Repeat, Wallet, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const NAV = [
  { to: "/app", label: "Home", icon: Home, exact: true, isTrade: false },
  { to: "/app/portfolio", label: "Portfolio", icon: PieChart, exact: false, isTrade: false },
  { to: "/app", label: "Trade", icon: Repeat, exact: false, isTrade: true, badge: "soon" },
  { to: "/app/wallet", label: "Wallet", icon: Wallet, exact: false, isTrade: false },
  { to: "/app/settings", label: "Settings", icon: Settings, exact: false, isTrade: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleTradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Trade Feature Coming Soon!", {
      description: "DEX Swapping and Spot Trading will be unlocked in the next phase.",
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Ambient gradient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 45% at 50% -10%, rgba(0,88,255,.35), transparent 70%), radial-gradient(40% 30% at 90% 20%, rgba(0,229,255,.18), transparent 70%), radial-gradient(50% 40% at 10% 80%, rgba(0,88,255,.14), transparent 70%)",
        }}
      />
      <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6 sm:px-6">{children}</main>

      {/* Bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl items-stretch justify-between gap-1 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex flex-1 items-stretch justify-between rounded-3xl bg-background px-2 py-2 shadow-soft ring-1 ring-white/8">
          {NAV.map((item) => {
            const active =
              !item.isTrade && (item.exact ? pathname === item.to : pathname.startsWith(item.to));
            const Icon = item.icon;

            if (item.isTrade) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={handleTradeClick}
                  className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="relative z-10 grid place-items-center transition-colors text-muted-foreground group-hover:text-sky-400">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="relative z-10 flex items-center gap-1">
                    <span className="text-muted-foreground group-hover:text-foreground">
                      {item.label}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.2 text-[9px] font-extrabold text-white shadow-sm uppercase tracking-wider leading-none">
                      soon
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl gradient-brand opacity-90"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 grid place-items-center transition-colors ${
                    active ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={`relative z-10 transition-colors ${
                    active ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
