import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { useLanguage } from "@/context/LanguageContext";
import { shortAddr } from "./data";
import { toast } from "sonner";
import { Copy, Check, ArrowLeft, Share2, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function ReceivePage() {
  const navigate = useNavigate();
  const { walletAddress, loading } = useWallet();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const addressToDisplay = walletAddress || "0x0000000000000000000000000000000000000000";

  const copyAddr = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success(t("copied", "Wallet address copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const shareAddr = async () => {
    if (!walletAddress) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Tori Wallet Address",
          text: `My Arbitrum One wallet address is:\n${walletAddress}`,
        });
      } catch (err) {
        // ignore aborts
      }
    } else {
      copyAddr();
    }
  };

  return (
    <div className="flex h-full flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 mb-2">
        <button
          onClick={() => navigate({ to: "/app" })}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">{t("receive", "Receive")}</h1>
        <div className="h-10 w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {/* Network & QR Code Card */}
        <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-6 shadow-premium">
          <div className="mb-6 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold text-brand tracking-wide uppercase">
              {t("networks", "Network")}: Arbitrum One
            </span>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-4 shadow-xl">
            <QRCodeSVG
              value={addressToDisplay}
              size={200}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>

          <div className="w-full space-y-2 mb-2">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                  {t("walletAddress", "Wallet Address")}
                </span>
                <span className="truncate font-mono text-sm text-white">
                  {loading ? t("comingSoon", "Loading...") : addressToDisplay}
                </span>
                <span className="mt-0.5 font-mono text-xs text-white/50">
                  {loading ? "..." : shortAddr(addressToDisplay)}
                </span>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={copyAddr}
                  disabled={loading || !walletAddress}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white disabled:opacity-50"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={shareAddr}
              disabled={loading || !walletAddress}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              {t("shareAddress", "Share Address")}
            </button>
          </div>
        </div>

        {/* Warning Card */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-xs font-medium leading-relaxed text-amber-200/90">
            {t(
              "warningArbitrumOnly",
              "Only send assets on the Arbitrum One network. Sending assets from unsupported networks may permanently lose your funds.",
            )}
          </p>
        </div>

        {/* Recent Receives */}
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-white px-1">
            {t("recentReceives", "Recent Receives")}
          </h2>
          <div className="flex flex-col items-center justify-center py-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <p className="text-sm font-medium text-muted-foreground">
              {t("noIncomingTransactions", "No incoming transactions.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
