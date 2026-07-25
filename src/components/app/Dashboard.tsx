import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { shortAddr, fmtUsd } from "./data";
import { NotificationsSheet } from "./NotificationsSheet";
import { toast } from "sonner";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    walletAddress,
    walletName,
    loading,
    network,
    ethBalance,
    lastSyncedAt,
    rpcStatus,
    isRefetching,
    refetchBalance,
    portfolioValue,
  } = useWallet();

  const [hidden, setHidden] = useState(false);
  const [, setCopied] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName =
    ((user?.user_metadata as Record<string, unknown>)?.display_name as string) ||
    user?.email?.split("@")[0] ||
    "User";

  const copyAddr = async () => {
    if (!walletAddress) return;
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

  const formatLastSynced = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // Safe ETH display
  const ethDisplayValue = ethBalance
    ? parseFloat(ethBalance) === 0
      ? "0 ETH"
      : `${parseFloat(ethBalance)
          .toFixed(6)
          .replace(/\.?0+$/, "")} ETH`
    : "0 ETH";

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

      {/* Network & RPC Status Bar */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                rpcStatus === "connected"
                  ? "bg-emerald-400"
                  : rpcStatus === "connecting"
                    ? "bg-amber-400"
                    : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                rpcStatus === "connected"
                  ? "bg-emerald-500"
                  : rpcStatus === "connecting"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
            />
          </span>
          <span className="text-white/90 font-semibold">{network.name}</span>
          <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.2 rounded font-mono">
            Chain ID: {network.chainId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {rpcStatus === "unavailable" ? (
            <button
              onClick={refetchBalance}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
              Retry RPC
            </button>
          ) : (
            <button
              onClick={refetchBalance}
              disabled={isRefetching}
              title="Refresh RPC Balance"
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
              <span>{formatLastSynced(lastSyncedAt)}</span>
            </button>
          )}
        </div>
      </div>

      {/* RPC Error / Offline Alert */}
      {rpcStatus === "unavailable" && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Network unavailable. Check RPC connection.</span>
          </div>
          <button
            onClick={refetchBalance}
            className="shrink-0 rounded bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-amber-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Wallet Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-6 shadow-premium"
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
              disabled={loading || !walletAddress}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : walletAddress ? shortAddr(walletAddress) : "No wallet"}
              <Copy className="ml-0.5 h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {rpcStatus === "connected" ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-300" />
            )}
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 text-white"
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="relative mt-3 text-white">
          <div className="text-xs font-medium text-white/70 mb-1">Portfolio Value</div>
          <div className="text-3xl font-bold tracking-tight sm:text-4xl">
            {hidden ? "••••••" : fmtUsd(portfolioValue)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
            <span>{network.name}</span>
            <span>•</span>
            <span>Last synced: {formatLastSynced(lastSyncedAt)}</span>
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <section className="mt-6 grid grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/app/receive" })}
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

        {/* Live Native ETH Asset Item */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#627EEA]/20 text-[#627EEA] font-bold">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 256 417">
                  <path
                    d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"
                    fill="#627EEA"
                  />
                  <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#8A92B2" />
                  <path
                    d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.601 128.038-180.32z"
                    fill="#627EEA"
                  />
                  <path d="M127.962 416.905v-104.72L0 236.585z" fill="#8A92B2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Ethereum</span>
                  <span className="text-[10px] font-medium bg-brand/20 text-brand px-1.5 py-0.2 rounded">
                    Arbitrum
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">ETH</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white">
                {hidden ? "••••••" : ethDisplayValue}
              </span>
              <span className="text-xs text-muted-foreground">Native Token</span>
            </div>
          </div>
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
    </>
  );
}
