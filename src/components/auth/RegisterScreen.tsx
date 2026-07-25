import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function RegisterScreen() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation rules
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = emailValid && hasMinLength && hasNumberOrSymbol && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await signUp(email.trim(), password);

    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    toast.success("Account created! Check your email for the 6-digit OTP code.");
    navigate({
      to: "/auth/verify-email",
      search: { email: email.trim(), type: "signup" },
    });
  };

  return (
    <AuthLayout
      title="Create Tori Account"
      subtitle="Register with your email to generate your secure non-custodial wallet."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-red-500/15 p-3.5 text-xs text-red-300 border border-red-500/30">
            <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Password Requirements Checklist */}
          {password.length > 0 && (
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Confirm Password</label>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <>
              <span>Continue to Verification</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-semibold text-brand hover:underline">
            Log In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
