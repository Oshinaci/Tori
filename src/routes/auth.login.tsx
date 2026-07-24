import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/login")({
  component: AuthLoginPage,
});

function AuthLoginPage() {
  return (
    <GuestRoute>
      <LoginScreen />
    </GuestRoute>
  );
}
