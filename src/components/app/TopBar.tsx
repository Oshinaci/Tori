import { useState } from "react";
import { Bell, Bird, Check, Copy } from "lucide-react";
import { shortAddr } from "./data";
import { NotificationsSheet } from "./NotificationsSheet";
import { useWallet } from "@/context/WalletContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export function TopBar({ title }: { title?: string }) {
  const { walletAddress, network, loading } = useWallet();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const copyAddr = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success(t("copied", "Address copied to clipboard"));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={copyAddr}
            disabled={loading || !walletAddress}
            className="glass inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Copy wallet address"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full gradient-brand text-white shadow-sm">
              <Bird className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <span className="truncate">
              {loading ? "Loading..." : walletAddress ? shortAddr(walletAddress) : "No wallet"}
            </span>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium cursor-default">
            {network.icon ? (
              <img src={network.icon} alt={network.name} className="h-3.5 w-3.5 rounded-full" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-brand" />
            )}
            {network.name}
          </div>

          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="glass relative grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
          </button>
        </div>

        {title && (
          <h1 className="col-span-2 mt-4 text-2xl font-semibold tracking-tight text-white">
            {title}
          </h1>
        )}
      </header>

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
}
