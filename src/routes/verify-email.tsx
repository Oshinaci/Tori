import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <GuestRoute>
      <VerifyEmailScreen />
    </GuestRoute>
  );
}
