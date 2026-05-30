"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AUTH_ERROR_MAP: Record<string, string> = {
  "auth/wrong-password": "Incorrect email or password",
  "auth/user-not-found": "Incorrect email or password",
  "auth/invalid-credential": "Incorrect email or password",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/user-disabled": "This account has been disabled",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

function mapAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return AUTH_ERROR_MAP[(err as { code: string }).code] ?? "Failed to sign in";
  }
  return "Failed to sign in";
}

function LoginForm(): React.ReactElement {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return");
  const next = returnTo === "extension" ? null : (searchParams.get("next") ?? "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const afterAuth = async () => {
    if (returnTo === "extension") {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("[ApplyFlow Login] afterAuth called but no currentUser");
        return;
      }
      const idToken = await currentUser.getIdToken();
      const code = crypto.randomUUID().replace(/-/g, "");
      console.log("[ApplyFlow Login] Writing pairing code:", code);
      await setDoc(doc(db, "pairings", code), {
        idToken,
        expiresAt: Date.now() + 5 * 60 * 1000,
        createdAt: serverTimestamp(),
      });
      console.log("[ApplyFlow Login] Redirecting to extension-success with code");
      router.push(`/auth/extension-success?code=${code}`);
    } else {
      router.push(next ?? "/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      await afterAuth();
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
      await afterAuth();
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="h-10 w-full" disabled={loading || googleLoading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          Don&apos;t have an account?&nbsp;
          <Link href="/signup" className="font-medium underline underline-offset-4">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}
