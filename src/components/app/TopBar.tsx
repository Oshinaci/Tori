import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Bird, Check, ChevronDown, Copy } from "lucide-react";
import { NETWORKS, WALLET_ADDRESS, shortAddr } from "./data";
import { NotificationsSheet } from "./NotificationsSheet";

export function TopBar({ title }: { title?: string }) {
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
      setCopied(true);
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
            className="glass inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
            aria-label="Copy wallet address"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full gradient-brand text-white shadow-sm">
              <Bird className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <span className="truncate">{shortAddr(WALLET_ADDRESS)}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: network.color }} />
              {network.name}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {open && (
                <motion.ul
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  role="listbox"
                  className="glass absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-2xl p-1 shadow-premium"
                >
                  {NETWORKS.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setNetwork(n);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-white/5"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: n.color }} />
                        <span className="flex-1">{n.name}</span>
                        {n.id === network.id && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
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
          <h1 className="col-span-2 mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
        )}
      </header>

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
}
