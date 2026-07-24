import { ReactNode } from "react";
import { Bird, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthLayout({
  title,
  subtitle,
  children,
  showBackToWelcome = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBackToWelcome?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-background p-4 sm:p-6 text-foreground">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <Link
            to="/auth/welcome"
            className="group mb-4 flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10 hover:bg-white/10 transition-all"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white shadow-premium">
              <Bird className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="text-xl font-bold tracking-tight text-white pr-2">Tori</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-xs text-muted-foreground max-w-xs">{subtitle}</p>}
        </div>

        {/* Card Body */}
        <div className="glass rounded-3xl p-6 sm:p-7 shadow-premium border border-white/10 space-y-5">
          {children}
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Secured with Supabase End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}
