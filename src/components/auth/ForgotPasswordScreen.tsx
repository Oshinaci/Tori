import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Loader2, ArrowRight, XCircle } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await forgotPassword(email.trim());

    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    toast.success("Verification code sent! Please check your email.");
    navigate({
      to: "/verify-email",
      search: { email: email.trim(), type: "recovery" },
    });
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your registered email address to receive a 6-digit recovery OTP."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-red-500/15 p-3.5 text-xs text-red-300 border border-red-500/30">
            <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

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

        <button
          type="submit"
          disabled={!email || loading}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Code...</span>
            </>
          ) : (
            <>
              <span>Send 6-Digit OTP</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link to="/auth/login" className="font-semibold text-brand hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
