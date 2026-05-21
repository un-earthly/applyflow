"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Globe, Loader2 } from "lucide-react";

const EXTENSION_ID = "applyflow-extension";

function detectExtension(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof window !== "undefined" && "chrome" in window) {
        const w = window as Window & { chrome?: { runtime?: { sendMessage?: (id: string, msg: unknown, cb: (resp: unknown) => void) => void } } };
        w.chrome?.runtime?.sendMessage?.(EXTENSION_ID, { type: "ping" }, (resp) => {
          resolve(!!resp);
        });
        setTimeout(() => resolve(false), 500);
      } else {
        resolve(false);
      }
    } catch {
      resolve(false);
    }
  });
}

export default function InstallExtensionPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [detected, setDetected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    detectExtension().then((found) => {
      setDetected(found);
      setChecking(false);
    });
  }, []);

  const handleContinue = async () => {
    if (!user) return;
    await setDoc(
      doc(db, "profiles", user.uid),
      { onboardingCompleted: true, updatedAt: new Date() },
      { merge: true },
    );
    router.push("/onboarding/complete");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Install the browser extension
        </h1>
        <p className="text-muted-foreground text-sm">
          The Globe extension is how ApplyFlow fills job applications
          automatically on any site.
        </p>
      </div>

      <div className="rounded-xl border p-6 text-center space-y-4">
        {checking ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
        ) : detected ? (
          <>
            <CheckCircle2 className="text-primary mx-auto h-12 w-12" />
            <div>
              <p className="font-medium">Extension detected!</p>
              <p className="text-muted-foreground text-sm">
                ApplyFlow is ready to fill applications.
              </p>
            </div>
          </>
        ) : (
          <>
            <Globe className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <p className="font-medium">Not yet installed</p>
              <p className="text-muted-foreground text-sm">
                Add the extension from the Globe Web Store.
              </p>
            </div>
            <Button size="lg" className="w-full max-w-xs">
              <Globe className="mr-2 h-4 w-4" />
              Add to Globe
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Button className="w-full" onClick={handleContinue}>
          {detected ? "Continue" : "I'll install it later"}
        </Button>
      </div>
    </div>
  );
}
