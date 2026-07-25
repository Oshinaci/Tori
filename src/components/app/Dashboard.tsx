import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Copy,
  Eye,
  EyeOff,
  Plus,
  ArrowDown,
  ArrowUp,
  Repeat,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";
import { shortAddr } from "./data";
import { NotificationsSheet } from "./NotificationsSheet";
import { ReceiveModal } from "./ReceiveModal";
import { toast } from "sonner";

export function Dashboard() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>(
    "0x0000000000000000000000000000000000000000",
  );
  const [walletName, setWalletName] = useState<string>("Main Wallet");
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    let isMounted = true;
    async function loadWallet() {
      const userId = user?.id || "guest_user";
      const w = await walletService.getWallet(userId);
      if (isMounted && w) {
        setWalletAddress(w.wallet_address);
        setWalletName(w.wallet_name || "Main Wallet");
      }
    }
    loadWallet();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const notImplemented = () => {
    toast.info("Coming Soon", {
      description: "This feature will be available in a future update.",
    });
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/20 text-brand font-bold uppercase ring-2 ring-background">
            {displayName.substring(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">{getGreeting()},</span>
            <span className="text-sm font-bold text-white tracking-tight">{displayName}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Bell className="h-4 w-4 text-white" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
        </button>
      </header>

      {/* Wallet Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mt-2 overflow-hidden rounded-3xl p-6 shadow-premium"
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider">{walletName}</span>
            <button
              onClick={copyAddr}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur hover:bg-white/20 transition-colors"
            >
              {shortAddr(walletAddress)}
              <Copy className="h-3 w-3 ml-0.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? "Show balance" : "Hide balance"}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 text-white"
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative mt-3 text-white">
          <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {hidden ? "••••••" : "$0.00"}
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <section className="mt-6 grid grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setReceiveOpen(true)}
          className="flex flex-col items-center gap-2"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-95 text-white">
            <ArrowDown className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-white">Receive</span>
        </button>
        <button
          type="button"
          onClick={notImplemented}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-95 text-white">
            <ArrowUp className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow ring-2 ring-background">
              <span className="text-[8px] font-bold text-white">CS</span>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
            Send
          </span>
        </button>
        <button
          type="button"
          onClick={notImplemented}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-95 text-white">
            <Repeat className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow ring-2 ring-background">
              <span className="text-[8px] font-bold text-white">CS</span>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
            Swap
          </span>
        </button>
        <button
          type="button"
          onClick={notImplemented}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-95 text-white">
            <CreditCard className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow ring-2 ring-background">
              <span className="text-[8px] font-bold text-white">CS</span>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
            Buy
          </span>
        </button>
      </section>

      {/* Assets Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Assets</h2>
          <button
            disabled
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground/50 cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Asset
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-10 rounded-3xl border border-dashed border-white/10 bg-white/5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-muted-foreground mb-3">
            <CreditCard className="h-6 w-6 opacity-50" />
          </div>
          <p className="text-sm font-medium text-white mb-1">No assets yet.</p>
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Your balances will appear here once you receive or buy crypto.
          </p>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Recent Activity</h2>
          <button className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand/80 transition-colors">
            View All
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-8 rounded-3xl border border-white/5 bg-white/[0.02]">
          <p className="text-sm font-medium text-muted-foreground">No transactions yet.</p>
        </div>
      </section>

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />
      <ReceiveModal
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        walletAddress={walletAddress}
      />
    </>
  );
}
