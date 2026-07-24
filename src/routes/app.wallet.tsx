import { createFileRoute } from "@tanstack/react-router";
import { WalletPage } from "@/components/app/WalletPage";

export const Route = createFileRoute("/app/wallet")({
  component: WalletPage,
});
