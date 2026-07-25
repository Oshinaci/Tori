import { createFileRoute } from "@tanstack/react-router";
import { RecoveryPhraseScreen } from "@/components/auth/RecoveryPhraseScreen";

export const Route = createFileRoute("/auth/recovery-phrase")({
  component: RecoveryPhrasePage,
});

function RecoveryPhrasePage() {
  return <RecoveryPhraseScreen />;
}
