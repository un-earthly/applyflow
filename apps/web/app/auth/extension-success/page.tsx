"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function ExtensionSuccessContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    // Extension background monitors tabs for this URL and extracts the code
    // Auto-close after a short delay (the extension should have captured the code)
    if (code) {
      const timer = setTimeout(() => window.close(), 3000);
      return () => clearTimeout(timer);
    }
  }, [code]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-semibold">You&apos;re signed in!</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The ApplyFlow extension is now connected to your account. You can close this tab.
      </p>
    </div>
  );
}

export default function ExtensionSuccessPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <ExtensionSuccessContent />
    </Suspense>
  );
}
