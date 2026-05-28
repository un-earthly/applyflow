"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification, reload } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.emailVerified) { router.replace("/onboarding/welcome"); return; }
    const interval = setInterval(async () => {
      if (!document.hasFocus()) return;
      await reload(auth.currentUser!);
      if (auth.currentUser?.emailVerified) {
        clearInterval(interval);
        router.replace("/onboarding/welcome");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, router]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    setSent(true);
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <MailCheck className="text-primary mx-auto mb-2 h-12 w-12" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{user?.email}</strong>.<br />
            Click it to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sent && <p className="text-muted-foreground text-sm">Email sent!</p>}
          <Button variant="outline" className="w-full" onClick={handleResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
          </Button>
          <Button variant="ghost" className="w-full text-sm" onClick={() => { void auth.signOut(); router.push("/login"); }}>
            Wrong email? Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
