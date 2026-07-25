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
  X,
  Copy,
  ExternalLink,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useActivity, NotificationItem } from "@/context/ActivityContext";
import { toast } from "sonner";

// Helper for relative time formatting
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return "Just now";
  }
  if (diffMin < 60) {
    return `${diffMin}m`;
  }
  if (diffHr < 24) {
    return `${diffHr}h`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { notifications, activity, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useActivity();

  const [filter, setFilter] = useState<"all" | "activity" | "alerts">("all");
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [limit, setLimit] = useState(10); // Infinite scrolling / incremental loading limit

  // Combine notifications & transactions appropriately or fetch based on filter
  const filteredNotifs = notifications.filter((n) => {
    if (filter === "activity") return n.type === "transaction";
    if (filter === "alerts") return n.type === "alert" || n.type === "system";
    return true;
  });

  const visibleNotifs = filteredNotifs.slice(0, limit);
  const hasMore = filteredNotifs.length > limit;

  const handleItemClick = (item: NotificationItem) => {
    if (item.status === "unread") {
      markAsRead(item.id);
    }
    setSelectedItem(item);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening detail page
    deleteNotification(id);
    toast.success("Notification deleted");
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const copyTxHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      toast.success("Transaction hash copied");
      setTimeout(() => setCopiedHash(false), 1500);
    } catch {
      // ignore
    }
  };

  // Helper to extract icons dynamically
  const getNotificationIcon = (title: string, type: string) => {
    const t = title.toLowerCase();
    if (t.includes("received") || t.includes("deposit")) {
      return (
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <ArrowDownLeft className="h-4.5 w-4.5" />
        </span>
      );
    }
    if (t.includes("sent") || t.includes("withdraw")) {
      return (
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/20 text-red-400">
          <ArrowUpRight className="h-4.5 w-4.5" />
        </span>
      );
    }
    if (t.includes("swap") || t.includes("swapped")) {
      return (
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/20 text-sky-400">
          <ArrowLeftRight className="h-4.5 w-4.5" />
        </span>
      );
    }
    if (t.includes("purchase") || t.includes("buy") || t.includes("gopay")) {
      return (
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/20 text-brand">
          <CreditCard className="h-4.5 w-4.5" />
        </span>
      );
    }
    return (
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 text-purple-400">
        <ShieldCheck className="h-4.5 w-4.5" />
      </span>
    );
  };

  // Find corresponding wallet activity detail for txHash or additional fields
  const getLinkedActivity = (notif: NotificationItem) => {
    return activity.find(
      (a) => a.created_at === notif.created_at || (a.amount && notif.message.includes(a.amount)),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="glass w-full sm:max-w-md border-l border-white/10 p-0 text-foreground flex flex-col h-full [&>button]:hidden"
      >
        {/* Main Panel View */}
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Sheet Header */}
          <div className="p-5 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
                  aria-label="Close sheet"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter tabs & quick actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setLimit(10);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    filter === "all"
                      ? "bg-white/15 text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter("activity");
                    setLimit(10);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    filter === "activity"
                      ? "bg-white/15 text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Activity
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilter("alerts");
                    setLimit(10);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
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
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <AnimatePresence initial={false}>
              {visibleNotifs.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`notif-card-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex items-start gap-3 rounded-2xl p-3.5 transition-all cursor-pointer border ${
                    item.status === "read"
                      ? "bg-white/5 border-white/5 opacity-80 hover:opacity-100"
                      : "bg-white/10 border-brand/30 shadow-sm hover:border-brand/50"
                  }`}
                >
                  {item.status === "unread" && (
                    <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}

                  <div className="mt-0.5">{getNotificationIcon(item.title, item.type)}</div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold truncate text-white">{item.title}</h4>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                        {getRelativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Individual Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-red-400 transition-all cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Trigger for Infinite Scroll */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setLimit((prev) => prev + 10)}
                className="w-full py-2 text-center text-xs font-semibold text-brand hover:text-brand/85 transition-colors bg-white/5 rounded-xl border border-white/5 cursor-pointer"
              >
                Load More Activities
              </button>
            )}

            {filteredNotifs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground h-full">
                <Bell className="h-10 w-10 stroke-1 mb-2 opacity-40 text-brand" />
                <p className="text-sm font-semibold text-white">No activity or alerts</p>
                <p className="text-xs text-muted-foreground mt-1">You're completely caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">
              Activity and wallet alerts are fully synchronized and PIN-secured.
            </p>
          </div>

          {/* Sliding Detailed Card View Overlay */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute inset-0 bg-background z-50 flex flex-col"
              >
                {/* Detail Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(selectedItem.title, selectedItem.type)}
                    <div>
                      <h3 className="text-sm font-bold text-white">Event details</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {new Date(selectedItem.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Detail Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Subject
                    </span>
                    <h1 className="text-base font-extrabold text-white leading-tight">
                      {selectedItem.title}
                    </h1>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Description
                    </span>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-muted-foreground leading-relaxed">
                      {selectedItem.message}
                    </div>
                  </div>

                  {/* Linked Wallet Activity details */}
                  {(() => {
                    const activityDetail = getLinkedActivity(selectedItem);
                    if (!activityDetail) return null;

                    return (
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Transaction Data
                        </span>
                        <div className="glass rounded-2xl border border-white/5 p-4 space-y-3.5">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-bold text-white uppercase font-mono">
                              {activityDetail.activity_type}
                            </span>
                          </div>
                          {activityDetail.token_symbol && (
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-muted-foreground">Asset</span>
                              <span className="font-bold text-white font-mono">
                                {activityDetail.token_symbol}
                              </span>
                            </div>
                          )}
                          {activityDetail.amount && (
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-bold text-white font-mono">
                                {activityDetail.amount} {activityDetail.token_symbol}
                              </span>
                            </div>
                          )}

                          {activityDetail.tx_hash && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tx Hash</span>
                                <button
                                  type="button"
                                  onClick={() => copyTxHash(activityDetail.tx_hash!)}
                                  className="flex items-center gap-1 text-[10px] text-brand hover:underline font-semibold"
                                >
                                  {copiedHash ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      Copy Hash
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 font-mono text-[10px] text-white break-all select-all">
                                {activityDetail.tx_hash}
                              </div>
                              <a
                                href={`https://arbiscan.io/tx/${activityDetail.tx_hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 py-2 text-[10px] font-bold text-white hover:bg-white/10 transition-colors border border-white/15"
                              >
                                <span>Verify on Arbiscan</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Detail Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-black/25 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleDelete(e, selectedItem.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold py-3 transition-colors text-xs cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-3 transition-colors text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
