import { createFileRoute } from "@tanstack/react-router";
import { RecoveryPhraseVerificationScreen } from "@/components/auth/RecoveryPhraseVerificationScreen";

export const Route = createFileRoute("/auth/recovery-phrase-verify")({
  component: RecoveryPhraseVerificationPage,
});

function RecoveryPhraseVerificationPage() {
  return <RecoveryPhraseVerificationScreen />;
}
