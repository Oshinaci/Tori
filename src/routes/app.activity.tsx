import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/components/app/ActivityPage";

export const Route = createFileRoute("/app/activity")({
  component: ActivityPage,
});
