import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { authService, AuthResponse, DemoSession, DemoUser } from "@/lib/auth-service";
import { pinService, PinVerifyResult } from "@/lib/pin-service";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | DemoUser | null;
  session: Session | DemoSession | null;
  loading: boolean;
  isConfigured: boolean;
  isPinUnlocked: boolean;
  hasPin: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<AuthResponse<{ user: User | DemoUser | null; requiresEmailVerification: boolean }>>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<
    AuthResponse<{
      user: User | DemoUser;
      session: Session | DemoSession;
      hasPin: boolean;
    }>
  >;
  createPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  verifyPin: (pin: string) => Promise<PinVerifyResult>;
  lockPin: () => void;
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
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  const checkPinState = useCallback((activeUser: User | DemoUser | null) => {
    if (!activeUser) {
      setHasPin(false);
      setIsPinUnlocked(false);
      return;
    }
    const userHasPin = pinService.hasPin(activeUser.id);
    const pinUnlocked = pinService.isPinUnlocked(activeUser.id);
    setHasPin(userHasPin);
    setIsPinUnlocked(pinUnlocked);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { user: u, session: s } = await authService.getSession();
      setUser(u);
      setSession(s);
      checkPinState(u);
    } catch (err) {
      console.error("Failed to refresh session:", err);
      setUser(null);
      setSession(null);
      setHasPin(false);
      setIsPinUnlocked(false);
    } finally {
      setLoading(false);
    }
  }, [checkPinState]);

  useEffect(() => {
    refreshSession();

    if (isSupabaseConfigured) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        checkPinState(newUser);
        setLoading(false);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, [checkPinState, refreshSession]);

  const handleCreatePin = async (pin: string) => {
    if (!user) return { success: false, error: "No active user session." };
    const res = await pinService.createPin(user.id, pin);
    if (res.success) {
      setHasPin(true);
      setIsPinUnlocked(true);
    }
    return res;
  };

  const handleVerifyPin = async (pin: string) => {
    if (!user) return { success: false, error: "No active user session." };
    const res = await pinService.verifyPin(user.id, pin);
    if (res.success) {
      setIsPinUnlocked(true);
    }
    return res;
  };

  const handleLockPin = () => {
    if (user) {
      pinService.lockPinSession(user.id);
    }
    setIsPinUnlocked(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    if (user) {
      pinService.lockPinSession(user.id);
    }
    await authService.signOut();
    setUser(null);
    setSession(null);
    setHasPin(false);
    setIsPinUnlocked(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        isPinUnlocked,
        hasPin,
        signUp: authService.signUp,
        signIn: authService.signIn,
        createPin: handleCreatePin,
        verifyPin: handleVerifyPin,
        lockPin: handleLockPin,
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
