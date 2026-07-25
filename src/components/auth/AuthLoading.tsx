import { Bird, Loader2 } from "lucide-react";

export function AuthLoading({ message = "Authenticating session..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white shadow-premium ring-4 ring-brand/20 animate-pulse">
          <Bird className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
