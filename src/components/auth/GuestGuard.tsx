import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoading } from "./AuthLoading";

export interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestGuard({ children, redirectTo = "/app" }: GuestGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirectTo });
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return <AuthLoading message="Checking session..." />;
  }

  if (user) {
    return <AuthLoading message="Redirecting to app..." />;
  }

  return <>{children}</>;
}
