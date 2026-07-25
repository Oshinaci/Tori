import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Fingerprint,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { AuthLoading } from "./AuthLoading";
import { toast } from "sonner";

interface CreatePasskeyScreenProps {
  email?: string;
  userId?: string;
  onSuccess?: () => void;
  onSkip?: () => void;
}

export function CreatePasskeyScreen({
  email,
  userId,
  onSuccess,
  onSkip,
}: CreatePasskeyScreenProps) {
  const { registerPasskey, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeEmail = email || user?.email || "";
  const activeUserId = userId || user?.id || "";

  const handleCreatePasskey = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);

    const targetUser =
      activeUserId && activeEmail ? { id: activeUserId, email: activeEmail } : undefined;
    const res = await registerPasskey(targetUser);

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
      toast.error(res.error);
      return;
    }

    setSuccess(true);
    toast.success("Passkey registered successfully!");

    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate({ to: "/app" });
      }
    }, 1500);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      toast.info("You can set up a Passkey anytime in account settings.");
      navigate({ to: "/app" });
    }
  };

  if (success) {
    return <AuthLoading message="Passkey verified! Redirecting to Tori Wallet..." />;
  }

  return (
    <AuthLayout
      title="Create Your Passkey"
      subtitle="Upgrade your account with biometric security using Face ID, Touch ID, or Device PIN."
    >
      <div className="space-y-5">
        {/* Visual Passkey Hero Icon */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand/20 via-purple-500/20 to-emerald-500/20 p-0.5 shadow-premium">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950/90 backdrop-blur-md">
            <Fingerprint className="h-12 w-12 text-brand animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg">
            <ShieldCheck className="h-4 w-4" />
          </span>
        </div>

        {/* Feature benefits badge list */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5 text-foreground font-medium">
            <KeyRound className="h-4 w-4 text-brand shrink-0" />
            <span>Instant Passwordless Login</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Passkeys store encrypted keys directly on your device's Secure Enclave. Biometric data
            never leaves your phone or laptop.
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="rounded-2xl bg-red-500/15 p-3.5 text-xs text-red-300 border border-red-500/30 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-red-200">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>Passkey Registration Canceled or Failed</span>
            </div>
            <p className="text-[11px] text-red-300/80 leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleCreatePasskey}
            disabled={loading}
            className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirming Biometrics...</span>
              </>
            ) : errorMsg ? (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Retry Passkey Registration</span>
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4" />
                <span>Register Passkey Now</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full text-center py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
