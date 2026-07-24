import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Mail,
  Loader2,
  ArrowRight,
  XCircle,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function VerifyEmailScreen() {
  const searchParams = useSearch({ strict: false });
  const initialEmail =
    (searchParams as { email?: string; type?: "signup" | "recovery" }).email || "";
  const authType =
    (searchParams as { email?: string; type?: "signup" | "recovery" }).type || "signup";

  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // 60-second countdown for Resend OTP
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(2);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus first input on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  // Check if email is already verified in demo mode
  useEffect(() => {
    if (!email) return;
    try {
      const storedUsers = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      const u = storedUsers[email.toLowerCase()];
      if (u && u.verified && authType === "signup") {
        setIsAlreadyVerified(true);
        toast.info("This email address is already verified.");
        const t = setTimeout(() => {
          navigate({ to: "/auth/login" });
        }, 1500);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, [email, authType, navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  // Handle automatic redirect countdown after verification success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerified) {
      timer = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (authType === "recovery") {
              navigate({ to: "/auth/reset-password", search: { email: email.trim() } });
            } else {
              navigate({ to: "/auth/login" });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerified, authType, email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (isVerified || loading) return;

    // Filter only numbers
    const cleanVal = value.replace(/\D/g, "");

    const newOtp = [...otp];

    // Handle paste of full 6-digit code or multi-digit input
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || "";
      }
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Clear error state when user types
    if (errorMessage) setErrorMessage(null);

    // Auto focus next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isVerified || loading) return;

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isVerified || loading) return;

    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split("");
    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || "";
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const fullCode = otp.join("");
  const isCodeComplete = fullCode.length === 6;

  const executeVerification = useCallback(
    async (codeToVerify: string) => {
      if (!email.trim()) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      if (attempts >= 5) {
        setErrorMessage("Too many failed attempts. Please click Resend Code for a new OTP.");
        setIsExpired(true);
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      setIsExpired(false);

      const res = await verifyOtp(email.trim(), codeToVerify, authType);

      setLoading(false);

      if (res.error) {
        setAttempts((prev) => prev + 1);
        if (res.error.toLowerCase().includes("expire")) {
          setIsExpired(true);
          setErrorMessage("This code has expired. Please request a new code.");
        } else {
          setErrorMessage("Invalid verification code. Please try again.");
        }
        toast.error(res.error.includes("Invalid") ? "Invalid verification code." : res.error);
        return;
      }

      // Success
      setIsVerified(true);
      toast.success("Email verified successfully.");
    },
    [email, attempts, authType, verifyOtp],
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isCodeComplete || loading || isVerified) return;
    executeVerification(fullCode);
  };

  const handleResend = async () => {
    if (!canResend || resending || !email.trim()) return;

    setResending(true);
    setErrorMessage(null);
    setIsExpired(false);

    const res = await resendOtp(email.trim(), authType);

    setResending(false);

    if (res.error) {
      toast.error(res.error);
      setErrorMessage(res.error);
    } else {
      setCanResend(false);
      setCountdown(60);
      setAttempts(0);
      setOtp(["", "", "", "", "", ""]);
      toast.success("A new verification code has been sent.");
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a 6-digit verification code to your email address."
    >
      <div className="space-y-5">
        {/* User Email Pill Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Mail className="h-4 w-4" />
            </div>
            <div className="truncate text-left">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Verification Sent To
              </p>
              <p className="text-xs font-semibold text-foreground truncate">
                {email || "your email address"}
              </p>
            </div>
          </div>
          {!initialEmail && (
            <button
              type="button"
              onClick={() => setEmail("")}
              className="text-[11px] font-medium text-brand hover:underline shrink-0"
            >
              Change
            </button>
          )}
        </div>

        {/* Email Input fallback if missing from URL */}
        {!initialEmail && !email && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Confirm Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        )}

        {/* Already Verified Banner */}
        {isAlreadyVerified && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/15 p-3.5 text-xs text-emerald-300 border border-emerald-500/30"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Email is already verified! Redirecting to login...</span>
          </motion.div>
        )}

        {/* Success Banner */}
        <AnimatePresence>
          {isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center space-y-2 rounded-2xl bg-emerald-500/15 p-5 text-center border border-emerald-500/30 text-emerald-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-emerald-200">Email verified successfully.</p>
              <p className="text-xs text-emerald-300/80">
                Redirecting to login in {redirectTimer} second{redirectTimer !== 1 ? "s" : ""}...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {!isVerified && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-2xl bg-red-500/15 p-3.5 text-xs text-red-300 border border-red-500/30"
          >
            <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-medium">{errorMessage}</p>
              {isExpired && (
                <p className="text-[11px] text-red-300/80">
                  Please click <span className="font-semibold underline">Resend Code</span> below to
                  get a fresh 6-digit OTP code.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* 6-Digit OTP Form */}
        {!isVerified && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  6-Digit Verification Code
                </label>
                {attempts > 0 && (
                  <span className="text-[11px] text-muted-foreground">Attempt {attempts}/5</span>
                )}
              </div>

              {/* 6 OTP Input Boxes */}
              <div className="flex items-center justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    disabled={loading || isVerified}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`h-13 w-11 sm:w-12 rounded-2xl border text-center text-xl font-bold font-mono transition-all focus:outline-none disabled:opacity-50 ${
                      errorMessage
                        ? "border-red-500/50 bg-red-500/10 text-red-200 focus:ring-2 focus:ring-red-500/50"
                        : digit
                          ? "border-brand/60 bg-brand/10 text-foreground ring-2 ring-brand/20"
                          : "border-white/10 bg-white/5 text-foreground focus:border-brand focus:bg-white/10 focus:ring-2 focus:ring-brand/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={!isCodeComplete || loading || isVerified || attempts >= 5}
              className="gradient-brand relative flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-premium transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Didn't receive the code?</span>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resending || loading}
                className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed transition-all"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3" />
                    <span>{canResend ? "Resend Code" : `Resend in ${countdown}s`}</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center text-xs text-muted-foreground pt-1">
              Back to{" "}
              <Link to="/auth/login" className="font-semibold text-brand hover:underline">
                Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
