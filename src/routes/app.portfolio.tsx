import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/app/PortfolioPage";

export const Route = createFileRoute("/app/portfolio")({
  component: PortfolioPage,
});
