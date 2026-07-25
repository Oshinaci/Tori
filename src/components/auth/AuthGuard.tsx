import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoading } from "./AuthLoading";

export interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/auth/login" }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: redirectTo });
    }
  }, [user, loading, navigate, redirectTo]);

  if (loading) {
    return <AuthLoading message="Validating authentication..." />;
  }

  if (!user) {
    return <AuthLoading message="Redirecting to login..." />;
  }

  return <>{children}</>;
}
