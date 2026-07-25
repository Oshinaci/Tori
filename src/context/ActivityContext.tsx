import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface NotificationItem {
  id: string;
  user_id: string;
  type: "transaction" | "alert" | "system";
  title: string;
  message: string;
  status: "unread" | "read";
  icon?: string;
  created_at: string;
}

export interface WalletActivity {
  id: string;
  user_id: string;
  activity_type:
    | "deposit"
    | "withdraw"
    | "swap"
    | "bridge"
    | "buy"
    | "sell"
    | "wallet_created"
    | "wallet_imported"
    | "backup_completed"
    | "security";
  token_symbol?: string;
  amount?: string;
  tx_hash?: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

interface ActivityContextType {
  notifications: NotificationItem[];
  activity: WalletActivity[];
  unreadCount: number;
  loading: boolean;
  refetchData: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  logActivityAndNotification: (
    activityType: WalletActivity["activity_type"],
    notifType: NotificationItem["type"],
    title: string,
    message: string,
    details?: {
      tokenSymbol?: string;
      amount?: string;
      txHash?: string;
      icon?: string;
      metadata?: Record<string, unknown> | null;
    },
  ) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activity, setActivity] = useState<WalletActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const isRealUser = user && !user.id.startsWith("demo_user") && user.id !== "demo-user-123";

  // Helper: Fetch notifications & wallet activity
  const refetchData = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setActivity([]);
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured && isRealUser) {
      try {
        setLoading(true);
        // 1. Fetch Notifications
        const { data: notifs, error: notifErr } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (notifErr) throw notifErr;

        // 2. Fetch Wallet Activity
        const { data: acts, error: actErr } = await supabase
          .from("wallet_activity")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (actErr) throw actErr;

        setNotifications(notifs || []);
        setActivity(acts || []);
      } catch (err) {
        console.error("Error fetching activity/notifications from Supabase:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Demo / Local storage mode fallback
      const localNotifs = JSON.parse(localStorage.getItem(`tori_notifs_${user.id}`) || "[]");
      const localActs = JSON.parse(localStorage.getItem(`tori_activity_${user.id}`) || "[]");
      setNotifications(localNotifs);
      setActivity(localActs);
      setLoading(false);
    }
  }, [user, isRealUser]);

  // Initial Fetch on Login / user change
  useEffect(() => {
    refetchData();
  }, [user, refetchData]);

  // Mark specific notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    if (isSupabaseConfigured && isRealUser) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ status: "read" })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "read" as const } : n)),
        );
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    } else {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, status: "read" as const } : n,
      );
      setNotifications(updated);
      localStorage.setItem(`tori_notifs_${user.id}`, JSON.stringify(updated));
    }
  };

  // Mark all unread notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    if (isSupabaseConfigured && isRealUser) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ status: "read" })
          .eq("user_id", user.id)
          .eq("status", "unread");

        if (error) throw error;

        setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as const })));
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
      }
    } else {
      const updated = notifications.map((n) => ({ ...n, status: "read" as const }));
      setNotifications(updated);
      localStorage.setItem(`tori_notifs_${user.id}`, JSON.stringify(updated));
    }
  };

  // Delete specific notification
  const deleteNotification = async (id: string) => {
    if (!user) return;

    if (isSupabaseConfigured && isRealUser) {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    } else {
      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      localStorage.setItem(`tori_notifs_${user.id}`, JSON.stringify(updated));
    }
  };

  // Unified logging of activity AND generating a notification
  const logActivityAndNotification = async (
    activityType: WalletActivity["activity_type"],
    notifType: NotificationItem["type"],
    title: string,
    message: string,
    details?: {
      tokenSymbol?: string;
      amount?: string;
      txHash?: string;
      icon?: string;
      metadata?: Record<string, unknown> | null;
    },
  ) => {
    if (!user) return;

    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && isRealUser) {
      try {
        // 1. Log activity
        const { data: actData, error: actErr } = await supabase
          .from("wallet_activity")
          .insert({
            user_id: user.id,
            activity_type: activityType,
            token_symbol: details?.tokenSymbol || null,
            amount: details?.amount || null,
            tx_hash: details?.txHash || null,
            metadata: details?.metadata || null,
            created_at: timestamp,
          })
          .select();

        if (actErr) throw actErr;

        // 2. Generate notification
        const { data: notifData, error: notifErr } = await supabase
          .from("notifications")
          .insert({
            user_id: user.id,
            type: notifType,
            title,
            message,
            status: "unread",
            icon: details?.icon || null,
            created_at: timestamp,
          })
          .select();

        if (notifErr) throw notifErr;

        // Sync local React states
        if (actData && actData[0]) {
          setActivity((prev) => [actData[0] as WalletActivity, ...prev]);
        }
        if (notifData && notifData[0]) {
          setNotifications((prev) => [notifData[0] as NotificationItem, ...prev]);
        }
      } catch (err) {
        console.error("Error logging activity & notification in Supabase:", err);
      }
    } else {
      // Demo / Local fallback
      const newAct: WalletActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        activity_type: activityType,
        token_symbol: details?.tokenSymbol,
        amount: details?.amount,
        tx_hash: details?.txHash,
        metadata: details?.metadata,
        created_at: timestamp,
      };

      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        type: notifType,
        title,
        message,
        status: "unread",
        icon: details?.icon,
        created_at: timestamp,
      };

      const updatedActs = [newAct, ...activity];
      const updatedNotifs = [newNotif, ...notifications];

      setActivity(updatedActs);
      setNotifications(updatedNotifs);

      localStorage.setItem(`tori_activity_${user.id}`, JSON.stringify(updatedActs));
      localStorage.setItem(`tori_notifs_${user.id}`, JSON.stringify(updatedNotifs));
    }
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <ActivityContext.Provider
      value={{
        notifications,
        activity,
        unreadCount,
        loading,
        refetchData,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        logActivityAndNotification,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
