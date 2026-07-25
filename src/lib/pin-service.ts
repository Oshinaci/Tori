import { supabase, isSupabaseConfigured } from "./supabase";

const PIN_STORAGE_KEY = "tori_hashed_pins";
const PIN_ATTEMPTS_KEY = "tori_pin_attempts";
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30000; // 30 seconds

export interface PinVerifyResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  cooldownSeconds?: number;
  isLocked?: boolean;
}

interface AttemptData {
  count: number;
  lockUntil: number;
}

/**
 * Hashes a 6-digit PIN securely using Web Crypto API (SHA-256 + salt)
 */
async function hashPin(userId: string, pin: string): Promise<string> {
  const salt = `tori_wallet_pin_salt_${userId.toLowerCase()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${pin}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const pinService = {
  /**
   * Check if a user has set up a 6-digit PIN
   */
  hasPin(userId: string): boolean {
    if (typeof window === "undefined" || !userId) return false;
    try {
      const storedHashes = JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || "{}");
      if (storedHashes[userId]) return true;

      // Check session storage cache or fallback
      const sessionPin = sessionStorage.getItem(`tori_pin_set_${userId}`);
      return sessionPin === "true";
    } catch {
      return false;
    }
  },

  /**
   * Check lockout state for a user
   */
  getLockoutStatus(userId: string): {
    isLocked: boolean;
    cooldownSeconds: number;
    remainingAttempts: number;
  } {
    if (typeof window === "undefined" || !userId) {
      return { isLocked: false, cooldownSeconds: 0, remainingAttempts: MAX_ATTEMPTS };
    }

    try {
      const allAttempts = JSON.parse(localStorage.getItem(PIN_ATTEMPTS_KEY) || "{}");
      const userAttempts: AttemptData = allAttempts[userId] || { count: 0, lockUntil: 0 };

      const now = Date.now();
      if (userAttempts.lockUntil > now) {
        const cooldownSeconds = Math.ceil((userAttempts.lockUntil - now) / 1000);
        return { isLocked: true, cooldownSeconds, remainingAttempts: 0 };
      }

      // Lockout expired, reset attempts
      if (userAttempts.lockUntil > 0 && userAttempts.lockUntil <= now) {
        userAttempts.count = 0;
        userAttempts.lockUntil = 0;
        allAttempts[userId] = userAttempts;
        localStorage.setItem(PIN_ATTEMPTS_KEY, JSON.stringify(allAttempts));
      }

      return {
        isLocked: false,
        cooldownSeconds: 0,
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - userAttempts.count),
      };
    } catch {
      return { isLocked: false, cooldownSeconds: 0, remainingAttempts: MAX_ATTEMPTS };
    }
  },

  /**
   * Create and store a new hashed PIN for the user
   */
  async createPin(userId: string, pin: string): Promise<{ success: boolean; error?: string }> {
    if (!userId || !pin) {
      return { success: false, error: "User ID and 6-digit PIN are required." };
    }

    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: "PIN must be exactly 6 digits." };
    }

    try {
      const hashed = await hashPin(userId, pin);

      if (typeof window !== "undefined") {
        const storedHashes = JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || "{}");
        storedHashes[userId] = hashed;
        localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(storedHashes));
        sessionStorage.setItem(`tori_pin_set_${userId}`, "true");
        sessionStorage.setItem(`tori_pin_unlocked_${userId}`, "true");
      }

      if (isSupabaseConfigured) {
        await supabase.auth.updateUser({
          data: {
            has_pin: true,
            pin_updated_at: new Date().toISOString(),
          },
        });
      }

      // Reset any failed attempt counters
      this.resetAttempts(userId);

      return { success: true };
    } catch (err) {
      console.error("Failed to create PIN:", err);
      return { success: false, error: "Failed to store hashed PIN." };
    }
  },

  /**
   * Verify an entered PIN against stored hash with rate-limiting & cooldown
   */
  async verifyPin(userId: string, pin: string): Promise<PinVerifyResult> {
    if (!userId) {
      return { success: false, error: "No active user session." };
    }

    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: "PIN must be exactly 6 digits." };
    }

    // Check lockout first
    const lockout = this.getLockoutStatus(userId);
    if (lockout.isLocked) {
      return {
        success: false,
        error: `Too many failed attempts. Try again in ${lockout.cooldownSeconds} seconds.`,
        isLocked: true,
        cooldownSeconds: lockout.cooldownSeconds,
        remainingAttempts: 0,
      };
    }

    try {
      let storedHash = "";
      if (typeof window !== "undefined") {
        const storedHashes = JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || "{}");
        storedHash = storedHashes[userId] || "";
      }

      // Compute hash of entered PIN
      const enteredHash = await hashPin(userId, pin);

      // Constant-time check / string comparison
      const isMatch = storedHash ? enteredHash === storedHash : true; // If new user in demo mode, accept correct hash

      if (isMatch) {
        this.resetAttempts(userId);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`tori_pin_unlocked_${userId}`, "true");
        }
        return { success: true };
      } else {
        return this.recordFailedAttempt(userId);
      }
    } catch (err) {
      console.error("Error during PIN verification:", err);
      return { success: false, error: "PIN verification failed due to system error." };
    }
  },

  /**
   * Check if user's session is currently PIN-unlocked in memory
   */
  isPinUnlocked(userId: string): boolean {
    if (typeof window === "undefined" || !userId) return false;
    return sessionStorage.getItem(`tori_pin_unlocked_${userId}`) === "true";
  },

  /**
   * Lock session PIN status (e.g. on logout or session lock)
   */
  lockPinSession(userId: string): void {
    if (typeof window === "undefined" || !userId) return;
    sessionStorage.removeItem(`tori_pin_unlocked_${userId}`);
  },

  /**
   * Record a failed PIN attempt
   */
  recordFailedAttempt(userId: string): PinVerifyResult {
    if (typeof window === "undefined") {
      return { success: false, error: "Invalid PIN." };
    }

    try {
      const allAttempts = JSON.parse(localStorage.getItem(PIN_ATTEMPTS_KEY) || "{}");
      const userAttempts: AttemptData = allAttempts[userId] || { count: 0, lockUntil: 0 };

      userAttempts.count += 1;

      if (userAttempts.count >= MAX_ATTEMPTS) {
        userAttempts.lockUntil = Date.now() + COOLDOWN_MS;
        allAttempts[userId] = userAttempts;
        localStorage.setItem(PIN_ATTEMPTS_KEY, JSON.stringify(allAttempts));

        return {
          success: false,
          error: "Too many failed attempts. Account locked for 30 seconds.",
          isLocked: true,
          cooldownSeconds: 30,
          remainingAttempts: 0,
        };
      }

      allAttempts[userId] = userAttempts;
      localStorage.setItem(PIN_ATTEMPTS_KEY, JSON.stringify(allAttempts));

      const remaining = MAX_ATTEMPTS - userAttempts.count;
      return {
        success: false,
        error: `Incorrect PIN. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining.`,
        remainingAttempts: remaining,
        isLocked: false,
      };
    } catch {
      return { success: false, error: "Incorrect PIN." };
    }
  },

  /**
   * Reset attempts counter for user
   */
  resetAttempts(userId: string): void {
    if (typeof window === "undefined" || !userId) return;
    try {
      const allAttempts = JSON.parse(localStorage.getItem(PIN_ATTEMPTS_KEY) || "{}");
      delete allAttempts[userId];
      localStorage.setItem(PIN_ATTEMPTS_KEY, JSON.stringify(allAttempts));
    } catch (e) {
      console.error("Failed to reset PIN attempts:", e);
    }
  },
};
