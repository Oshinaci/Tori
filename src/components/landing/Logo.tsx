import { motion } from "framer-motion";
import { Bird } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="gradient-brand relative grid h-8 w-8 place-items-center rounded-xl shadow-premium"
      >
        <Bird className="h-5 w-5 text-white" strokeWidth={2.2} />
      </motion.div>
      <span className="text-lg font-semibold tracking-tight">Tori</span>
    </div>
  );
}
