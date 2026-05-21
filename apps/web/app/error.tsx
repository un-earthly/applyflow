"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import { AlertTriangle } from "lucide-react";

export default function RootError({
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
        icon={AlertTriangle}
        title="Something went wrong"
        description={error.message || "An unexpected error occurred. Please try again."}
        action={{ label: "Try again", onClick: reset }}
      />
    </div>
  );
}
