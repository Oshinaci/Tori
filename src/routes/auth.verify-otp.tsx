import { createFileRoute } from "@tanstack/react-router";
import { VerifyOtpScreen } from "@/components/auth/VerifyOtpScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/verify-otp")({
  component: AuthVerifyOtpPage,
});

function AuthVerifyOtpPage() {
  return (
    <GuestRoute>
      <VerifyOtpScreen />
    </GuestRoute>
  );
}
