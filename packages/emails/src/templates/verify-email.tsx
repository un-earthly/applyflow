import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  verificationUrl: string;
  name?: string;
}

export function VerifyEmail({ verificationUrl, name }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to get started with ApplyFlow</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, padding: 32 }}>
          <Heading style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
            Verify your email
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            Hi {name ?? "there"}, welcome to ApplyFlow! Click the button below to verify your email address and get started.
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={verificationUrl}
              style={{ backgroundColor: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600 }}
            >
              Verify email
            </Button>
          </Section>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>
            If you didn&apos;t create an account, you can safely ignore this email. This link expires in 24 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
