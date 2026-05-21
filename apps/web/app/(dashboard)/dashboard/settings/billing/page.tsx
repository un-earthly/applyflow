"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Zap } from "lucide-react";

const PRO_FEATURES = [
  "Unlimited autofills",
  "5 resumes",
  "AI resume tailoring",
  "Advanced analytics",
  "Priority support",
];

export default function BillingSettingsPage(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Billing</h2>
        <p className="text-muted-foreground text-sm">Manage your plan and usage.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current plan</CardTitle>
            <Badge variant="secondary">Free</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            You&apos;re on the Free plan. Upgrade to unlock unlimited autofills and AI features.
          </p>
          <Button onClick={() => router.push("/pricing")}>
            <Zap className="mr-2 h-4 w-4" />
            Upgrade to Pro — $12/mo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Usage this month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Autofills</span>
              <span className="text-muted-foreground">0 / 10</span>
            </div>
            <Progress value={0} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Resumes</span>
              <span className="text-muted-foreground">0 / 1</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pro plan includes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
