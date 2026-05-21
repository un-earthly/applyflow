"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        An unexpected error occurred. Our team has been notified.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Error ID: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button
          variant="outline"
          onClick={() => {
            const subject = encodeURIComponent(`Bug report: ${error.message}`);
            window.location.href = `/contact?subject=${subject}`;
          }}
        >
          Report bug
        </Button>
      </div>
    </div>
  );
}
