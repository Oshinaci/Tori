import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "@/components/auth/RegisterScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/register")({
  component: AuthRegisterPage,
});

function AuthRegisterPage() {
  return (
    <GuestRoute>
      <RegisterScreen />
    </GuestRoute>
  );
}
