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

/**
 * Automatically extracts tokens/hashes from URL parameters and completes verification silently.
 */
export async function handleSilentTokenVerification(): Promise<{
  verified: boolean;
  error: string | null;
  session: AuthSession | null;
}> {
  if (typeof window === "undefined") return { verified: false, error: null, session: null };

  const hash = window.location.hash;
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);

  const urlError =
    params.get("error_description") ||
    hashParams.get("error_description") ||
    params.get("error") ||
    hashParams.get("error");

  if (urlError) {
    window.history.replaceState(null, "", window.location.pathname);
    return {
      verified: false,
      error: "Invalid or expired verification code.",
      session: null,
    };
  }

  const tokenHash = params.get("token_hash") || hashParams.get("token_hash");
  const typeParam = params.get("type") || hashParams.get("type") || "signup";

  if (isSupabaseConfigured && tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam === "recovery" ? "recovery" : typeParam === "email" ? "email" : "signup",
    });
    window.history.replaceState(null, "", window.location.pathname);
    if (error) {
      return { verified: false, error: "Invalid or expired verification code.", session: null };
    }
    return { verified: true, error: null, session: data.session };
  }

  const code = params.get("code");
  if (isSupabaseConfigured && code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    window.history.replaceState(null, "", window.location.pathname);
    if (error) {
      return { verified: false, error: "Invalid or expired verification code.", session: null };
    }
    return { verified: true, error: null, session: data.session };
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (isSupabaseConfigured && accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    window.history.replaceState(null, "", window.location.pathname);
    if (error) {
      return { verified: false, error: "Invalid or expired verification code.", session: null };
    }
    return { verified: true, error: null, session: data.session };
  }

  return { verified: false, error: null, session: null };
}

export { authService, isSupabaseConfigured };
