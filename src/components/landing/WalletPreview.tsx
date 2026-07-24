import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Wallet } from "lucide-react";
import { SectionHeader } from "./Features";

export function WalletPreview() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(50% 40% at 50% 50%, rgba(0,88,255,.18), transparent 70%)",
        }}
      />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Wallet"
          title="A dashboard that feels like magic."
          subtitle="Unified balances, live prices, and every transaction across every chain — all in one calm, beautiful view."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14"
        >
          <div className="glass rounded-3xl p-3 sm:p-4 shadow-premium">
            <div className="rounded-2xl bg-[#0d0d11]/80 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Balance */}
                <div className="lg:col-span-2 rounded-2xl gradient-brand relative overflow-hidden p-5 sm:p-6">
                  <div
                    aria-hidden
                    className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl"
                  />
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Wallet className="h-3.5 w-3.5" /> Total balance
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                    $128,942.10
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-100">
                    <ArrowUpRight className="h-3.5 w-3.5" /> +$3,428.10 (+2.72%) today
                  </div>
                  <MiniChart />
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  {[
                    { l: "24h Volume", v: "$8.2k", d: "+12.4%" },
                    { l: "Yield earned", v: "$412", d: "APR 5.8%" },
                    { l: "Chains", v: "9", d: "All connected" },
                    { l: "Assets", v: "24", d: "3 new" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {s.l}
                      </div>
                      <div className="mt-1 text-lg font-semibold">{s.v}</div>
                      <div className="text-[11px] text-sky-400">{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Recent activity</h4>
                  <span className="text-xs text-muted-foreground">Last 24h</span>
                </div>
                <div className="mt-3 divide-y divide-white/5">
                  {[
                    {
                      i: ArrowDownLeft,
                      t: "Received",
                      d: "From alex.eth",
                      v: "+250.00 USDC",
                      c: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      i: ArrowLeftRight,
                      t: "Swap",
                      d: "ETH → SOL",
                      v: "0.15 ETH",
                      c: "text-sky-400",
                      bg: "bg-sky-500/10",
                    },
                    {
                      i: ArrowUpRight,
                      t: "Sent",
                      d: "To vitalik.eth",
                      v: "-100.00 USDC",
                      c: "text-rose-400",
                      bg: "bg-rose-500/10",
                    },
                    {
                      i: ArrowLeftRight,
                      t: "Bridge",
                      d: "Base → Arbitrum",
                      v: "500 USDC",
                      c: "text-sky-400",
                      bg: "bg-sky-500/10",
                    },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-3 text-sm">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${r.bg} ${r.c}`}
                        >
                          <r.i className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{r.t}</div>
                          <div className="truncate text-xs text-muted-foreground">{r.d}</div>
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold">{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MiniChart() {
  const pts = [30, 45, 38, 55, 48, 62, 58, 72, 68, 82, 78, 92];
  const w = 300,
    h = 70;
  const step = w / (pts.length - 1);
  const max = Math.max(...pts),
    min = Math.min(...pts);
  const line = pts
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 h-16 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ga)" />
      <path
        d={line}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
