import { ReactNode } from "react";
import { AuthGuard } from "./AuthGuard";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
