import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Layers,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { PinVerificationModal } from "@/components/auth/PinVerificationModal";
import { toast } from "sonner";

const ACTIONS = [
  { label: "Send", icon: ArrowUpRight, requiresPin: true },
  { label: "Receive", icon: ArrowDownLeft, requiresPin: false },
  { label: "Swap", icon: ArrowLeftRight, requiresPin: true },
  { label: "Bridge", icon: Layers, requiresPin: true },
  { label: "Buy", icon: ShoppingBag, requiresPin: true },
  { label: "Sell", icon: DollarSign, requiresPin: true },
] as const;

export function QuickActions() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const handleActionClick = (label: string, requiresPin: boolean) => {
    if (requiresPin) {
      setActiveAction(label);
      setPinModalOpen(true);
    } else {
      toast.info(`Receive crypto: Copy wallet address or scan QR code in Wallet tab.`);
    }
  };

  const executeAction = (label: string) => {
    toast.success(`${label} transaction authorized! Processing request...`);
  };

  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.label}
              type="button"
              onClick={() => handleActionClick(a.label, a.requiresPin)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.35 }}
              whileTap={{ scale: 0.96 }}
              className="glass flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-xs font-medium hover:bg-white/10"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-white shadow-premium">
                <Icon className="h-4 w-4" />
              </span>
              <span>{a.label}</span>
            </motion.button>
          );
        })}
      </div>

      {activeAction && (
        <PinVerificationModal
          isOpen={pinModalOpen}
          title={`Confirm ${activeAction}`}
          description={`Enter your 6-digit PIN to authorize this ${activeAction.toLowerCase()} operation.`}
          actionName={activeAction}
          onSuccess={() => {
            setPinModalOpen(false);
            const act = activeAction;
            setActiveAction(null);
            executeAction(act);
          }}
          onCancel={() => {
            setPinModalOpen(false);
            setActiveAction(null);
          }}
        />
      )}
    </>
  );
}
