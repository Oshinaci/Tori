import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

const ACTIONS = [
  { label: "Send", icon: ArrowUpRight },
  { label: "Receive", icon: ArrowDownLeft },
  { label: "Swap", icon: ArrowLeftRight },
] as const;

export function QuickActions() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      {ACTIONS.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.button
            key={a.label}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.35 }}
            whileTap={{ scale: 0.96 }}
            className="glass flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-xs font-medium hover:bg-white/10"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-white shadow-premium">
              <Icon className="h-4 w-4" />
            </span>
            {a.label}
          </motion.button>
        );
      })}
    </div>
  );
}
