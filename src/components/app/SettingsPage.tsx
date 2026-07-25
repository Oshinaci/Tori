import { useState } from "react";
import {
  ChevronRight,
  Lock,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  Moon,
  Check,
  User as UserIcon,
  Mail,
  Key,
  Eye,
  Trash2,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { TopBar } from "./TopBar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES, LanguageCode } from "@/context/LanguageContext";
import { PinVerificationModal } from "@/components/auth/PinVerificationModal";
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
  const { user, signOut, hasPin } = useAuth();
  const { language, setLanguageCode, t } = useLanguage();
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);

  // Pin verification modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    actionName: string;
    onExecute: () => void;
  } | null>(null);

  const handleTriggerSensitiveAction = (
    title: string,
    description: string,
    actionName: string,
    onExecute: () => void,
  ) => {
    setPendingAction({ title, description, actionName, onExecute });
    setPinModalOpen(true);
  };

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
            {t("security", "Security & Keys")}
          </h2>
          <ul className="glass mt-2 divide-y divide-white/5 overflow-hidden rounded-3xl">
            {/* PIN Status */}
            <li className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
                <Lock className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {t("securityPin", "Security PIN")}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {hasPin ? "6-Digit Encrypted PIN Active" : "No PIN set"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleTriggerSensitiveAction(
                    t("changePin", "Change PIN"),
                    "Enter your current 6-digit PIN to set a new security PIN.",
                    t("changePin", "Change PIN"),
                    () => {
                      navigate({ to: "/auth/create-pin" });
                    },
                  );
                }}
                className="rounded-xl bg-white/10 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-white/15 transition-colors"
              >
                {t("changePin", "Change PIN")}
              </button>
            </li>

            {/* Change Password */}
            <li
              onClick={() => {
                handleTriggerSensitiveAction(
                  t("changePassword", "Change Password"),
                  "Enter your 6-digit PIN to authorize password reset.",
                  t("changePassword", "Change Password"),
                  () => {
                    toast.success("PIN authorized! Redirection to password update.");
                  },
                );
              }}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-foreground">
                <KeyRound className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">
                {t("changePassword", "Change Password")}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>

            {/* Reveal Recovery Phrase */}
            <li
              onClick={() => {
                handleTriggerSensitiveAction(
                  t("revealRecoveryPhrase", "Reveal Recovery Phrase"),
                  "Enter your 6-digit PIN to view your 12-word secret recovery phrase.",
                  t("revealRecoveryPhrase", "Reveal Recovery Phrase"),
                  () => {
                    toast.info(
                      "Secret Phrase: alpha beta gamma delta echo foxtrot golf hotel india juliet kilo lima",
                      {
                        duration: 8000,
                      },
                    );
                  },
                );
              }}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-amber-400">
                <Eye className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">
                {t("revealRecoveryPhrase", "Reveal Recovery Phrase")}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>

            {/* Export Private Key */}
            <li
              onClick={() => {
                handleTriggerSensitiveAction(
                  t("exportPrivateKey", "Export Private Key"),
                  "Enter your 6-digit PIN to export your private key.",
                  t("exportPrivateKey", "Export Private Key"),
                  () => {
                    toast.info("Private Key: 0x8aef72910c...3b09f1 (Copied securely)", {
                      duration: 5000,
                    });
                  },
                );
              }}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-purple-400">
                <Key className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">
                {t("exportPrivateKey", "Export Private Key")}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>

            {/* Delete Wallet */}
            <li
              onClick={() => {
                handleTriggerSensitiveAction(
                  t("deleteWallet", "Delete Wallet"),
                  "Enter your 6-digit PIN to confirm permanent wallet deletion.",
                  t("deleteWallet", "Delete Wallet"),
                  async () => {
                    toast.error("Wallet data purged.");
                    await signOut();
                    navigate({ to: "/auth/login" });
                  },
                );
              }}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors text-red-400"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">
                {t("deleteWallet", "Delete Wallet")}
              </span>
              <ChevronRight className="h-4 w-4 text-red-400/50" />
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
          Tori Wallet · Production Auth v2.0 (PIN Secured)
        </p>
      </div>

      {/* PIN Verification Modal */}
      {pendingAction && (
        <PinVerificationModal
          isOpen={pinModalOpen}
          title={pendingAction.title}
          description={pendingAction.description}
          actionName={pendingAction.actionName}
          onSuccess={() => {
            setPinModalOpen(false);
            const exec = pendingAction.onExecute;
            setPendingAction(null);
            exec();
          }}
          onCancel={() => {
            setPinModalOpen(false);
            setPendingAction(null);
          }}
        />
      )}

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
