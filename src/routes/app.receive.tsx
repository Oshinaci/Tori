import { createFileRoute } from "@tanstack/react-router";
import { ReceivePage } from "@/components/app/ReceivePage";

export const Route = createFileRoute("/app/receive")({
  component: ReceivePage,
});
