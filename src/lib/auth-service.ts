import { supabase, isSupabaseConfigured } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

export type AuthResponse<T = unknown> = {
  data: T | null;
  error: string | null;
};

// Local storage keys for demo mode session persistence when credentials are missing
const DEMO_STORAGE_KEY = "tori_demo_auth_session";

export interface DemoUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata?: {
    full_name?: string;
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
      // Demo mode fallback
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
   */
  async signUp(
    email: string,
    password: string,
  ): Promise<AuthResponse<{ email: string; requiresOtp: boolean }>> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return {
        data: {
          email,
          requiresOtp: true,
        },
        error: null,
      };
    } else {
      // Demo mode: simulate signup & OTP requirement
      if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
        if (users[email.toLowerCase()] && users[email.toLowerCase()].verified) {
          return { data: null, error: "An account with this email already exists." };
        }

        users[email.toLowerCase()] = {
          email: email.toLowerCase(),
          password,
          verified: false,
          otp: "123456", // Default demo OTP code
        };
        localStorage.setItem("tori_demo_users", JSON.stringify(users));
      }

      return {
        data: { email: email.toLowerCase(), requiresOtp: true },
        error: null,
      };
    }
  },

  /**
   * Verify 6-digit OTP code for Sign Up or Password Recovery
   */
  async verifyOtp(
    email: string,
    token: string,
    type: "signup" | "recovery" = "signup",
  ): Promise<AuthResponse<{ verified: boolean }>> {
    if (isSupabaseConfigured) {
      let { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type === "signup" ? "signup" : "recovery",
      });

      if (error && type === "signup") {
        // Fallback retry with 'email' type if 'signup' type fails
        const retry = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        return { data: null, error: "Invalid or expired verification code." };
      }

      return { data: { verified: Boolean(data.session || data.user) }, error: null };
    } else {
      // Demo mode OTP validation (accept "123456" or any matching code)
      let users: Record<
        string,
        { email: string; password?: string; verified?: boolean; otp?: string }
      > = {};
      if (typeof window !== "undefined") {
        users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      }
      const uKey = email.toLowerCase();
      const userObj = users[uKey];

      if (token !== "123456" && userObj?.otp !== token) {
        return { data: null, error: "Invalid or expired verification code." };
      }

      if (type === "signup" && userObj) {
        userObj.verified = true;
        users[uKey] = userObj;
        if (typeof window !== "undefined") {
          localStorage.setItem("tori_demo_users", JSON.stringify(users));
        }
      }

      return { data: { verified: true }, error: null };
    }
  },

  /**
   * Resend 6-digit OTP code with spam throttle check
   */
  async resendOtp(
    email: string,
    type: "signup" | "recovery" = "signup",
  ): Promise<AuthResponse<{ sent: boolean }>> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resend({
        type: type === "signup" ? "signup" : "recovery",
        email,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { sent: true }, error: null };
    } else {
      // Demo mode resend simulation
      return { data: { sent: true }, error: null };
    }
  },

  /**
   * Sign In with Email & Password
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<AuthResponse<{ user: User | DemoUser; session: Session | DemoSession }>> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          return { data: null, error: "Please verify your email address before logging in." };
        }
        return { data: null, error: error.message };
      }

      if (!data.session || !data.user) {
        return { data: null, error: "Invalid login credentials." };
      }

      return { data: { user: data.user, session: data.session }, error: null };
    } else {
      // Demo mode sign in
      const uKey = email.toLowerCase();
      let users: Record<
        string,
        { email: string; password?: string; verified?: boolean; otp?: string }
      > = {};
      if (typeof window !== "undefined") {
        users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      }
      const userObj = users[uKey];

      // Default demo account if none exists yet
      if (!userObj && email.toLowerCase() === "demo@tori.wallet") {
        const demoSession: DemoSession = {
          user: {
            id: "demo-user-123",
            email: "demo@tori.wallet",
            email_confirmed_at: new Date().toISOString(),
          },
          access_token: "demo-jwt-token-123",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
        }
        return { data: demoSession, error: null };
      }

      if (!userObj) {
        return { data: null, error: "Account not found. Please check your email or register." };
      }

      if (userObj.password !== password) {
        return { data: null, error: "Incorrect password. Please try again." };
      }

      if (!userObj.verified) {
        return { data: null, error: "Email not verified yet. Please enter your 6-digit OTP." };
      }

      const demoSession: DemoSession = {
        user: {
          id: `demo-${Date.now()}`,
          email: userObj.email,
          email_confirmed_at: new Date().toISOString(),
        },
        access_token: `demo-token-${Date.now()}`,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoSession));
      }

      return { data: demoSession, error: null };
    }
  },

  /**
   * Forgot Password request (Sends OTP / reset link)
   */
  async forgotPassword(email: string): Promise<AuthResponse<{ sent: boolean }>> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { data: null, error: error.message };
      }
      return { data: { sent: true }, error: null };
    } else {
      // Demo mode forgot password
      let users: Record<
        string,
        { email: string; password?: string; verified?: boolean; otp?: string }
      > = {};
      if (typeof window !== "undefined") {
        users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
      }
      const uKey = email.toLowerCase();
      if (!users[uKey] && email !== "demo@tori.wallet") {
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
      // Demo mode password update
      if (email && typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("tori_demo_users") || "{}");
        const uKey = email.toLowerCase();
        if (users[uKey]) {
          users[uKey].password = newPassword;
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
