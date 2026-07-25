import { supabase, isSupabaseConfigured } from "./supabase";

export async function logActivityAndNotificationDirect(
  userId: string,
  activityType:
    | "deposit"
    | "withdraw"
    | "swap"
    | "bridge"
    | "buy"
    | "sell"
    | "wallet_created"
    | "wallet_imported"
    | "backup_completed"
    | "security",
  notifType: "transaction" | "alert" | "system",
  title: string,
  message: string,
  details?: {
    tokenSymbol?: string;
    amount?: string;
    txHash?: string;
    icon?: string;
    metadata?: Record<string, unknown> | null;
  },
) {
  if (!userId) return;

  const isRealUser = !userId.startsWith("demo_user") && userId !== "demo-user-123";
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured && isRealUser) {
    try {
      // 1. Log activity
      await supabase.from("wallet_activity").insert({
        user_id: userId,
        activity_type: activityType,
        token_symbol: details?.tokenSymbol || null,
        amount: details?.amount || null,
        tx_hash: details?.txHash || null,
        metadata: details?.metadata || null,
        created_at: timestamp,
      });

      // 2. Generate notification
      await supabase.from("notifications").insert({
        user_id: userId,
        type: notifType,
        title,
        message,
        status: "unread",
        icon: details?.icon || null,
        created_at: timestamp,
      });
    } catch (err) {
      console.error("Direct logging error:", err);
    }
  } else {
    // Demo / Local storage mode fallback
    const localNotifs = JSON.parse(localStorage.getItem(`tori_notifs_${userId}`) || "[]");
    const localActs = JSON.parse(localStorage.getItem(`tori_activity_${userId}`) || "[]");

    const newAct = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      activity_type: activityType,
      token_symbol: details?.tokenSymbol,
      amount: details?.amount,
      tx_hash: details?.txHash,
      metadata: details?.metadata,
      created_at: timestamp,
    };

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: notifType,
      title,
      message,
      status: "unread",
      icon: details?.icon,
      created_at: timestamp,
    };

    localStorage.setItem(`tori_activity_${userId}`, JSON.stringify([newAct, ...localActs]));
    localStorage.setItem(`tori_notifs_${userId}`, JSON.stringify([newNotif, ...localNotifs]));
  }
}
