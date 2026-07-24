import { motion } from "framer-motion";
import { SectionHeader } from "./Features";

const T = [
  {
    q: "Feels like Apple Pay for crypto — my parents are actually using it.",
    n: "Maya Chen",
    r: "Product Designer",
  },
  {
    q: "The best swap UX on the market. One tap, best route, done.",
    n: "Julian Rossi",
    r: "DeFi Trader",
  },
  {
    q: "Finally a self-custody wallet I can recommend to non-technical friends.",
    n: "Priya Nair",
    r: "Startup Founder",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Loved by users" title="Built for humans, adored by builders." />
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {T.map((t, i) => (
            <motion.figure
              key={t.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass flex h-full flex-col justify-between rounded-3xl p-6"
            >
              <blockquote className="text-base leading-relaxed text-foreground/90">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-sm font-semibold text-white">
                  {t.n
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
