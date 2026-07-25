import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  XCircle,
  Fingerprint,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { CreatePasskeyScreen } from "./CreatePasskeyScreen";
import { AuthLoading } from "./AuthLoading";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function LoginScreen() {
  const { signIn, signInWithPasskey, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loadingPasskey, setLoadingPasskey] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [promptCreatePasskey, setPromptCreatePasskey] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{ id: string; email: string } | null>(
    null,
  );

  const handlePasskeyLogin = async () => {
    if (loadingPasskey) return;
    setLoadingPasskey(true);
    setErrorMessage(null);

    const res = await signInWithPasskey(email.trim() || undefined);

    setLoadingPasskey(false);

    if (res.error) {
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    toast.success("Welcome back to Tori Wallet!");
    setAuthenticatedUser({
      id: res.data?.user.id || "",
      email: res.data?.user.email || "",
    });

    setTimeout(() => {
      navigate({ to: "/app" });
    }, 1200);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loadingPassword) return;

    setLoadingPassword(true);
    setErrorMessage(null);

    const res = await signIn(email.trim(), password);

    setLoadingPassword(false);

    if (res.error) {
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    if (res.data?.promptPasskey) {
      toast.info("Secure your account by creating a Passkey!");
      setPromptCreatePasskey(true);
      setAuthenticatedUser({
        id: res.data.user.id,
        email: res.data.user.email || email.trim(),
      });
      return;
    }

    toast.success("Welcome back to Tori Wallet!");
    navigate({ to: "/app" });
  };

  if (authenticatedUser && !promptCreatePasskey) {
    return <AuthLoading message="Passkey verified! Loading your wallet..." />;
  }

  if (promptCreatePasskey && authenticatedUser) {
    return (
      <CreatePasskeyScreen
        email={authenticatedUser.email}
        userId={authenticatedUser.id}
        onSuccess={() => navigate({ to: "/app" })}
        onSkip={() => navigate({ to: "/app" })}
      />
    );
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Authenticate seamlessly using your device Passkey or email recovery."
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-red-500/15 p-3.5 text-xs text-red-300 border border-red-500/30">
            <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Action: Passkey Authentication */}
        <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-purple-500/10 to-transparent p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Passkey Biometric Login</h3>
              <p className="text-[11px] text-muted-foreground">Face ID, Touch ID, or Device PIN</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePasskeyLogin}
            disabled={loadingPasskey || loadingPassword}
            className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPasskey ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Biometrics...</span>
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4" />
                <span>Continue with Passkey</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <button
              type="button"
              onClick={() => setShowPasswordFallback(!showPasswordFallback)}
              className="bg-slate-950 px-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {showPasswordFallback ? "Hide Recovery Option" : "Or Recovery via Password"}
            </button>
          </div>
        </div>

        {/* Fallback Email + Password Form */}
        {showPasswordFallback && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
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

            {/* Submit Password Login Button */}
            <button
              type="submit"
              disabled={!email || !password || loadingPassword || loadingPasskey}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3 text-xs font-bold text-foreground transition-all hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loadingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Log In with Password</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Don't have an account yet?{" "}
          <Link to="/auth/register" className="font-semibold text-brand hover:underline">
            Create Account & Passkey
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
