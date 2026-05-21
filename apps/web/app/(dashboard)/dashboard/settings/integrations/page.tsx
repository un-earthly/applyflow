"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "LinkedIn",
    description: "Import your profile and experience automatically.",
    status: "coming-soon",
    icon: "🔗",
  },
  {
    name: "Notion",
    description: "Export your applications to a Notion database.",
    status: "coming-soon",
    icon: "📝",
  },
  {
    name: "Calendly",
    description: "Sync interview invitations with your calendar.",
    status: "coming-soon",
    icon: "📅",
  },
  {
    name: "Slack",
    description: "Receive application updates in a Slack channel.",
    status: "coming-soon",
    icon: "💬",
  },
];

export default function IntegrationsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Integrations</h2>
        <p className="text-muted-foreground text-sm">Connect ApplyFlow with your other tools.</p>
      </div>
      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{integration.icon}</span>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                </div>
                <Badge variant="secondary">Coming soon</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{integration.description}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                <Globe className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
