"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ExternalLink, Gift } from "lucide-react";

const NEXT_STEPS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Open dashboard",
    description: "See your application pipeline and stats.",
  },
  {
    href: "https://linkedin.com/jobs",
    icon: ExternalLink,
    label: "Try a test fill on LinkedIn",
    description: "Open a job posting and let ApplyFlow fill the form.",
    external: true,
  },
  {
    href: "/dashboard/settings/billing",
    icon: Gift,
    label: "Invite a friend (Pro perk)",
    description: "Share ApplyFlow and earn free autofills.",
  },
];

export default function CompletePage(): React.ReactElement {
  return (
    <div className="space-y-10 text-center">
      <div className="space-y-3">
        <p className="text-5xl select-none" aria-hidden>🎉</p>
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re set!</h1>
        <p className="text-muted-foreground">
          Here&apos;s where to go next.
        </p>
      </div>

      <div className="space-y-3 text-left">
        {NEXT_STEPS.map(({ href, icon: Icon, label, description, external }) => (
          <Link
            key={href}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40"
          >
            <div className="bg-primary/10 rounded-lg p-2 shrink-0">
              <Icon className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
