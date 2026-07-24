import { motion } from "framer-motion";
import {
  Send,
  QrCode,
  ArrowLeftRight,
  Plus,
  Home,
  PieChart,
  Compass,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Bird,
} from "lucide-react";

function TokenIcon({ symbol, color }: { symbol: string; color: string }) {
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
      style={{ background: color }}
    >
      {symbol}
    </div>
  );
}

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-16 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(0,149,255,.35), transparent 70%), radial-gradient(40% 40% at 70% 70%, rgba(0,229,255,.25), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ y: 40, opacity: 0, rotateX: 10 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[9/19] w-full rounded-[3rem] border border-white/10 bg-[#0b0b0f] p-3 shadow-premium"
        style={{ transformPerspective: 1000 }}
      >
        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-[#0e0e12]">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

          <div className="flex h-full flex-col px-4 pb-20 pt-9">
            {/* Status */}
            <div className="flex items-center justify-between text-[10px] font-medium text-white/70">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Mainnet
              </span>
            </div>

            {/* Balance card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative mt-3 overflow-hidden rounded-2xl p-4 shadow-premium gradient-brand"
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
              />
              <div className="flex items-center justify-between text-[10px] text-white/80">
                <span className="inline-flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Main Wallet
                </span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Bird className="h-3 w-3 text-white" />
                  0x8f…f2
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[22px] font-semibold text-white">$12,480.32</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-emerald-100">
                <ArrowUpRight className="h-3 w-3" /> +$284.10 · 2.34% today
              </div>

              {/* + Add funds card inside mockup balance card */}
              <div className="mt-3.5 pt-2.5 border-t border-white/20">
                <div className="flex items-center justify-between rounded-xl bg-white/20 p-2 text-white text-[10px] backdrop-blur">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/25">
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                    <span className="font-semibold">+ Add funds</span>
                  </div>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold">
                    Deposit
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick actions */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { icon: Send, label: "Send" },
                { icon: ArrowDownLeft, label: "Receive" },
                { icon: ArrowLeftRight, label: "Swap" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.04] py-2.5"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-[9px] font-medium text-white/80">{label}</span>
                </div>
              ))}
            </div>

            {/* Portfolio */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white">Portfolio</span>
              <span className="text-[9px] text-white/50">See all</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {[
                {
                  s: "ETH",
                  n: "Ethereum",
                  a: "1.245",
                  v: "$3,120",
                  d: "+1.8%",
                  c: "#627EEA",
                  up: true,
                },
                {
                  s: "USDC",
                  n: "USD Coin",
                  a: "4,820",
                  v: "$4,820",
                  d: "0.0%",
                  c: "#2775CA",
                  up: true,
                },
                {
                  s: "SOL",
                  n: "Solana",
                  a: "24.5",
                  v: "$3,540",
                  d: "+4.2%",
                  c: "#14F195",
                  up: true,
                },
              ].map((t) => (
                <div
                  key={t.s}
                  className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-2"
                >
                  <TokenIcon symbol={t.s.slice(0, 2)} color={t.c} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                      <span className="truncate">{t.n}</span>
                      <span>{t.v}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-white/50">
                      <span>
                        {t.a} {t.s}
                      </span>
                      <span className={t.up ? "text-emerald-400" : "text-rose-400"}>{t.d}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white">Recent</span>
              <Sparkles className="h-3 w-3 text-white/40" />
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[10px]">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <ArrowDownLeft className="h-3 w-3" />
                  </span>
                  Received USDC
                </span>
                <span className="text-emerald-400">+250.00</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[10px]">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-500/15 text-sky-400">
                    <ArrowLeftRight className="h-3 w-3" />
                  </span>
                  Swap ETH → SOL
                </span>
                <span className="text-white/60">0.15 ETH</span>
              </div>
            </div>
          </div>

          {/* Floating QR button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 16 }}
            className="absolute bottom-20 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full gradient-brand text-white shadow-premium ring-4 ring-[#0e0e12]"
            aria-label="Scan QR"
          >
            <QrCode className="h-5 w-5" />
          </motion.button>

          {/* Bottom nav */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-around rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-md">
            {[
              { icon: Home, active: true },
              { icon: PieChart },
              { icon: Compass },
              { icon: Wallet },
            ].map((n, i) => (
              <button
                key={i}
                className={`grid h-8 w-8 place-items-center rounded-full ${
                  n.active ? "text-white" : "text-white/50"
                }`}
                aria-label="nav"
              >
                <n.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
