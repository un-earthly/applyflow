import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface QuotaAlertProps {
  name?: string;
  used: number;
  cap: number;
  upgradeUrl?: string;
}

export function QuotaAlert({ name, used, cap, upgradeUrl = "https://app.applyflow.app/dashboard/settings/billing/upgrade" }: QuotaAlertProps) {
  const pct = Math.round((used / cap) * 100);
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve used {pct}% of your monthly autofill quota</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, padding: 32, borderTop: "3px solid #f59e0b" }}>
          <Heading style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
            Quota reminder
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            Hi {name ?? "there"}, you&apos;ve used {used} of your {cap} monthly autofills ({pct}%).
          </Text>
          <Text style={{ color: "#374151" }}>
            Upgrade to Pro for 500 autofills per month, plus unlimited AI features.
          </Text>
          <Button
            href={upgradeUrl}
            style={{ backgroundColor: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600, display: "inline-block" }}
          >
            Upgrade to Pro
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
