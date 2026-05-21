"use client";

import { useState } from "react";
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

function PasswordSection(): React.ReactElement {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      const user = auth.currentUser!;
      const cred = EmailAuthProvider.credential(user.email!, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setSuccess(true);
      setCurrent(""); setNewPw(""); setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Change password</h3>
        <p className="text-muted-foreground text-sm">Update your password. You&apos;ll need to re-enter your current one.</p>
      </div>
      <form onSubmit={handleChange} className="space-y-3 max-w-sm">
        <div className="space-y-1.5">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new">New password</Label>
          <Input id="new" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} minLength={8} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert><AlertDescription>Password updated successfully.</AlertDescription></Alert>}
        <Button type="submit" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
      </form>
    </div>
  );
}

export default function AccountSettingsPage(): React.ReactElement {
  const { user } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Account</h2>
        <p className="text-muted-foreground text-sm">Manage your email and password.</p>
      </div>
      <Separator />

      <div className="space-y-3">
        <div>
          <h3 className="font-medium">Email address</h3>
          <p className="text-muted-foreground text-sm">Your sign-in email.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.email}</span>
          {user?.emailVerified ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              Unverified
            </Badge>
          )}
        </div>
        {!user?.emailVerified && (
          <div>
            {resendSent ? (
              <p className="text-sm text-green-600">Verification email sent. Check your inbox.</p>
            ) : (
              <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resendLoading}>
                {resendLoading ? "Sending…" : "Resend verification email"}
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />
      <PasswordSection />

      <Separator />
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-destructive">Danger zone</h3>
          <p className="text-muted-foreground text-sm">Irreversible actions.</p>
        </div>
        <Button variant="destructive" onClick={() => alert("Contact support to delete your account.")}>
          Delete account
        </Button>
      </div>
    </div>
  );
}
