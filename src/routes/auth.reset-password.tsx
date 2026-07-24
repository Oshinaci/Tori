import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordScreen } from "@/components/auth/ResetPasswordScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/reset-password")({
  component: AuthResetPasswordPage,
});

function AuthResetPasswordPage() {
  return (
    <GuestRoute>
      <ResetPasswordScreen />
    </GuestRoute>
  );
}
