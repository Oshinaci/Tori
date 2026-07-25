import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/verify-email")({
  component: AuthVerifyEmailPage,
});

function AuthVerifyEmailPage() {
  return (
    <GuestRoute>
      <VerifyEmailScreen />
    </GuestRoute>
  );
}
