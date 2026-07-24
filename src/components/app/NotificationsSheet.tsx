import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { INITIAL_NOTIFICATIONS, NotificationItem, TXS, Tx } from "./data";
import { toast } from "sonner";

export function NotificationsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "activity" | "alerts">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("Notification list cleared");
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "activity") return n.type === "transaction";
    if (filter === "alerts") return n.type === "alert" || n.type === "system";
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="glass w-full sm:max-w-md border-l border-white/10 p-0 text-foreground flex flex-col h-full"
      >
        {/* Sheet Header */}
        <div className="p-5 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-sm">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <SheetTitle className="text-lg font-bold">Activity & Alerts</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Your live transactions and system notifications
                </SheetDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Filter tabs & quick actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === "all"
                    ? "bg-white/15 text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("activity")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === "activity"
                    ? "bg-white/15 text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Activity
              </button>
              <button
                type="button"
                onClick={() => setFilter("alerts")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === "alerts"
                    ? "bg-white/15 text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Alerts
              </button>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Clear notifications"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification & Activity List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <AnimatePresence>
            {filteredNotifs.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => toggleRead(item.id)}
                className={`group relative flex items-start gap-3 rounded-2xl p-3.5 transition-all cursor-pointer border ${
                  item.read
                    ? "bg-white/5 border-white/5 opacity-80 hover:opacity-100"
                    : "bg-white/10 border-brand/30 shadow-sm hover:border-brand/50"
                }`}
              >
                {!item.read && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-400" />
                )}

                <div className="mt-0.5">
                  {item.title.includes("Received") && (
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <ArrowDownLeft className="h-4 w-4" />
                    </span>
                  )}
                  {item.title.includes("Sent") && (
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/20 text-red-400">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  )}
                  {item.title.includes("Swap") && (
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/20 text-sky-400">
                      <ArrowLeftRight className="h-4 w-4" />
                    </span>
                  )}
                  {item.title.includes("Price") && (
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                  )}
                  {item.title.includes("Security") && (
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 text-purple-400">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold truncate">{item.title}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                  {item.amount && (
                    <div className="mt-1 font-mono text-xs font-bold text-foreground">
                      {item.amount}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotifs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground my-auto">
              <Bell className="h-10 w-10 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium">No activity or alerts</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 text-center">
          <p className="text-[11px] text-muted-foreground">
            Activity and push notifications are live and updated in real-time.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
