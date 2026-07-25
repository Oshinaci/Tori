import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import { Copy, Check, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function ReceivePage() {
  const navigate = useNavigate();
  const {
    walletAddress,
    loading,
    ethBalance,
    rpcStatus,
    lastSyncedAt,
    refetchBalance,
    isRefetching,
  } = useWallet();
  const [copied, setCopied] = useState(false);

  // Robust Ethereum/Arbitrum address validation (0x followed by exactly 40 hex chars)
  const isValidAddress = (addr: string | null | undefined): boolean => {
    if (!addr) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  // Exact middle truncation format matching: 0x1234...ABCD
  const truncateAddress = (addr: string) => {
    if (!addr) return "0x0000...0000";
    return `${addr.slice(0, 6)}...${addr.slice(-4).toUpperCase()}`;
  };

  const copyAddr = async () => {
    if (!walletAddress || !isValidAddress(walletAddress)) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Wallet address copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  // Performance: Avoid unnecessary QR Code regeneration. Memoize the QR Code when the wallet address has not changed.
  const memoizedQRCode = useMemo(() => {
    if (!isValidAddress(walletAddress)) return null;
    return (
      <QRCodeSVG
        value={walletAddress!}
        size={192}
        level="H"
        includeMargin={false}
        fgColor="#09090A"
        bgColor="#FFFFFF"
      />
    );
  }, [walletAddress]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="flex h-full flex-col pb-6 bg-[#09090A] text-white animate-pulse">
        {/* Top App Bar Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#09090A]">
          <button
            disabled
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="w-16" />
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Network Card Skeleton */}
          <div className="h-16 rounded-2xl border border-white/5 bg-white/[0.01]" />

          {/* QR Code Container Skeleton */}
          <div className="flex justify-center">
            <div className="h-60 w-60 rounded-[32px] bg-white/5" />
          </div>

          {/* Wallet Address Row Skeleton */}
          <div className="h-16 rounded-2xl border border-white/5 bg-white/[0.01]" />

          {/* Warning Card Skeleton */}
          <div className="h-20 rounded-2xl border border-white/5 bg-white/[0.01]" />
        </div>

        {/* Action Button Skeleton */}
        <div className="px-4 pt-2">
          <div className="h-12 w-full rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  // Error State: If the wallet address is missing or invalid
  if (!isValidAddress(walletAddress)) {
    return (
      <div className="flex h-full flex-col pb-6 bg-[#09090A] text-white">
        {/* Top App Bar Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#09090A]">
          <button
            onClick={() => navigate({ to: "/app" })}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-sm font-bold tracking-wider text-white uppercase">Receive</h1>
          <div className="w-16" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h2 className="text-lg font-bold text-white tracking-wide">Wallet unavailable</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Unable to load your wallet address. Please try again.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors border border-white/10 active:scale-95"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Guaranteed valid wallet address state
  return (
    <div className="flex h-full flex-col pb-6 bg-[#09090A] text-white">
      {/* Top App Bar Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#09090A]">
        <button
          onClick={() => navigate({ to: "/app" })}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-sm font-bold tracking-wider text-white uppercase">Receive</h1>
        <div className="w-16" /> {/* Visual balance spacer */}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Network Card */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-premium">
          <div className="flex items-center gap-3">
            {/* Custom High-Fidelity Arbitrum SVG Logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#28A0F0]">
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor">
                <path d="M16 0C7.16 0 0 7.16 0 16s7.16 16 16 16 16-7.16 16-16S24.84 0 16 0zm-1.8 7.37c.36-.61 1.24-.61 1.6 0l9.46 15.93c.36.61-.08 1.37-.8 1.37H7.54c-.72 0-1.16-.76-.8-1.37l9.46-15.93z" />
                <path d="M16 10.5l6.5 11H9.5l6.5-11z" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                Network
              </span>
              <span className="text-xs font-extrabold text-white mt-1 leading-none">
                Arbitrum One
              </span>
            </div>
          </div>

          {/* Supported Network Badge */}
          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase">
              Supported Network
            </span>
          </div>
        </div>

        {/* Live Balance & Connection Status Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-premium space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                ETH Balance
              </span>
              <span className="text-lg font-extrabold text-white mt-2 leading-none">
                {ethBalance
                  ? `${parseFloat(ethBalance)
                      .toFixed(6)
                      .replace(/\.?0+$/, "")} ETH`
                  : "0 ETH"}
              </span>
            </div>

            <button
              onClick={refetchBalance}
              disabled={isRefetching}
              className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
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
              <span className="capitalize font-semibold text-white/90">
                {rpcStatus === "connected"
                  ? "Connected"
                  : rpcStatus === "connecting"
                    ? "Connecting..."
                    : "Unavailable"}
              </span>
            </div>

            <span className="text-[10px]">
              Last Updated:{" "}
              {lastSyncedAt
                ? lastSyncedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "Never"}
            </span>
          </div>
        </div>

        {/* QR Code Container (Centered, Large, Rounded White Card) */}
        <div className="flex flex-col items-center justify-center">
          <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-[32px] bg-white p-6 shadow-premium transition-transform duration-300 hover:scale-[1.01]">
            {memoizedQRCode}
          </div>
        </div>

        {/* Wallet Address Selector Row */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
              Main Wallet
            </span>
            <span className="font-mono text-xs font-bold text-white mt-1.5 leading-none tracking-wide">
              {truncateAddress(walletAddress!)}
            </span>
          </div>

          <button
            onClick={copyAddr}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95"
            title="Copy Wallet Address"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-white/80" />
            )}
          </button>
        </div>

        {/* Yellow Warning Card */}
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Only send assets on Arbitrum One.
            </span>
          </div>
          <p className="text-xs leading-relaxed text-amber-200/80">
            Sending assets from unsupported networks may permanently result in loss of funds.
          </p>
        </div>

        {/* Supported Assets List (Informational Only) */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
            Supported Assets (Arbitrum One)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                symbol: "ETH",
                name: "Ethereum",
                color: "from-blue-500/10 to-blue-600/10 text-blue-400 border-blue-500/20",
              },
              {
                symbol: "USDT",
                name: "Tether USD",
                color:
                  "from-emerald-500/10 to-emerald-600/10 text-emerald-400 border-emerald-500/20",
              },
              {
                symbol: "USDC",
                name: "USD Coin",
                color: "from-sky-500/10 to-sky-600/10 text-sky-400 border-sky-500/20",
              },
              {
                symbol: "ERC-20",
                name: "Tokens",
                color: "from-purple-500/10 to-purple-600/10 text-purple-400 border-purple-500/20",
              },
            ].map((asset) => (
              <div
                key={asset.symbol}
                className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-br ${asset.color} p-3`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 font-bold text-[10px]">
                  {asset.symbol}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">{asset.symbol}</span>
                  <span className="text-[9px] text-muted-foreground leading-none mt-1">
                    {asset.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Large Rounded Bottom Action Button */}
      <div className="px-4 pt-2">
        <button
          onClick={copyAddr}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium shadow-glow transition-all hover:opacity-95 active:scale-[0.99]"
        >
          <Copy className="h-4 w-4" />
          <span>Copy Address</span>
        </button>
      </div>
    </div>
  );
}
