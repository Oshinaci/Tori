import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  Download,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { AuthLoading } from "./AuthLoading";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";
import { toast } from "sonner";

export function RecoveryPhraseScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backedUpChecked, setBackedUpChecked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPhrase() {
      const userId = user?.id || "guest_user";
      const phrase = await walletService.getMnemonic(userId);
      if (isMounted) {
        setMnemonic(phrase);
        setLoading(false);
      }
    }
    loadPhrase();
    return () => {
      isMounted = false;
      setMnemonic(null); // Clear sensitive state on unmount
    };
  }, [user]);

  const handlePointerDown = () => {
    setHoldProgress(0);
    const duration = 2000;
    const interval = 50;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
      elapsed += interval;
      setHoldProgress(Math.min((elapsed / duration) * 100, 100));
    }, interval);

    holdTimerRef.current = setTimeout(() => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsRevealed(true);
      setHasRevealed(true);
      setHoldProgress(0);
      if (navigator.vibrate) navigator.vibrate(50);
    }, duration);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setHoldProgress(0);
  };

  const handleCopy = () => {
    if (!mnemonic) return;
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    toast.success("Recovery phrase copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    if (!mnemonic) return;
    const blob = new Blob([mnemonic], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tori-recovery-phrase.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery phrase downloaded!");
  };

  const handleComplete = () => {
    if (!hasRevealed) {
      toast.error("Please reveal your recovery phrase first.");
      return;
    }
    if (!backedUpChecked) {
      toast.error("Please confirm that you have saved your recovery phrase.");
      return;
    }

    navigate({ to: "/auth/recovery-phrase-verify" });
  };

  if (loading) {
    return <AuthLoading message="Decrypting Recovery Phrase..." />;
  }

  const words = mnemonic ? mnemonic.split(" ") : [];
  const canContinue = hasRevealed && backedUpChecked;

  return (
    <AuthLayout
      title="Secret Recovery Phrase"
      subtitle="Your 12-word recovery phrase is the master key to your non-custodial wallet."
    >
      <div className="flex flex-col space-y-5 pt-1">
        {/* Security Warning Callout */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300 block">Never share your phrase!</span>
            <p className="text-amber-200/80 leading-relaxed">
              Anyone with these 12 words can steal your assets. Tori can never recover your wallet.
            </p>
          </div>
        </div>

        {/* Phrase Grid Card */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-premium">
          {/* Privacy Overlay when hidden */}
          {!isRevealed && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-background/90 p-4 text-center backdrop-blur-xl">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-brand">
                <Lock className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-white mb-1">Recovery Phrase Hidden</p>
              <p className="text-[11px] text-muted-foreground mb-4 max-w-xs">
                Ensure no one is looking at your screen. Press and hold to reveal.
              </p>

              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onContextMenu={(e) => e.preventDefault()}
                className="relative flex select-none items-center gap-1.5 overflow-hidden rounded-xl bg-white/10 px-6 py-3 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95"
              >
                <div
                  className="absolute bottom-0 left-0 top-0 bg-brand/40 transition-all ease-linear"
                  style={{ width: `${holdProgress}%` }}
                />
                <Eye className="relative z-10 h-4 w-4" />
                <span className="relative z-10">Hold to Reveal</span>
              </button>
            </div>
          )}

          {/* 12-Word Grid */}
          <div
            className={`grid grid-cols-2 gap-2.5 sm:grid-cols-3 ${!isRevealed ? "blur-md select-none" : ""}`}
          >
            {words.map((word, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
              >
                <span className="font-mono text-[11px] font-bold text-muted-foreground/60 w-5">
                  {idx + 1}.
                </span>
                <span className="font-mono font-semibold text-white tracking-wide">{word}</span>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setIsRevealed(!isRevealed)}
              disabled={!hasRevealed}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${hasRevealed ? "text-muted-foreground hover:text-white" : "text-muted-foreground/50 cursor-not-allowed"}`}
            >
              {isRevealed ? (
                <>
                  <EyeOff className="h-4 w-4 text-brand" />
                  <span>Hide Phrase</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show Phrase</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!isRevealed}
                className={`flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold transition-all ${isRevealed ? "bg-white/5 text-white hover:bg-white/10" : "bg-transparent text-muted-foreground/50 cursor-not-allowed"}`}
              >
                <Download className={`h-3.5 w-3.5 ${isRevealed ? "text-brand" : ""}`} />
                <span className="hidden sm:inline">Save TXT</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!isRevealed}
                className={`flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold transition-all ${isRevealed ? "bg-white/5 text-white hover:bg-white/10" : "bg-transparent text-muted-foreground/50 cursor-not-allowed"}`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className={`h-3.5 w-3.5 ${isRevealed ? "text-brand" : ""}`} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label
          className={`flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors ${hasRevealed ? "cursor-pointer hover:bg-white/10" : "opacity-50 cursor-not-allowed"}`}
        >
          <input
            type="checkbox"
            checked={backedUpChecked}
            disabled={!hasRevealed}
            onChange={(e) => setBackedUpChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/30 text-brand focus:ring-brand accent-purple-600 disabled:cursor-not-allowed"
          />
          <span className="text-xs font-medium text-muted-foreground leading-snug">
            <strong>"I have written it down"</strong> — I confirm that I have stored my 12-word recovery phrase in a safe offline location.
          </span>
        </label>

        {/* Primary Submit Button */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={!canContinue}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all shadow-premium ${
            canContinue
              ? "gradient-brand shadow-glow hover:opacity-95"
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthLayout>
  );
}
