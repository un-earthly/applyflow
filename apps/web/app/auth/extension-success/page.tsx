"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function ExtensionSuccessContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    // Legacy fallback: notify opener via postMessage if present.
    // The primary mechanism is the content-script bridge (hidden DOM element).
    if (code && window.opener) {
      console.log("[ApplyFlow] Posting pairing code to opener:", code);
      window.opener.postMessage({ type: "APPLYFLOW_PAIR", code }, "*");
    }
  }, [code]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-semibold">You&apos;re signed in!</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The ApplyFlow extension is now connecting to your account. You can close this tab.
      </p>
      {/* Hidden bridge element for content-script extraction — more reliable than tabs.onUpdated */}
      {code && <div id="af-extension-bridge" data-code={code} style={{ display: "none" }} />}
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
