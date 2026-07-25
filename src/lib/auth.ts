import { supabase, isSupabaseConfigured } from "./supabase";
import { authService, DemoUser, DemoSession } from "./auth-service";
import type { User, Session } from "@supabase/supabase-js";

export type AuthUser = User | DemoUser;
export type AuthSession = Session | DemoSession;

/**
 * Checks current active session from Supabase or Local Demo session.
 */
export async function getCurrentSession(): Promise<{
  user: AuthUser | null;
  session: AuthSession | null;
}> {
  return authService.getSession();
}

/**
 * Subscribes to auth state changes and automatically handles session expiration/refresh.
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null, session: AuthSession | null) => void,
) {
  if (isSupabaseConfigured) {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null, session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }

  // Demo mode listener setup
  return () => {};
}

/**
 * Validates if the given session is active and not expired.
 */
export function isSessionValid(session: AuthSession | null): boolean {
  if (!session) return false;
  if ("expires_at" in session && session.expires_at) {
    const expiresAt = typeof session.expires_at === "number" ? session.expires_at : 0;
    const now = Math.floor(Date.now() / 1000);
    return expiresAt > now;
  }
  return true;
}

export { authService, isSupabaseConfigured };
