import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/auth/WelcomeScreen";
import { GuestRoute } from "@/components/auth/GuestRoute";

export const Route = createFileRoute("/auth/welcome")({
  component: AuthWelcomePage,
});

function AuthWelcomePage() {
  return (
    <GuestRoute>
      <WelcomeScreen />
    </GuestRoute>
  );
}
