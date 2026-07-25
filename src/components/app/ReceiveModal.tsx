import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { shortAddr } from "./data";

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
}

export function ReceiveModal({ open, onOpenChange, walletAddress }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
              <QrCode className="h-4 w-4 stroke-[2.5]" />
            </span>
            Receive Assets
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Only send compatible assets to this address.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-2xl bg-white p-4 shadow-lg mb-6">
            {/* Placeholder for actual QR code */}
            <div className="h-48 w-48 bg-gray-200 flex items-center justify-center rounded-xl">
              <QrCode className="h-20 w-20 text-gray-400" />
            </div>
          </div>

          <div className="w-full space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Wallet Address</label>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="truncate text-sm font-mono text-white">{walletAddress}</span>
              <button
                onClick={copyAddr}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
