"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { EmptyState } from "@/components/shared";
import { AlertTriangle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
        title="Something went wrong"
        description="We could not load this page. Please try again."
        action={{ label: "Try again", onClick: reset }}
      />
    </div>
  );
}
