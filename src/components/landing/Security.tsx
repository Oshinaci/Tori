import { motion } from "framer-motion";
import {
  KeyRound,
  Github,
  FileCheck2,
  Fingerprint,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "./Features";

const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: KeyRound,
    title: "Non-Custodial",
    desc: "Your keys, your crypto. Tori never has access to your funds.",
  },
  {
    icon: Github,
    title: "Open Source",
    desc: "Core wallet code is public and verifiable — trust through transparency.",
  },
  {
    icon: FileCheck2,
    title: "Audited Contracts",
    desc: "Every smart contract independently reviewed by leading security firms.",
  },
  {
    icon: Fingerprint,
    title: "MPC Ready",
    desc: "Distributed key sharding removes the single point of failure.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted Recovery",
    desc: "End-to-end encrypted backup and optional social recovery.",
  },
];

export function Security() {
  return (
    <section id="security" className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Security"
          title="Built like a vault. Feels like an app."
          subtitle="Trust isn’t a feature — it’s the foundation. Every layer of Tori is engineered to keep you and your assets safe."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-3xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-brand shadow-premium">
                <it.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
