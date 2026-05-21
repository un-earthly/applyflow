"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface IntegrationState {
  connected: boolean;
  displayName?: string | null;
  ownerName?: string | null;
  workspaceName?: string | null;
  connectedAt?: unknown;
}

interface IntegrationsMap {
  linkedin?: IntegrationState;
  notion?: IntegrationState;
  calendly?: IntegrationState;
  slack?: IntegrationState;
}

const INTEGRATION_CONFIG = [
  {
    key: "linkedin" as const,
    name: "LinkedIn",
    description: "Import your profile and experience automatically.",
    icon: "🔗",
    connectHref: "/api/integrations/linkedin/connect",
    configured: !!process.env.NEXT_PUBLIC_LINKEDIN_CONFIGURED,
    subtitle: (s: IntegrationState) => s.displayName ?? null,
  },
  {
    key: "notion" as const,
    name: "Notion",
    description: "Export your applications to a Notion database.",
    icon: "📝",
    connectHref: "/api/integrations/notion/connect",
    configured: !!process.env.NEXT_PUBLIC_NOTION_CONFIGURED,
    subtitle: (s: IntegrationState) => s.workspaceName ?? s.ownerName ?? null,
  },
  {
    key: "calendly" as const,
    name: "Calendly",
    description: "Sync interview invitations with your calendar.",
    icon: "📅",
    connectHref: "/api/integrations/calendly/connect",
    configured: !!process.env.NEXT_PUBLIC_CALENDLY_CONFIGURED,
    subtitle: (s: IntegrationState) => s.displayName ?? null,
  },
  {
    key: "slack" as const,
    name: "Slack",
    description: "Receive application updates in a Slack channel.",
    icon: "💬",
    connectHref: null,
    configured: false,
    subtitle: () => null,
  },
];

function IntegrationsInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<IntegrationsMap>({});
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully.`);
    if (error) toast.error(`Could not connect: ${error.replace(/_/g, " ")}`);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "profiles", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIntegrations((data.integrations as IntegrationsMap) ?? {});
      }
    });
  }, [user]);

  const handleDisconnect = async (key: string) => {
    setDisconnecting(key);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: key }),
      });
      if (res.ok) {
        toast.success("Disconnected successfully.");
      } else {
        toast.error("Failed to disconnect.");
      }
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Integrations</h2>
        <p className="text-muted-foreground text-sm">Connect ApplyFlow with your other tools.</p>
      </div>
      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATION_CONFIG.map((integration) => {
          const state = integrations[integration.key];
          const isConnected = !!state?.connected;
          const subtitle = state ? integration.subtitle(state) : null;

          return (
            <Card key={integration.key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{integration.icon}</span>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                  </div>
                  {isConnected ? (
                    <Badge variant="default" className="bg-green-500 text-white">Connected</Badge>
                  ) : integration.configured || integration.connectHref ? (
                    <Badge variant="secondary">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Coming soon</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{integration.description}</p>
                {isConnected && subtitle ? (
                  <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      disabled={disconnecting === integration.key}
                      onClick={() => handleDisconnect(integration.key)}
                    >
                      {disconnecting === integration.key ? "Disconnecting…" : "Disconnect"}
                    </Button>
                  ) : integration.connectHref ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { window.location.href = integration.connectHref!; }}
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function IntegrationsPage(): React.ReactElement {
  return (
    <Suspense>
      <IntegrationsInner />
    </Suspense>
  );
}
