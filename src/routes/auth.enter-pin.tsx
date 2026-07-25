import { createFileRoute } from "@tanstack/react-router";
import { EnterPinScreen } from "@/components/auth/EnterPinScreen";

export const Route = createFileRoute("/auth/enter-pin")({
  component: EnterPinPage,
});

function EnterPinPage() {
  return <EnterPinScreen />;
}
