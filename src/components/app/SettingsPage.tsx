import { useState } from "react";
import {
  ChevronRight,
  Fingerprint,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  Moon,
  Check,
  User as UserIcon,
  Mail,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { TopBar } from "./TopBar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES, LanguageCode } from "@/context/LanguageContext";
import { toast } from "sonner";

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      className="data-[state=checked]:gradient-brand data-[state=unchecked]:bg-white/10"
    />
  );
}

export function SettingsPage() {
  const { user, signOut, registerPasskey, hasPasskeyRegistered } = useAuth();
  const { language, setLanguageCode, t } = useLanguage();
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate({ to: "/auth/login" });
  };

  return (
    <>
      <TopBar title={t("settings", "Settings")} />

      <div className="mt-4 space-y-6">
        {/* Current Logged In User Profile */}
        <section className="glass rounded-3xl p-4 border border-white/10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white font-bold text-lg shadow-premium">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">
              {user?.email?.split("@")[0] || "Tori Wallet User"}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{user?.email || "user@tori.wallet"}</span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
            Verified
          </span>
        </section>

        {/* Security Group */}
        <section>
          <h2 className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("security", "Security")}
          </h2>
          <ul className="glass mt-2 divide-y divide-white/5 overflow-hidden rounded-3xl">
            <li
              onClick={async () => {
                if (user) {
                  toast.info("Opening Passkey registration...");
                  const res = await registerPasskey();
                  if (res.credential) {
                    toast.success("Passkey added to account!");
                  } else if (res.error) {
                    toast.error(res.error);
                  }
                }
              }}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-brand">
                <Fingerprint className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Passkey Authentication</div>
                <div className="text-[11px] text-muted-foreground">
                  {hasPasskeyRegistered() ? "Registered & Active" : "No Passkey attached"}
                </div>
              </div>
              <span className="rounded-xl bg-brand/20 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/30">
                + Add Passkey
              </span>
            </li>
            <li className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">
                <Shield className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">Recovery phrase</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
            <li className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">
                <Moon className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">Auto-lock</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
          </ul>
        </section>

        {/* Preferences Group */}
        <section>
          <h2 className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("preferences", "Preferences")}
          </h2>
          <ul className="glass mt-2 divide-y divide-white/5 overflow-hidden rounded-3xl">
            <li className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">
                <Bell className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">Notifications</span>
              <Toggle defaultOn={true} />
            </li>

            {/* Language Selector Trigger */}
            <li
              onClick={() => setIsLangOpen(true)}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">
                <Globe className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">
                {t("language", "Language")}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{language.flag}</span>
                  <span>{language.nativeName}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </li>
          </ul>
        </section>

        {/* Support Group */}
        <section>
          <h2 className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Support
          </h2>
          <ul className="glass mt-2 divide-y divide-white/5 overflow-hidden rounded-3xl">
            <li className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5">
                <HelpCircle className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">Help center</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
          </ul>
        </section>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="glass flex w-full items-center justify-center gap-2 rounded-3xl px-4 py-3.5 text-sm font-semibold text-red-400 hover:bg-white/5 border border-red-500/20 transition-all active:scale-[0.99]"
        >
          <LogOut className="h-4 w-4" />
          <span>{t("signOut", "Sign out")}</span>
        </button>

        <p className="pb-4 pt-2 text-center text-xs text-muted-foreground">
          Tori Wallet · Production Auth v1.0.0
        </p>
      </div>

      {/* Language Modal Dialog */}
      {isLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-sm rounded-3xl border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand" />
                <h3 className="text-base font-bold text-white">Select Language</h3>
              </div>
              <button
                onClick={() => setIsLangOpen(false)}
                className="text-xs text-muted-foreground hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Close
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
    </>
  );
}
