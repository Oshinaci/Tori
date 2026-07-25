import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import { Copy, Check, ArrowLeft, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function ReceivePage() {
  const navigate = useNavigate();
  const { walletAddress, loading } = useWallet();
  const [copied, setCopied] = useState(false);

  const addressToDisplay = walletAddress || "0x0000000000000000000000000000000000000000";

  // Exact middle truncation format matching: 0x1234...ABCD
  const truncateAddress = (addr: string) => {
    if (!addr) return "0x0000...0000";
    return `${addr.slice(0, 6)}...${addr.slice(-4).toUpperCase()}`;
  };

  const copyAddr = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Wallet address copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

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

        {/* QR Code Container (Centered, Large, Rounded White Card) */}
        <div className="flex flex-col items-center justify-center">
          <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-[32px] bg-white p-6 shadow-premium transition-transform duration-300 hover:scale-[1.01]">
            <QRCodeSVG
              value={addressToDisplay}
              size={192}
              level="H"
              includeMargin={false}
              fgColor="#09090A"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Wallet Address Selector Row */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
              Main Wallet
            </span>
            <span className="font-mono text-xs font-bold text-white mt-1.5 leading-none tracking-wide">
              {loading ? "Loading..." : truncateAddress(addressToDisplay)}
            </span>
          </div>

          <button
            onClick={copyAddr}
            disabled={loading || !walletAddress}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95 disabled:opacity-50"
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
          disabled={loading || !walletAddress}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium shadow-glow transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          <span>Copy Address</span>
        </button>
      </div>
    </div>
  );
}
