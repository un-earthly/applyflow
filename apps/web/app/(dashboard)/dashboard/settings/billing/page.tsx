"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { CheckCircle2, Zap, ExternalLink, Loader2 } from "lucide-react";

const PRO_FEATURES = [
  "Unlimited autofills",
  "5 resumes",
  "AI resume tailoring",
  "Advanced analytics",
  "Priority support",
];

const PLAN_LIMITS: Record<string, { autofills: number; resumes: number }> = {
  free: { autofills: 10, resumes: 1 },
  pro: { autofills: Infinity, resumes: 5 },
  teams: { autofills: Infinity, resumes: Infinity },
};

interface Subscription {
  tier: "free" | "pro" | "teams";
  status?: string;
  currentPeriodEnd?: { seconds: number } | null;
  stripeCustomerId?: string;
}

interface Usage {
  autofills?: number;
  resumes?: number;
}

export default function BillingSettingsPage(): React.ReactElement {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription>({ tier: "free" });
  const [usage, setUsage] = useState<Usage>({});
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setSub({
          tier: d.subscriptionTier ?? "free",
          status: d.subscriptionStatus,
          currentPeriodEnd: d.subscriptionCurrentPeriodEnd ?? null,
          stripeCustomerId: d.stripeCustomerId,
        });
      }
    });
    const unsubUsage = onSnapshot(doc(db, "usage", user.uid), (snap) => {
      if (snap.exists()) setUsage(snap.data() as Usage);
    });
    return () => { unsubProfile(); unsubUsage(); };
  }, [user]);

  const limits = PLAN_LIMITS[sub.tier] ?? PLAN_LIMITS.free!;
  const autofillPct = limits.autofills === Infinity ? 0 : ((usage.autofills ?? 0) / limits.autofills) * 100;
  const resumePct = limits.resumes === Infinity ? 0 : ((usage.resumes ?? 0) / limits.resumes) * 100;

  const handleManagePortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const { url } = await res.json() as { url?: string };
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  const renewalDate = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd.seconds * 1000).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Billing</h2>
        <p className="text-muted-foreground text-sm">Manage your plan and usage.</p>
      </div>
      <Separator />

      {/* Current plan */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current plan</CardTitle>
            <Badge variant={sub.tier === "free" ? "secondary" : "default"} className="capitalize">
              {sub.tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sub.status && sub.status !== "active" && (
            <p className="text-sm text-destructive capitalize">Status: {sub.status}</p>
          )}
          {renewalDate && (
            <p className="text-muted-foreground text-sm">Renews on {renewalDate}</p>
          )}
          {sub.tier === "free" ? (
            <Button render={<Link href="/dashboard/settings/billing/upgrade" />}>
              <Zap className="mr-2 h-4 w-4" />
              Upgrade to Pro — $12/mo
            </Button>
          ) : (
            <Button variant="outline" onClick={handleManagePortal} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Manage in Stripe portal
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Usage this month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Autofills</span>
              <span className="text-muted-foreground">
                {usage.autofills ?? 0} /{" "}
                {limits.autofills === Infinity ? "∞" : limits.autofills}
              </span>
            </div>
            <Progress value={autofillPct} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Resumes</span>
              <span className="text-muted-foreground">
                {usage.resumes ?? 0} /{" "}
                {limits.resumes === Infinity ? "∞" : limits.resumes}
              </span>
            </div>
            <Progress value={resumePct} />
          </div>
        </CardContent>
      </Card>

      {/* Pro features */}
      {sub.tier === "free" && (
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
      )}

      {sub.tier !== "free" && (
        <p className="text-muted-foreground text-center text-sm">
          <button
            onClick={handleManagePortal}
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Cancel or downgrade subscription
          </button>
        </p>
      )}
    </div>
  );
}
