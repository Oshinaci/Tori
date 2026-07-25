import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { AuthLoading } from "./AuthLoading";
import { CreatePinScreen } from "./CreatePinScreen";
import { EnterPinScreen } from "./EnterPinScreen";

export interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/auth/login" }: AuthGuardProps) {
  const { user, loading, hasPin, isPinUnlocked, refreshSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: redirectTo });
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return <AuthLoading message="Authenticating session..." />;
  }

  if (!user) {
    return <AuthLoading message="Redirecting to login..." />;
  }

  // Active session exists: Check PIN state
  if (!hasPin) {
    return <CreatePinScreen onSuccess={() => refreshSession()} />;
  }

  if (!isPinUnlocked) {
    return <EnterPinScreen onSuccess={() => refreshSession()} />;
  }

  return <>{children}</>;
}
