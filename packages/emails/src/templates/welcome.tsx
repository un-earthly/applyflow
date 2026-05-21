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

interface WelcomeEmailProps {
  name?: string;
  dashboardUrl?: string;
}

export function WelcomeEmail({ name, dashboardUrl = "https://app.applyflow.app/dashboard" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ApplyFlow — let&apos;s get you hired</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, padding: 32 }}>
          <Heading style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
            Welcome to ApplyFlow ⚡
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            Hi {name ?? "there"}, your account is ready. Here&apos;s what to do next:
          </Text>
          <Text style={{ color: "#374151" }}>
            1. Install the browser extension<br />
            2. Open a job posting on LinkedIn or Indeed<br />
            3. Watch ApplyFlow fill the form for you
          </Text>
          <Button
            href={dashboardUrl}
            style={{ backgroundColor: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600, display: "inline-block" }}
          >
            Go to dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
