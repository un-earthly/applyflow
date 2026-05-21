import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Minus } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with AI autofill.",
    cta: "Start free",
    href: "/signup",
    highlighted: false,
    features: [
      { label: "10 autofills / month", included: true },
      { label: "1 resume", included: true },
      { label: "Basic templates", included: true },
      { label: "Application tracker", included: true },
      { label: "AI resume tailoring", included: false },
      { label: "Advanced analytics", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$12",
    description: "For active job seekers.",
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlighted: true,
    features: [
      { label: "Unlimited autofills", included: true },
      { label: "5 resumes", included: true },
      { label: "All templates", included: true },
      { label: "Application tracker", included: true },
      { label: "AI resume tailoring", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    name: "Teams",
    price: "$29",
    description: "Per user, for recruiting teams.",
    cta: "Start Teams",
    href: "/signup?plan=teams",
    highlighted: false,
    features: [
      { label: "Unlimited autofills", included: true },
      { label: "Unlimited resumes", included: true },
      { label: "All templates", included: true },
      { label: "Application tracker", included: true },
      { label: "AI resume tailoring", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

export default function PricingPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlighted && <Badge>Most popular</Badge>}
              </div>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "$0" && <span className="text-muted-foreground text-sm">/mo</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} render={<Link href={plan.href} />}>
                {plan.cta}
              </Button>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                    ) : (
                      <Minus className="text-muted-foreground h-4 w-4 shrink-0" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground"}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
