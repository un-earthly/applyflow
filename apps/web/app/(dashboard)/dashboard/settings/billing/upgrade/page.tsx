"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Zap } from "lucide-react";

const PRO_FEATURES = [
  "Unlimited applications",
  "AI resume tailoring",
  "AI cover letter generation",
  "Job match scoring",
  "Analytics dashboard",
  "Priority support",
  "API access",
  "Resume versions (unlimited)",
];

export default function BillingUpgradePage(): React.ReactElement {
  const { user } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const monthlyPrice = 12;
  const yearlyPrice = 10;
  const price = yearly ? yearlyPrice : monthlyPrice;
  const savings = Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100);

  const startCheckout = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: yearly ? "pro-annual" : "pro" }),
      });
      const { url } = (await res.json()) as { url?: string };
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold">Upgrade to Pro</h2>
        <p className="text-muted-foreground text-sm">Unlock AI tools and unlimited usage.</p>
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="billing-cycle" className="text-sm">Monthly</Label>
        <Switch id="billing-cycle" checked={yearly} onCheckedChange={setYearly} />
        <Label htmlFor="billing-cycle" className="text-sm">
          Yearly
          <Badge variant="secondary" className="ml-2 text-xs">Save {savings}%</Badge>
        </Label>
      </div>

      <Card className="border-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Pro</CardTitle>
            <Badge className="ml-auto">Most popular</Badge>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-bold">${price}</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          {yearly && (
            <p className="text-xs text-muted-foreground">Billed annually (${price * 12}/year)</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            size="lg"
            onClick={() => void startCheckout()}
            disabled={loading}
          >
            {loading ? "Redirecting…" : `Continue to checkout`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
