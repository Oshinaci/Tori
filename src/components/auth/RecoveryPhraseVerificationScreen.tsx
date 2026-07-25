import { useState, useEffect } from "react";
import { AuthLayout } from "./AuthLayout";
import { AuthLoading } from "./AuthLoading";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";
import { logActivityAndNotificationDirect } from "@/lib/activity-logger";

export function RecoveryPhraseVerificationScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);

  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let mnemonicLocal: string | null = null;

    async function loadAndPrepare() {
      const userId = user?.id || "guest_user";

      // Prevent returning to onboarding if already completed
      if (typeof window !== "undefined") {
        if (localStorage.getItem(`tori_onboarding_completed_${userId}`) === "true") {
          navigate({ to: "/app" });
          return;
        }
      }

      mnemonicLocal = await walletService.getMnemonic(userId);

      if (isMounted && mnemonicLocal) {
        const words = mnemonicLocal.split(" ");
        if (words.length === 12) {
          // Select 3 unique random indices between 0 and 11
          const indices = new Set<number>();
          while (indices.size < 3) {
            indices.add(Math.floor(Math.random() * 12));
          }
          const sortedIndices = Array.from(indices).sort((a, b) => a - b);
          setTargetIndices(sortedIndices);
          setTargetWords([
            words[sortedIndices[0]],
            words[sortedIndices[1]],
            words[sortedIndices[2]],
          ]);
        } else {
          toast.error("Invalid recovery phrase loaded.");
        }
        setLoading(false);
      } else if (isMounted && !mnemonicLocal) {
        // Handle case where it doesn't exist (e.g. user refreshed)
        toast.error("Recovery phrase not found in memory.");
        navigate({ to: "/auth/recovery-phrase" });
      }
    }

    loadAndPrepare();

    return () => {
      isMounted = false;
      // Clear sensitive data on unmount
      mnemonicLocal = null;
      setTargetWords([]);
    };
  }, [user, navigate]);

  const handleVerify = async () => {
    if (!input1.trim() || !input2.trim() || !input3.trim()) {
      toast.error("Please fill in all words to verify.");
      return;
    }

    setVerifying(true);

    const isMatch =
      input1.trim().toLowerCase() === targetWords[0] &&
      input2.trim().toLowerCase() === targetWords[1] &&
      input3.trim().toLowerCase() === targetWords[2];

    if (isMatch) {
      // Success
      const userId = user?.id || "guest_user";
      await walletService.logActivity(
        userId,
        "RECOVERY_PHRASE_VERIFIED",
        "Recovery phrase verified successfully",
      );

      // Log backup_completed activity and notification
      await logActivityAndNotificationDirect(
        userId,
        "backup_completed",
        "system",
        "Seed Phrase Backed Up",
        "Your 12-word master recovery phrase was successfully backed up and verified.",
      );

      // Persist onboarding completed flag to prevent returning here
      if (typeof window !== "undefined") {
        localStorage.setItem(`tori_onboarding_completed_${userId}`, "true");
      }

      // Clear session storage
      sessionStorage.removeItem(`tori_mnemonic_${userId}`);

      toast.success("Recovery phrase verified successfully!");
      setIsSuccess(true);
      setVerifying(false);
    } else {
      setVerifying(false);
      toast.error("Recovery phrase does not match. Please try again.");
    }
  };

  if (loading) {
    return <AuthLoading message="Preparing Verification..." />;
  }

  if (verifying) {
    return <AuthLoading message="Verifying Recovery Phrase..." />;
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Wallet Successfully Created!"
        subtitle="Your non-custodial HD wallet is fully generated, backed up, and ready."
      >
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          {/* Glowing Verification Success Badge */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 p-0.5 shadow-premium">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-sm font-bold text-white">Wallet Setup Completed</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are now in full control of your private keys. Remember, Tori never stores your
              master recovery phrase, keeping your assets completely safe and secure.
            </p>
          </div>

          {/* Wallet Security Overview Panel */}
          <div className="w-full space-y-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-muted-foreground font-medium">Wallet Type</span>
              <span className="text-white font-semibold">BIP39 HD Wallet (12 Words)</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-muted-foreground font-medium">Encryption Standard</span>
              <span className="text-white font-semibold">AES-256-GCM Secure Key</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Custody Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Self-Custodial
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/app" })}
            className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium shadow-glow transition-all hover:opacity-95 mt-2"
          >
            <span>Go to Home Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  const canSubmit = input1.trim() && input2.trim() && input3.trim();

  return (
    <AuthLayout
      title="Verify Recovery Phrase"
      subtitle="Confirm your recovery phrase to ensure you have backed it up correctly."
    >
      <div className="flex flex-col space-y-6 pt-1">
        {/* Progress Tracker */}
        <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-white">Account Created</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-white">Wallet Generated</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-white">Recovery Phrase Saved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-brand flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-brand" />
            </div>
            <span className="text-brand font-semibold">Verification</span>
          </div>
        </div>

        {/* Verification Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white ml-1">
              Enter word #{targetIndices[0] + 1}
            </label>
            <input
              type="text"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
              placeholder="Type word here..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white ml-1">
              Enter word #{targetIndices[1] + 1}
            </label>
            <input
              type="text"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
              placeholder="Type word here..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white ml-1">
              Enter word #{targetIndices[2] + 1}
            </label>
            <input
              type="text"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              value={input3}
              onChange={(e) => setInput3(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
              placeholder="Type word here..."
            />
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={!canSubmit}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all shadow-premium ${
            canSubmit
              ? "gradient-brand shadow-glow hover:opacity-95"
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          }`}
        >
          <span>Verify & Complete Setup</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthLayout>
  );
}
