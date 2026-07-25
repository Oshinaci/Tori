import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bird, ShieldCheck, Loader2, Lock, Sparkles, X } from "lucide-react";

export interface AuthLoadingProps {
  /**
   * Main heading or transition message displayed to the user.
   * @default "Authenticating session..."
   */
  message?: string;
  /**
   * Optional secondary subtitle for extra context.
   */
  subtitle?: string;
  /**
   * Whether to render as a fixed full-screen overlay over existing UI.
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Optional numeric progress percentage (0 to 100). If omitted, an indeterminate shimmer animation is shown.
   */
  progress?: number;
  /**
   * Custom Lucide icon component to display in place of the default Tori bird.
   */
  icon?: ReactNode;
  /**
   * Optional cancel action handler (e.g. to abort a long transition).
   */
  onCancel?: () => void;
  /**
   * Controls visibility when used with state-based overlays.
   * @default true
   */
  isVisible?: boolean;
}

export function AuthLoading({
  message = "Authenticating session...",
  subtitle = "Securing non-custodial cryptographic keys",
  fullScreen = true,
  progress,
  icon,
  onCancel,
  isVisible = true,
}: AuthLoadingProps) {
  if (!isVisible) return null;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 text-center"
    >
      {/* Outer Glow & Glass HUD Container */}
      <div className="glass relative flex w-full flex-col items-center space-y-6 rounded-3xl border border-white/10 p-7 shadow-premium backdrop-blur-2xl">
        {/* Optional Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cancel transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Animated Tori Brand Icon Hub */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Animated Outer Orbit Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl border border-dashed border-brand/40"
          />

          {/* Pulse Ripple Aura */}
          <motion.div
            animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl gradient-brand blur-md"
          />

          {/* Main Logo Badge */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-white shadow-premium ring-1 ring-white/20">
            {icon || <Bird className="h-8 w-8 text-white" strokeWidth={2.2} />}
          </div>
        </div>

        {/* Text & Status Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">{message}</span>
          </div>
          {subtitle && (
            <p className="mx-auto max-w-xs text-xs font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Progress Bar or Shimmer Indicator */}
        <div className="w-full space-y-2 pt-1">
          {typeof progress === "number" ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand" />
                  <span>Encrypting Vault</span>
                </span>
                <span className="text-brand">{Math.min(100, Math.max(0, progress))}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full gradient-brand shadow-glow"
                />
              </div>
            </div>
          ) : (
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full gradient-brand shadow-glow"
              />
            </div>
          )}
        </div>

        {/* Security Badge Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>End-to-End Encrypted Tori Transition</span>
        </div>
      </div>
    </motion.div>
  );

  if (!fullScreen) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center p-4">{content}</div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex min-h-screen w-full items-center justify-center overflow-hidden bg-background/90 p-4 backdrop-blur-2xl sm:p-6">
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-cyan/15 blur-3xl" />
          <div className="pointer-events-none fixed top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

          {content}
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Dedicated full-screen loading component overlay using the Tori design system.
 * Use this to overlay the entire UI during auth transitions, PIN validations, or session checks.
 */
export function FullScreenAuthOverlay(props: Omit<AuthLoadingProps, "fullScreen">) {
  return <AuthLoading {...props} fullScreen={true} />;
}
