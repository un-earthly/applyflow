"use client";

import { useEffect } from "react";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
=======
import { EmptyState } from "@/components/shared";
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
<<<<<<< HEAD
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-muted-foreground text-sm max-w-sm">
        An error occurred loading this page.
      </p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
=======
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description="We could not load the dashboard. Please try again."
        action={{ label: "Try again", onClick: reset }}
      />
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    </div>
  );
}
