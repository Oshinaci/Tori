import { useState, useEffect } from "react";
import { AuthLayout } from "./AuthLayout";
import { AuthLoading } from "./AuthLoading";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";

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

  useEffect(() => {
    let isMounted = true;
    let mnemonicLocal: string | null = null;

    async function loadAndPrepare() {
      const userId = user?.id || "guest_user";
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

      // Clear session storage
      sessionStorage.removeItem(`tori_mnemonic_${userId}`);

      toast.success("Recovery phrase verified! Welcome to Tori.");
      navigate({ to: "/app" });
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
