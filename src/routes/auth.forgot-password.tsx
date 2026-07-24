import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordScreen } from "@/components/auth/ForgotPasswordScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/forgot-password")({
  component: AuthForgotPasswordPage,
});

function AuthForgotPasswordPage() {
  return (
    <GuestRoute>
      <ForgotPasswordScreen />
    </GuestRoute>
  );
}
