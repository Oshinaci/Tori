import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
  return (
    <section id="download" className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 p-8 sm:p-14 lg:p-20"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, rgba(0,149,255,.35), transparent 55%), radial-gradient(120% 100% at 100% 100%, rgba(0,229,255,.28), transparent 55%), #0b0b10",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(80% 60% at 50% 50%, black, transparent)",
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Start your crypto journey today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Join millions using Tori to send, swap and grow their assets — the friendly way.
            </p>
            <div
              id="launch"
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a
                href="/app"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-premium transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Launch App
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-muted-foreground backdrop-blur sm:w-auto"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
