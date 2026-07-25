import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Loader2, ArrowRight, XCircle } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { CreatePinScreen } from "./CreatePinScreen";
import { EnterPinScreen } from "./EnterPinScreen";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function LoginScreen() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pinAction, setPinAction] = useState<"create" | "enter" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    setErrorMessage(null);

    const res = await signIn(email.trim(), password);

    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    if (res.data) {
      if (!res.data.hasPin) {
        toast.info("Please set up your 6-digit security PIN.");
        setPinAction("create");
      } else {
        toast.success("Welcome back! Enter your PIN.");
        setPinAction("enter");
      }
    }
  };

  if (pinAction === "create") {
    return <CreatePinScreen onSuccess={() => navigate({ to: "/app" })} />;
  }

  if (pinAction === "enter") {
    return <EnterPinScreen onSuccess={() => navigate({ to: "/app" })} />;
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in with your email and password to access your Tori Wallet."
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-brand hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!email || !password || loading}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Logging In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Don't have an account yet?{" "}
          <Link to="/auth/register" className="font-semibold text-brand hover:underline">
            Create Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
