import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Delete, ShieldAlert, AlertCircle, LogOut, Clock } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { AuthLoading } from "./AuthLoading";
import { useAuth } from "@/context/AuthContext";
import { pinService } from "@/lib/pin-service";
import { toast } from "sonner";

interface EnterPinScreenProps {
  onSuccess?: () => void;
}

export function EnterPinScreen({ onSuccess }: EnterPinScreenProps) {
  const { verifyPin, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Check lockout status on mount
  useEffect(() => {
    if (user) {
      const status = pinService.getLockoutStatus(user.id);
      if (status.isLocked) {
        setCooldown(status.cooldownSeconds);
      }
    }
  }, [user]);

  // Cooldown timer tick
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
    if (loading || isUnlocked || cooldown > 0) return;
    if (pin.length < 6) {
      setErrorMsg(null);
      setPin((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    if (loading || isUnlocked || cooldown > 0) return;
    setErrorMsg(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading || isUnlocked || cooldown > 0) return;
    setErrorMsg(null);
    setPin("");
  };

  // Submit when 6 digits reached
  useEffect(() => {
    if (pin.length === 6 && cooldown === 0) {
      const submitVerify = async () => {
        setLoading(true);
        setErrorMsg(null);

        const res = await verifyPin(pin);

        setLoading(false);

        if (!res.success) {
          setPin("");
          setErrorMsg(res.error || "Incorrect PIN.");
          toast.error(res.error || "Incorrect PIN.");

          if (res.isLocked && res.cooldownSeconds) {
            setCooldown(res.cooldownSeconds);
          }
          return;
        }

        setIsUnlocked(true);
        toast.success("PIN verified!");

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate({ to: "/app" });
          }
        }, 1000);
      };

      submitVerify();
    }
  }, [pin, cooldown, verifyPin, navigate, onSuccess]);

  if (isUnlocked) {
    return <AuthLoading message="PIN verified! Unlocking Tori Wallet..." />;
  }

  return (
    <AuthLayout
      title="Enter Security PIN"
      subtitle={`Welcome back${user?.email ? `, ${user.email.split("@")[0]}` : ""}! Enter your 6-digit PIN to access your wallet.`}
    >
      <div className="flex flex-col items-center space-y-6 pt-2">
        {/* PIN Hero icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand/20 via-purple-500/20 to-emerald-500/20 p-0.5 shadow-premium">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950/90 backdrop-blur-md">
            <Lock className="h-9 w-9 text-brand animate-pulse" />
          </div>
        </div>

        {/* PIN Dots display */}
        <div className="flex items-center gap-3 py-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                  isFilled
                    ? "border-brand bg-brand/20 shadow-glow text-brand font-bold text-xl"
                    : "border-white/10 bg-white/5 text-muted-foreground"
                }`}
              >
                {isFilled ? "•" : ""}
              </div>
            );
          })}
        </div>

        {/* Lockout / Cooldown Banner */}
        {cooldown > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 text-xs font-semibold text-red-300 border border-red-500/30">
            <Clock className="h-4 w-4 text-red-400 shrink-0 animate-spin" />
            <span>Too many failed attempts. Try again in {cooldown}s.</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && cooldown === 0 && (
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
              disabled={loading || cooldown > 0}
              className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
            >
              {num}
            </button>
          ))}

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || pin.length === 0 || cooldown > 0}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-xs font-semibold text-muted-foreground transition-all hover:bg-white/10 disabled:opacity-30"
          >
            Clear
          </button>

          {/* 0 digit */}
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading || cooldown > 0}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0 || cooldown > 0}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-foreground transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Switch Account / Logout */}
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth/login" });
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors pt-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Switch Account or Log In Again</span>
        </button>
      </div>
    </AuthLayout>
  );
}
