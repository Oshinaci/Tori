import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bird, ArrowRight, Shield, Zap, Sparkles, Globe, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage, LANGUAGES, LanguageCode } from "@/context/LanguageContext";
import { toast } from "sonner";

export function WelcomeScreen() {
  const { t, language, setLanguageCode } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-background p-5 text-foreground max-w-md mx-auto">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-premium">
            <Bird className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">Tori</span>
        </div>
        <button
          onClick={() => setIsLangOpen(true)}
          className="glass rounded-full px-3 py-1.5 text-xs font-semibold text-foreground flex items-center gap-1.5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 text-brand" />
          <span>{language.flag}</span>
          <span>{language.name}</span>
        </button>
      </div>

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-auto py-8 text-center space-y-6"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-medium text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Self Custody</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight sm:text-4xl">
          {t("welcomeTitle", "Crypto as Easy as GoPay")}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {t(
            "welcomeSubtitle",
            "Everyday self-custody crypto wallet. Fast, ultra-secure, and beautifully simple.",
          )}
        </p>

        {/* Value Props */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="glass rounded-2xl p-3 border border-white/5 space-y-1">
            <Shield className="h-4 w-4 text-emerald-400" />
            <div className="text-xs font-bold text-white">Non-Custodial</div>
            <div className="text-[10px] text-muted-foreground">You hold your keys</div>
          </div>
          <div className="glass rounded-2xl p-3 border border-white/5 space-y-1">
            <Zap className="h-4 w-4 text-amber-400" />
            <div className="text-xs font-bold text-white">Instant Swaps</div>
            <div className="text-[10px] text-muted-foreground">Zero gas friction</div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-3 pb-4">
        <Link
          to="/auth/register"
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-premium transition-all hover:opacity-95 active:scale-[0.99]"
        >
          <span>{t("createAccount", "Create Account")}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          to="/auth/login"
          className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white border border-white/10 hover:bg-white/10 transition-all active:scale-[0.99]"
        >
          <span>{t("login", "Log In")}</span>
        </Link>
      </div>

      {/* Language Modal Dialog */}
      {isLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-sm rounded-3xl border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand" />
                <h3 className="text-base font-bold text-white">
                  {t("selectLanguage", "Select Language")}
                </h3>
              </div>
              <button
                onClick={() => setIsLangOpen(false)}
                className="text-xs text-muted-foreground hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
              >
                {t("close", "Close")}
              </button>
            </div>

            <div className="space-y-2">
              {LANGUAGES.map((item) => {
                const isSelected = item.code === language.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguageCode(item.code as LanguageCode);
                      setIsLangOpen(false);
                      toast.success(`Language set to ${item.nativeName}`);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl p-3.5 text-xs font-semibold transition-all border ${
                      isSelected
                        ? "border-brand/50 bg-brand/15 text-white"
                        : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{item.flag}</span>
                      <div className="text-left">
                        <div className="font-bold text-white">{item.nativeName}</div>
                        <div className="text-[10px] text-muted-foreground">{item.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-brand" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
