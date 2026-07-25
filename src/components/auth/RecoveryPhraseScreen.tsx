import { useState, useEffect } from "react";
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
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { AuthLoading } from "./AuthLoading";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";
import { toast } from "sonner";

interface RecoveryPhraseScreenProps {
  onSuccess?: () => void;
}

export function RecoveryPhraseScreen({ onSuccess }: RecoveryPhraseScreenProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backedUpChecked, setBackedUpChecked] = useState(false);

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
    };
  }, [user]);

  const handleCopy = () => {
    if (!mnemonic) return;
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    toast.success("Recovery phrase copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleComplete = () => {
    if (!backedUpChecked) {
      toast.error("Please confirm that you have saved your recovery phrase.");
      return;
    }

    toast.success("Wallet backup confirmed! Welcome to Tori Wallet.");
    if (onSuccess) {
      onSuccess();
    } else {
      navigate({ to: "/app" });
    }
  };

  if (loading) {
    return <AuthLoading message="Decrypting Recovery Phrase..." />;
  }

  const words = mnemonic ? mnemonic.split(" ") : [];

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
              Anyone with these 12 words can access your assets. Store them securely offline.
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
              <p className="text-[11px] text-muted-foreground mb-3 max-w-xs">
                Ensure no one is looking at your screen before revealing.
              </p>
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                className="flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow hover:opacity-95 transition-all"
              >
                <Eye className="h-4 w-4" />
                <span>Reveal Phrase</span>
              </button>
            </div>
          )}

          {/* 12-Word Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
            >
              {isRevealed ? (
                <>
                  <EyeOff className="h-4 w-4 text-brand" />
                  <span>Hide Phrase</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 text-brand" />
                  <span>Reveal Phrase</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-brand" />
                  <span>Copy Phrase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors">
          <input
            type="checkbox"
            checked={backedUpChecked}
            onChange={(e) => setBackedUpChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/30 text-brand focus:ring-brand accent-purple-600"
          />
          <span className="text-xs font-medium text-muted-foreground leading-snug">
            I have written down or backed up my 12-word recovery phrase in a safe offline location.
          </span>
        </label>

        {/* Primary Submit Button */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={!backedUpChecked}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all shadow-premium ${
            backedUpChecked
              ? "gradient-brand shadow-glow hover:opacity-95"
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          }`}
        >
          <span>Finish & Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthLayout>
  );
}
