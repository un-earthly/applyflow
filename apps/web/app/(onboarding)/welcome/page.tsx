"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  "AI-powered form filling on any job site",
  "Tailored resumes for each application",
  "Track every application in one place",
  "One-click apply with your saved profile",
  "Interview prep and follow-up reminders",
];

export default function WelcomePage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Let&apos;s set up your profile so ApplyFlow can automate your job
          search. Takes about 2 minutes.
        </p>
      </div>

      <ul className="space-y-3">
        {HIGHLIGHTS.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        className="w-full"
        onClick={() => router.push("/onboarding/profile")}
      >
        Let&apos;s go
      </Button>
    </div>
  );
}
