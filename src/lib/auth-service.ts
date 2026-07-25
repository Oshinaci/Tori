import { supabase, isSupabaseConfigured } from "./supabase";
import { passkeyService, PasskeyCredential } from "./passkey-service";
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
    has_passkey?: boolean;
  };
}

export interface DemoSession {
  user: DemoUser;
  access_token: string;
}

export const authService = {
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
   * Immediately signs user in so they can register a Passkey.
   */
  async signUp(
    email: string,
    password: string,
  ): Promise<AuthResponse<{ user: User | DemoUser; session: Session | DemoSession }>> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (data.session && data.user) {
        return { data: { user: data.user, session: data.session }, error: null };
      }

      // If Supabase required auto login attempt
      const signInRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInRes.data.user && signInRes.data.session) {
        return {
          data: { user: signInRes.data.user, session: signInRes.data.session },
          error: null,
        };
      }

      // Fallback user object if session pending confirmation
      const tempUser: DemoUser = {
        id: data.user?.id || `user_${Date.now()}`,
        email: cleanEmail,
        email_confirmed_at: new Date().toISOString(),
      };
      const tempSession: DemoSession = {
        user: tempUser,
        access_token: `token_${Date.now()}`,
      };

      return { data: { user: tempUser, session: tempSession }, error: null };
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

        const demoSession: DemoSession = {
          user: newUser,
          access_token: `demo_token_${Date.now()}`,
        };
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));

        return { data: { user: newUser, session: demoSession }, error: null };
      }

      return { data: null, error: "Local storage unavailable." };
    }
  },

  /**
   * Register a WebAuthn Passkey for current user
   */
  async registerPasskey(user: { id: string; email: string }): Promise<{
    credential: PasskeyCredential | null;
    error: string | null;
  }> {
    return passkeyService.registerPasskey(user);
  },

  /**
   * Sign In with Passkey (Primary WebAuthn Method)
   */
  async signInWithPasskey(
    email?: string,
  ): Promise<AuthResponse<{ user: User | DemoUser; session: Session | DemoSession }>> {
    const authResult = await passkeyService.authenticatePasskey(email);

    if (!authResult.success || !authResult.passkey) {
      return {
        data: null,
        error: authResult.error || "Passkey verification failed. Please try again.",
      };
    }

    const passkey = authResult.passkey;

    if (isSupabaseConfigured) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        return {
          data: { user: sessionData.session.user, session: sessionData.session },
          error: null,
        };
      }

      // Restore session or active user for passkey owner
      const passkeyUser: DemoUser = {
        id: passkey.userId,
        email: passkey.email,
        email_confirmed_at: new Date().toISOString(),
        user_metadata: { has_passkey: true },
      };
      const passkeySession: DemoSession = {
        user: passkeyUser,
        access_token: `passkey_jwt_${Date.now()}`,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(passkeySession));
      }

      return { data: { user: passkeyUser, session: passkeySession }, error: null };
    } else {
      // Demo session from passkey
      const demoUser: DemoUser = {
        id: passkey.userId,
        email: passkey.email,
        email_confirmed_at: new Date().toISOString(),
        user_metadata: { has_passkey: true },
      };
      const demoSession: DemoSession = {
        user: demoUser,
        access_token: `passkey_jwt_${Date.now()}`,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
      }

      return { data: { user: demoUser, session: demoSession }, error: null };
    }
  },

  /**
   * Fallback Sign In with Email & Password (Recovery Flow)
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<
    AuthResponse<{
      user: User | DemoUser;
      session: Session | DemoSession;
      promptPasskey?: boolean;
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

      const hasPasskey = passkeyService.hasRegisteredPasskeys(cleanEmail);

      return {
        data: {
          user: data.user,
          session: data.session,
          promptPasskey: !hasPasskey,
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
        const hasPasskey = passkeyService.hasRegisteredPasskeys(cleanEmail);
        return {
          data: { user: demoUser, session: demoSession, promptPasskey: !hasPasskey },
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

      const hasPasskey = passkeyService.hasRegisteredPasskeys(cleanEmail);

      return {
        data: { user: demoUser, session: demoSession, promptPasskey: !hasPasskey },
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
