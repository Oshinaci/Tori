import { createFileRoute } from "@tanstack/react-router";
import { CreatePinScreen } from "@/components/auth/CreatePinScreen";

export const Route = createFileRoute("/auth/create-pin")({
  component: CreatePinPage,
});

function CreatePinPage() {
  return <CreatePinScreen />;
}
