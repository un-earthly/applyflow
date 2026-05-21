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

interface PasswordResetProps {
  resetUrl: string;
  name?: string;
}

export function PasswordReset({ resetUrl, name }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your ApplyFlow password</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#fff", borderRadius: 12, padding: 32 }}>
          <Heading style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
            Reset your password
          </Heading>
          <Text style={{ color: "#6b7280" }}>
            Hi {name ?? "there"}, we received a request to reset the password for your ApplyFlow account.
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={resetUrl}
              style={{ backgroundColor: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600 }}
            >
              Reset password
            </Button>
          </Section>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>
            This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
