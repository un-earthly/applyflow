import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface WeeklySummaryProps {
  name?: string;
  stats: {
    applied: number;
    interviews: number;
    offers: number;
    responseRate: number;
  };
  dashboardUrl?: string;
}

export function WeeklySummary({ name, stats, dashboardUrl = "https://app.applyflow.app/dashboard" }: WeeklySummaryProps) {
  return (
    <Html>
      <Head />
      <Preview>Your weekly job search summary — {stats.applied} applications sent</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, padding: 32 }}>
          <Heading style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
            Your week in review
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            Hi {name ?? "there"}, here&apos;s what happened in your job search this week.
          </Text>

          <Section style={{ backgroundColor: "#f3f4f6", borderRadius: 8, padding: "16px 24px", margin: "24px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Text style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>{stats.applied}</Text>
                <Text style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>Applications sent</Text>
              </div>
              <div>
                <Text style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>{stats.interviews}</Text>
                <Text style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>Interviews</Text>
              </div>
              <div>
                <Text style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>{stats.offers}</Text>
                <Text style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>Offers</Text>
              </div>
              <div>
                <Text style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>{stats.responseRate}%</Text>
                <Text style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>Response rate</Text>
              </div>
            </div>
          </Section>

          <Button
            href={dashboardUrl}
            style={{ backgroundColor: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600, display: "inline-block" }}
          >
            View full dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
