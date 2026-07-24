import { motion } from "framer-motion";
import { SectionHeader } from "./Features";

const NETWORKS = [
  { name: "Ethereum", short: "ETH", color: "#627EEA" },
  { name: "Base", short: "BASE", color: "#0052FF" },
  { name: "Polygon", short: "POL", color: "#8247E5" },
  { name: "Optimism", short: "OP", color: "#FF0420" },
  { name: "Arbitrum", short: "ARB", color: "#28A0F0" },
  { name: "BNB Chain", short: "BNB", color: "#F3BA2F" },
  { name: "Solana", short: "SOL", color: "#14F195" },
  { name: "Sui", short: "SUI", color: "#4DA2FF" },
  { name: "Aptos", short: "APT", color: "#06E5B4" },
];

export function Ecosystem() {
  return (
    <section id="ecosystem" className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Ecosystem"
          title="One wallet. Every major chain."
          subtitle="Move seamlessly between EVM chains and non-EVM ecosystems. Tori speaks them all — natively."
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {NETWORKS.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] sm:p-5"
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white shadow-soft"
                style={{ background: n.color }}
              >
                {n.short.slice(0, 3)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{n.name}</div>
                <div className="text-xs text-muted-foreground">Native support</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
