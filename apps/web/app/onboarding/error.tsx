"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { EmptyState } from "@/components/shared";
import { AlertTriangle } from "lucide-react";

export default function OnboardingError({
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
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description="We could not load this step. Please try again."
        action={{ label: "Try again", onClick: reset }}
      />
    </div>
  );
}
