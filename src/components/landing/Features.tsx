import { motion } from "framer-motion";
import {
  Wallet,
  ArrowLeftRight,
  Waypoints,
  LineChart,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Feature = { icon: LucideIcon; title: string; desc: string };

const FEATURES: Feature[] = [
  {
    icon: Wallet,
    title: "Easy Wallet",
    desc: "Set up in seconds, no jargon. Manage every asset in one clean, friendly interface.",
  },
  {
    icon: ArrowLeftRight,
    title: "One-Tap Swap",
    desc: "Swap any token across chains at the best rate with a single tap. Zero guesswork.",
  },
  {
    icon: Waypoints,
    title: "Cross-Chain Bridge",
    desc: "Move assets between Ethereum, Base, Solana and more — securely and instantly.",
  },
  {
    icon: LineChart,
    title: "Portfolio Tracking",
    desc: "See balances, P&L, and history across every chain in a beautiful unified dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Recovery",
    desc: "Encrypted cloud backup, social recovery and MPC. Never lose access to your wallet.",
  },
  {
    icon: Zap,
    title: "Fast Transfer",
    desc: "Blazing-fast sends with smart gas. Pay anyone with just a username or QR code.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need. Nothing you don’t."
          subtitle="A wallet designed like your favourite consumer app — with the power of an on-chain super-app underneath."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle, rgba(0,149,255,.35), transparent 70%)",
                }}
              />
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <f.icon className="h-5 w-5 text-sky-400" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div className={isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-400/80">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
    </div>
  );
}
