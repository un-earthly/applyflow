"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Settings } from "lucide-react";

const ACTIONS = [
  {
    href: "/dashboard/resume",
    icon: FileText,
    label: "Build your resume",
    description: "Create a polished base resume in the AI editor.",
  },
  {
    href: "/dashboard/jobs",
    icon: Briefcase,
    label: "Browse jobs",
    description: "Search and save jobs to apply with one click.",
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Finish your settings",
    description: "Connect email, set notifications, manage billing.",
  },
];

export default function CompletePage(): React.ReactElement {
  const router = useRouter();
  return (
    <div className="space-y-10 text-center">
      <div className="space-y-3">
        <div className="text-5xl">🎉</div>
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h1>
        <p className="text-muted-foreground">
          ApplyFlow is ready to supercharge your job search. Here&apos;s what
          to do next.
        </p>
      </div>

      <div className="space-y-3 text-left">
        {ACTIONS.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40"
          >
            <div className="bg-primary/10 rounded-lg p-2">
              <Icon className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      <Button size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
        Go to dashboard
      </Button>
    </div>
  );
}
