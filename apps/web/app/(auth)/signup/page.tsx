"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AUTH_ERROR_MAP: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/weak-password": "Password must be at least 8 characters",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

function mapAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return AUTH_ERROR_MAP[(err as { code: string }).code] ?? "Failed to create account";
  }
  return "Failed to create account";
}

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: "", color: "", width: "0%" };
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const score = [pw.length >= 8, hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (score <= 2) return { label: "Weak", color: "bg-destructive", width: "25%" };
  if (score === 3) return { label: "Fair", color: "bg-warning", width: "50%" };
  if (score === 4) return { label: "Strong", color: "bg-info", width: "75%" };
  return { label: "Very strong", color: "bg-success", width: "100%" };
}

export default function SignupPage(): React.ReactElement {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.push("/onboarding/welcome");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/onboarding/welcome");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-105">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </Button>

          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(v) => setAgreedToTerms(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                  I agree to the{" "}
                  <Link href="/legal/terms" className="underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="underline underline-offset-4">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketing"
                  checked={marketingOptIn}
                  onCheckedChange={(v) => setMarketingOptIn(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="marketing" className="text-muted-foreground text-sm font-normal leading-snug">
                  Send me tips, product updates, and job search advice
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={loading || googleLoading || !agreedToTerms}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          Already have an account?&nbsp;
          <Link href="/login" className="font-medium underline underline-offset-4">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
