import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  ArrowDownLeft,
  CreditCard,
  Landmark,
} from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { fmtUsd, pnl24h, totalBalance } from "./data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function BalanceCard() {
  const [hidden, setHidden] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("250");
  const positive = pnl24h >= 0;
  const pct = (pnl24h / (totalBalance - pnl24h)) * 100;

  const handleAddFunds = (method: string) => {
    toast.success(`Deposit request created via ${method}`, {
      description: `$${depositAmount} USD will be credited to your account once confirmed.`,
    });
    setAddFundsOpen(false);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mt-5 overflow-hidden rounded-3xl p-6 shadow-premium"
        style={{
          background: "linear-gradient(135deg, #0058FF 0%, #0095FF 55%, #00E5FF 130%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 100% 0%, rgba(255,255,255,.35), transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(255,255,255,.18), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative flex items-center justify-between text-white/80">
          <span className="text-xs font-medium uppercase tracking-wider">Total balance</span>
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? "Show balance" : "Hide balance"}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 text-white"
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative mt-2 text-white">
          <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {hidden ? "••••••" : <AnimatedNumber value={totalBalance} format={(n) => fmtUsd(n)} />}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            {positive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span className="font-medium">
              {positive ? "+" : ""}
              {fmtUsd(pnl24h)} · {positive ? "+" : ""}
              {pct.toFixed(2)}%
            </span>
            <span className="text-white/70">Today</span>
          </div>
        </div>

        {/* "+ Add funds" card inside the TOTAL BALANCE card */}
        <div className="relative mt-6 pt-5 border-t border-white/20">
          <button
            type="button"
            onClick={() => setAddFundsOpen(true)}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-white/15 p-4 text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-[0.99] border border-white/25 shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/25 text-white shadow-sm transition-transform group-hover:scale-105">
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </span>
              <div className="text-left min-w-0">
                <div className="text-base font-semibold tracking-tight">+ Add funds</div>
                <div className="text-xs text-white/80 truncate">
                  Instant deposit via Crypto, Card or Bank
                </div>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/25 px-3.5 py-1.5 text-xs font-semibold backdrop-blur transition-colors group-hover:bg-white/35">
              Deposit
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </motion.section>

      {/* Interactive Add Funds Dialog */}
      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent className="glass sm:max-w-md border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </span>
              Add Funds to Wallet
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select your preferred method to deposit funds into your Tori wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount (USD)</label>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="250"
                />
              </div>
            </div>

            <div className="grid gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleAddFunds("Crypto Deposit")}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 text-left hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/20 text-brand">
                    <ArrowDownLeft className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Deposit Crypto</div>
                    <div className="text-xs text-muted-foreground">
                      Send ETH, USDC, or SOL from external wallet
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => handleAddFunds("Debit / Credit Card")}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 text-left hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Debit or Credit Card</div>
                    <div className="text-xs text-muted-foreground">
                      Instant purchase with Apple Pay, Visa, Mastercard
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => handleAddFunds("Bank Wire")}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 text-left hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500/20 text-sky-400">
                    <Landmark className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">Bank Wire / ACH</div>
                    <div className="text-xs text-muted-foreground">
                      Direct bank transfer with zero fees
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
