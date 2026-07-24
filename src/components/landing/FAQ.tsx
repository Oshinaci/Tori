import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeader } from "./Features";

const FAQS = [
  {
    q: "Is Tori really non-custodial?",
    a: "Yes. Tori is fully self-custody — your private keys are generated and stored only on your device. We can never move or freeze your funds.",
  },
  {
    q: "Which chains and tokens are supported?",
    a: "Tori supports Ethereum, Base, Polygon, Optimism, Arbitrum, BNB Chain, Solana, Sui and Aptos at launch, with thousands of tokens across each.",
  },
  {
    q: "How do fees and swap routing work?",
    a: "Tori aggregates the top DEXs and bridges to always route your trade at the best price. Network fees are shown transparently before you confirm.",
  },
  {
    q: "What happens if I lose my phone?",
    a: "Use your encrypted cloud backup, seed phrase or social recovery to restore access on any device — instantly and securely.",
  },
  {
    q: "Can I buy crypto with a card?",
    a: "Yes. Buy crypto directly inside Tori with card, Apple Pay or bank transfer in over 60 countries.",
  },
  {
    q: "Is Tori audited?",
    a: "All Tori smart contracts and critical wallet flows are independently audited by leading security firms. Reports are published publicly.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Questions, answered." />

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? "border-white/20 bg-white/[0.04]" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold sm:text-base">{f.q}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="c"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
