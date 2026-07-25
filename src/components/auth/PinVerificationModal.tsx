import { useState, useEffect } from "react";
import { Lock, Delete, AlertCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { pinService } from "@/lib/pin-service";
import { toast } from "sonner";

interface PinVerificationModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  actionName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinVerificationModal({
  isOpen,
  title = "Authorize Sensitive Action",
  description,
  actionName = "security action",
  onSuccess,
  onCancel,
}: PinVerificationModalProps) {
  const { verifyPin, user } = useAuth();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Check lockout status
  useEffect(() => {
    if (isOpen && user) {
      const status = pinService.getLockoutStatus(user.id);
      if (status.isLocked) {
        setCooldown(status.cooldownSeconds);
      } else {
        setCooldown(0);
      }
      setPin("");
      setErrorMsg(null);
    }
  }, [isOpen, user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleKeyPress = (digit: string) => {
    if (loading || cooldown > 0) return;
    if (pin.length < 6) {
      setErrorMsg(null);
      setPin((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    if (loading || cooldown > 0) return;
    setErrorMsg(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading || cooldown > 0) return;
    setErrorMsg(null);
    setPin("");
  };

  // Verify PIN when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && cooldown === 0 && isOpen) {
      const runVerify = async () => {
        setLoading(true);
        setErrorMsg(null);

        const res = await verifyPin(pin);

        setLoading(false);
        setPin(""); // Clear PIN from memory immediately after verification

        if (!res.success) {
          setErrorMsg(res.error || "Incorrect PIN.");
          toast.error(res.error || "Incorrect PIN.");

          if (res.isLocked && res.cooldownSeconds) {
            setCooldown(res.cooldownSeconds);
          }
          return;
        }

        toast.success("PIN verified successfully");
        onSuccess();
      };

      runVerify();
    }
  }, [pin, cooldown, isOpen, verifyPin, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl space-y-5 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/20 text-brand">
          <Lock className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {description || `Enter your 6-digit PIN to authorize ${actionName}.`}
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-2.5 py-1">
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                  isFilled
                    ? "border-brand bg-brand/20 text-brand font-bold text-lg shadow-glow"
                    : "border-white/10 bg-white/5 text-muted-foreground"
                }`}
              >
                {isFilled ? "•" : ""}
              </div>
            );
          })}
        </div>

        {/* Lockout Banner */}
        {cooldown > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 p-2.5 text-xs font-semibold text-red-300 border border-red-500/30">
            <Clock className="h-4 w-4 text-red-400 shrink-0 animate-spin" />
            <span>Cooldown: Try again in {cooldown}s</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && cooldown === 0 && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 p-2.5 text-xs font-semibold text-red-300 border border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={loading || cooldown > 0}
              className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base font-bold text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            disabled={loading || pin.length === 0 || cooldown > 0}
            className="flex h-12 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-xs font-semibold text-muted-foreground transition-all hover:bg-white/10 disabled:opacity-30"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading || cooldown > 0}
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-base font-bold text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0 || cooldown > 0}
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
          >
            <Delete className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
