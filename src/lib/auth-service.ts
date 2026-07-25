import { supabase, isSupabaseConfigured } from "./supabase";
import { pinService } from "./pin-service";
import type { Session, User } from "@supabase/supabase-js";

export type AuthResponse<T = unknown> = {
  data: T | null;
  error: string | null;
};

const DEMO_STORAGE_KEY = "tori_demo_auth_session";

export interface DemoUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata?: {
    full_name?: string;
    has_pin?: boolean;
  };
}

export interface DemoSession {
  user: DemoUser;
  access_token: string;
}

export const authService = {
  /**
   * Check if an email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();

    // Always check localStorage for demo users and registered emails cache
    if (typeof window !== "undefined") {
      const demoUsers = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      if (demoUsers[cleanEmail] || cleanEmail === "demo@tori.wallet") {
        return true;
      }

      const registeredEmails = JSON.parse(localStorage.getItem("tori_registered_emails") || "[]");
      if (registeredEmails.includes(cleanEmail)) {
        return true;
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", cleanEmail);

        if (data && data.length > 0) {
          // If found in public profiles, add to local cache for next time
          if (typeof window !== "undefined") {
            const registeredEmails = JSON.parse(
              localStorage.getItem("tori_registered_emails") || "[]",
            );
            if (!registeredEmails.includes(cleanEmail)) {
              registeredEmails.push(cleanEmail);
              localStorage.setItem("tori_registered_emails", JSON.stringify(registeredEmails));
            }
          }
          return true;
        }
      } catch (e) {
        console.error("Error checking email in Supabase:", e);
      }
    }

    return false;
  },

  /**
   * Get the current active session
   */
  async getSession(): Promise<{
    user: User | DemoUser | null;
    session: Session | DemoSession | null;
  }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Supabase getSession error:", error.message);
        return { user: null, session: null };
      }
      return { user: data.session?.user ?? null, session: data.session };
    } else {
      // Demo mode session retrieval
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as DemoSession;
            return { user: parsed.user, session: parsed };
          } catch {
            localStorage.removeItem(DEMO_STORAGE_KEY);
          }
        }
      }
      return { user: null, session: null };
    }
  },

  /**
   * Sign up with Email and Password
   * Calls Supabase Auth signUp(). Supabase sends standard Email Verification Link.
   */
  async signUp(
    email: string,
    password: string,
  ): Promise<AuthResponse<{ user: User | DemoUser | null; requiresEmailVerification: boolean }>> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      // Add to local registered emails cache
      if (typeof window !== "undefined") {
        const registeredEmails = JSON.parse(localStorage.getItem("tori_registered_emails") || "[]");
        if (!registeredEmails.includes(cleanEmail)) {
          registeredEmails.push(cleanEmail);
          localStorage.setItem("tori_registered_emails", JSON.stringify(registeredEmails));
        }
      }

      return {
        data: {
          user: data.user,
          requiresEmailVerification: true,
        },
        error: null,
      };
    } else {
      // Demo mode sign up
      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
        if (users[cleanEmail]) {
          return { data: null, error: "An account with this email already exists." };
        }

        const newUser: DemoUser = {
          id: `demo_user_${Date.now()}`,
          email: cleanEmail,
          email_confirmed_at: new Date().toISOString(),
        };

        users[cleanEmail] = {
          email: cleanEmail,
          password,
          userId: newUser.id,
        };
        localStorage.setItem("tori_demo_users", JSON.stringify(users));

        return {
          data: {
            user: newUser,
            requiresEmailVerification: true,
          },
          error: null,
        };
      }

      return { data: null, error: "Local storage unavailable." };
    }
  },

  /**
   * Sign In with Email & Password
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<
    AuthResponse<{
      user: User | DemoUser;
      session: Session | DemoSession;
      hasPin: boolean;
    }>
  > {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data.session || !data.user) {
        return { data: null, error: "Invalid login credentials." };
      }

      const hasPin = pinService.hasPin(data.user.id);

      // Add to local registered emails cache
      if (typeof window !== "undefined") {
        const registeredEmails = JSON.parse(localStorage.getItem("tori_registered_emails") || "[]");
        if (!registeredEmails.includes(cleanEmail)) {
          registeredEmails.push(cleanEmail);
          localStorage.setItem("tori_registered_emails", JSON.stringify(registeredEmails));
        }
      }

      return {
        data: {
          user: data.user,
          session: data.session,
          hasPin,
        },
        error: null,
      };
    } else {
      // Demo mode sign in
      let users: Record<string, { email: string; password?: string; userId?: string }> = {};
      if (typeof window !== "undefined") {
        users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      }
      const userObj = users[cleanEmail];

      if (!userObj && cleanEmail === "demo@tori.wallet") {
        const demoUser: DemoUser = {
          id: "demo-user-123",
          email: "demo@tori.wallet",
          email_confirmed_at: new Date().toISOString(),
        };
        const demoSession: DemoSession = {
          user: demoUser,
          access_token: "demo-jwt-token-123",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
        }
        const hasPin = pinService.hasPin(demoUser.id);
        return {
          data: { user: demoUser, session: demoSession, hasPin },
          error: null,
        };
      }

      if (!userObj) {
        return { data: null, error: "Account not found. Please check your email or register." };
      }

      if (userObj.password !== password) {
        return { data: null, error: "Incorrect password. Please try again." };
      }

      const demoUser: DemoUser = {
        id: userObj.userId || `demo_${Date.now()}`,
        email: userObj.email,
        email_confirmed_at: new Date().toISOString(),
      };
      const demoSession: DemoSession = {
        user: demoUser,
        access_token: `demo-token-${Date.now()}`,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
      }

      const hasPin = pinService.hasPin(demoUser.id);

      return {
        data: { user: demoUser, session: demoSession, hasPin },
        error: null,
      };
    }
  },

  /**
   * Forgot Password request (Sends password reset email)
   */
  async forgotPassword(email: string): Promise<AuthResponse<{ sent: boolean }>> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/reset-password`
            : undefined,
      });
      if (error) {
        return { data: null, error: error.message };
      }
      return { data: { sent: true }, error: null };
    } else {
      let users: Record<string, { email: string }> = {};
      if (typeof window !== "undefined") {
        users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      }
      if (!users[cleanEmail] && cleanEmail !== "demo@tori.wallet") {
        return { data: null, error: "No user account registered under this email." };
      }
      return { data: { sent: true }, error: null };
    }
  },

  /**
   * Reset password to new password
   */
  async resetPassword(
    newPassword: string,
    email?: string,
  ): Promise<AuthResponse<{ updated: boolean }>> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { data: null, error: error.message };
      }
      return { data: { updated: true }, error: null };
    } else {
      if (email && typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
        const cleanEmail = email.trim().toLowerCase();
        if (users[cleanEmail]) {
          users[cleanEmail].password = newPassword;
          localStorage.setItem("tori_demo_users", JSON.stringify(users));
        }
      }
      return { data: { updated: true }, error: null };
    }
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  },
};
