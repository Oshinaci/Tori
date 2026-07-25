import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/portfolio_/$asset")({
  component: AssetDetailsStub,
});

function AssetDetailsStub() {
  const { asset } = Route.useParams();

  return (
    <div className="flex h-full flex-col p-8 items-center justify-center">
      <div className="text-white text-xl font-bold uppercase mb-2">{asset} Details</div>
      <div className="text-muted-foreground text-sm">Coming soon in a future update.</div>
    </div>
  );
}
