import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bird, Check, Copy, QrCode, ShieldCheck } from "lucide-react";
import { TopBar } from "./TopBar";
import { NETWORKS, WALLET_ADDRESS as DEFAULT_WALLET_ADDRESS, shortAddr } from "./data";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/lib/wallet-service";

export function WalletPage() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>(DEFAULT_WALLET_ADDRESS);
  const [walletName, setWalletName] = useState<string>("Main Wallet");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchWallet() {
      const userId = user?.id || "guest_user";
      const w = await walletService.getWallet(userId);
      if (isMounted && w) {
        setWalletAddress(w.wallet_address);
        setWalletName(w.wallet_name || "Main Wallet");
      }
    }
    fetchWallet();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <TopBar title="Wallet" />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-4 overflow-hidden rounded-3xl p-6 shadow-premium"
        style={{
          background: "linear-gradient(135deg, #0058FF 0%, #0095FF 60%, #00E5FF 130%)",
        }}
      >
        <div className="flex items-center justify-between text-white/85">
          <span className="text-xs uppercase tracking-wider">{walletName}</span>
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div className="mt-6 grid place-items-center">
          <div className="grid h-40 w-40 place-items-center rounded-3xl bg-white p-3 shadow-premium">
            <QrCode className="h-full w-full text-black" strokeWidth={1.25} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 text-white shadow-sm">
              <Bird className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="truncate font-mono text-sm">{shortAddr(walletAddress)}</span>
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </motion.section>

      <h2 className="mt-8 text-base font-semibold">Networks</h2>
      <ul className="glass mt-3 grid grid-cols-2 gap-2 rounded-3xl p-2">
        {NETWORKS.map((n) => (
          <li
            key={n.id}
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm hover:bg-white/5"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: n.color }} />
            <span className="truncate">{n.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
