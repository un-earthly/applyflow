"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const STEPS = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/profile", label: "Profile" },
  { path: "/onboarding/resume", label: "Resume" },
  { path: "/onboarding/preferences", label: "Preferences" },
  { path: "/onboarding/install-extension", label: "Extension" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));
  const isComplete = pathname.startsWith("/onboarding/complete");
  const stepIndex = isComplete ? STEPS.length : currentIndex;
  const progress = ((stepIndex + 1) / (STEPS.length + 1)) * 100;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < STEPS.length - 1;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            ApplyFlow
          </Link>
          {!isComplete && (
            <span className="text-muted-foreground text-sm">
              Step {currentIndex + 1} of {STEPS.length}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            Skip for now
          </Button>
        </div>
        <Progress value={progress} className="h-0.5 rounded-none" />
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[560px] px-4 py-10">{children}</div>
      </main>

      {!isComplete && currentIndex >= 0 && (
        <div className="border-t">
          <div className="mx-auto flex max-w-[560px] items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => hasPrev && router.push(STEPS[currentIndex - 1]!.path)}
              disabled={!hasPrev}
            >
              Back
            </Button>
            {hasNext && (
              <Button
                variant="outline"
                onClick={() => router.push(STEPS[currentIndex + 1]!.path)}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
