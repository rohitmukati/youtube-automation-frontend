import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";

export function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-background grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Orb size={52} variant="lagoon" />
        <h1 className="text-foreground text-lg font-semibold">We could not reach the server</h1>
        <p className="text-muted-foreground text-sm">
          Check your connection and try again. Your session is safe and will resume once the service
          is back.
        </p>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}
