import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Lock, Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function ResetPasswordScreen() {
  const searchParams = useSearch({ strict: false });
  const email = (searchParams as { email?: string }).email || "";

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMinLength = newPassword.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isValid = hasMinLength && hasNumberOrSymbol && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await resetPassword(newPassword, email);

    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    setSuccess(true);
    toast.success("Password updated successfully!");
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset Complete">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </span>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Your password has been successfully updated. You can now log in with your new
            credentials.
          </p>

          <Link
            to="/auth/login"
            className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Set a strong new password for your Tori Wallet account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-red-500/15 p-3.5 text-xs text-red-300 border border-red-500/30">
            <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {newPassword.length > 0 && (
            <div className="space-y-1 pt-1 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? "text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {hasMinLength ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground ml-1" />
                )}
                <span>At least 8 characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasNumberOrSymbol ? "text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {hasNumberOrSymbol ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground ml-1" />
                )}
                <span>Contains a number or special character</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-[11px] text-red-400">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Back to{" "}
          <Link to="/auth/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
