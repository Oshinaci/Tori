const CHAINS = [
  "Ethereum",
  "Base",
  "Polygon",
  "Optimism",
  "Arbitrum",
  "BNB Chain",
  "Solana",
  "Sui",
  "Aptos",
  "WalletConnect",
  "Circle",
  "LayerZero",
  "Chainlink",
];

export function TrustedBy() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.015] py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Connected to the networks you use
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {CHAINS.map((c) => (
            <div
              key={c}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-white/10 hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/70" />
              <span className="truncate">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
