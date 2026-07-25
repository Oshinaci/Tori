import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Delete, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { AuthLoading } from "./AuthLoading";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";
import { logActivityAndNotificationDirect } from "@/lib/activity-logger";
import { toast } from "sonner";

interface CreatePinScreenProps {
  onSuccess?: () => void;
}

export function CreatePinScreen({ onSuccess }: CreatePinScreenProps) {
  const { user, createPin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const activePin = step === "create" ? firstPin : confirmPin;

  const handleKeyPress = (digit: string) => {
    if (loading || isDone) return;
    setErrorMsg(null);

    if (step === "create") {
      if (firstPin.length < 6) {
        setFirstPin((prev) => prev + digit);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin((prev) => prev + digit);
      }
    }
  };

  const handleDelete = () => {
    if (loading || isDone) return;
    setErrorMsg(null);

    if (step === "create") {
      setFirstPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (loading || isDone) return;
    setErrorMsg(null);

    if (step === "create") {
      setFirstPin("");
    } else {
      setConfirmPin("");
    }
  };

  // Step 1: When 6 digits entered, transition to confirm step
  useEffect(() => {
    if (step === "create" && firstPin.length === 6) {
      const timer = setTimeout(() => {
        setStep("confirm");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [firstPin, step]);

  // Step 2: When 6 digits entered in confirm step, check match and hash
  useEffect(() => {
    if (step === "confirm" && confirmPin.length === 6) {
      if (firstPin !== confirmPin) {
        setErrorMsg("PINs do not match. Please try again.");
        toast.error("PIN mismatch");
        setTimeout(() => {
          setConfirmPin("");
          setFirstPin("");
          setStep("create");
        }, 1200);
        return;
      }

      // Hash & Store PIN and initialize HD Wallet foundation
      const submitPin = async () => {
        setLoading(true);
        const res = await createPin(confirmPin);

        if (!res.success) {
          setLoading(false);
          setErrorMsg(res.error || "Failed to create PIN.");
          toast.error(res.error || "Failed to create PIN.");
          setConfirmPin("");
          setFirstPin("");
          setStep("create");
          return;
        }

        // Initialize HD Wallet Foundation
        const userId = user?.id || "guest_user";
        try {
          const { isNew, wallet } = await walletService.getOrCreateWallet(userId);

          // Log PIN and Wallet creations
          await logActivityAndNotificationDirect(
            userId,
            "security",
            "system",
            "Security PIN Set",
            "Your 6-digit security PIN has been successfully set up and encrypted.",
          );

          if (isNew && wallet) {
            await logActivityAndNotificationDirect(
              userId,
              "wallet_created",
              "system",
              "Wallet Created",
              `New Arbitrum One wallet successfully initialized: ${wallet.wallet_address.slice(0, 6)}...${wallet.wallet_address.slice(-4)}`,
            );
          }

          setLoading(false);
          setIsDone(true);
          toast.success("Security PIN & HD Wallet created successfully!");

          setTimeout(() => {
            if (isNew) {
              navigate({ to: "/auth/recovery-phrase" });
            } else if (onSuccess) {
              onSuccess();
            } else {
              navigate({ to: "/app" });
            }
          }, 1200);
        } catch (err) {
          console.error("Wallet initialization error:", err);
          setLoading(false);
          setErrorMsg("Wallet initialization failed. Please try again.");
          toast.error("Wallet initialization failed. Please try again.");
        }
      };

      submitPin();
    }
  }, [confirmPin, firstPin, step, createPin, user, navigate, onSuccess]);

  if (isDone) {
    return <AuthLoading message="PIN encrypted & secured! Loading Tori Wallet..." />;
  }

  return (
    <AuthLayout
      title={step === "create" ? "Create Security PIN" : "Confirm Security PIN"}
      subtitle={
        step === "create"
          ? "Set a 6-digit PIN to protect your non-custodial wallet and sensitive transactions."
          : "Re-enter your 6-digit PIN to verify."
      }
    >
      <div className="flex flex-col items-center space-y-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-8 rounded-full transition-all ${
              step === "create" ? "bg-brand w-10" : "bg-emerald-500"
            }`}
          />
          <span
            className={`h-2 w-8 rounded-full transition-all ${
              step === "confirm" ? "bg-brand w-10" : "bg-white/20"
            }`}
          />
        </div>

        {/* PIN Dots display */}
        <div className="flex items-center gap-3 py-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < activePin.length;
            return (
              <div
                key={idx}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                  isFilled
                    ? "border-brand bg-brand/20 shadow-glow text-brand text-xl font-bold"
                    : "border-white/10 bg-white/5 text-muted-foreground"
                }`}
              >
                {isFilled ? <Lock className="h-5 w-5 animate-pulse" /> : "•"}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-300 border border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid w-full max-w-xs grid-cols-3 gap-3 pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={loading}
              className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || activePin.length === 0}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-xs font-semibold text-muted-foreground transition-all hover:bg-white/10 disabled:opacity-30"
          >
            Clear
          </button>

          {/* 0 digit */}
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || activePin.length === 0}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {step === "confirm" && (
          <button
            type="button"
            onClick={() => {
              setStep("create");
              setFirstPin("");
              setConfirmPin("");
              setErrorMsg(null);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Start Over</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground text-center px-4">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Only hashed PINs are stored securely on device.</span>
        </div>
      </div>
    </AuthLayout>
  );
}
