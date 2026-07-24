import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, AuthResponse, DemoSession, DemoUser } from "@/lib/auth-service";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | DemoUser | null;
  session: Session | DemoSession | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<AuthResponse<{ email: string; requiresOtp: boolean }>>;
  verifyOtp: (
    email: string,
    token: string,
    type?: "signup" | "recovery",
  ) => Promise<AuthResponse<{ verified: boolean }>>;
  resendOtp: (
    email: string,
    type?: "signup" | "recovery",
  ) => Promise<AuthResponse<{ sent: boolean }>>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResponse<{ user: User | DemoUser; session: Session | DemoSession }>>;
  forgotPassword: (email: string) => Promise<AuthResponse<{ sent: boolean }>>;
  resetPassword: (
    newPassword: string,
    email?: string,
  ) => Promise<AuthResponse<{ updated: boolean }>>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [session, setSession] = useState<Session | DemoSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const { user: u, session: s } = await authService.getSession();
      setUser(u);
      setSession(s);
    } catch (err) {
      console.error("Failed to refresh session:", err);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    if (isSupabaseConfigured) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp: authService.signUp,
        verifyOtp: authService.verifyOtp,
        resendOtp: authService.resendOtp,
        signIn: authService.signIn,
        forgotPassword: authService.forgotPassword,
        resetPassword: authService.resetPassword,
        signOut: handleSignOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
