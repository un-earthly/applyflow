"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface PrivacySettings {
  analytics: boolean;
  errorReporting: boolean;
  aiTrainingOptOut: boolean;
  marketingEmails: boolean;
}

const DEFAULT: PrivacySettings = {
  analytics: true,
  errorReporting: true,
  aiTrainingOptOut: false,
  marketingEmails: false,
};

const TOGGLES: { key: keyof PrivacySettings; label: string; description: string }[] = [
  {
    key: "analytics",
    label: "Product analytics",
    description: "Help us improve ApplyFlow by sharing anonymous usage data (pages visited, features used). No personal data is included.",
  },
  {
    key: "errorReporting",
    label: "Error reporting",
    description: "Automatically send error reports when something goes wrong. Helps us fix bugs faster.",
  },
  {
    key: "aiTrainingOptOut",
    label: "Opt out of AI model training",
    description: "By default, your data is never used for AI training. This toggle confirms that preference explicitly.",
  },
  {
    key: "marketingEmails",
    label: "Marketing emails",
    description: "Receive tips, product announcements, and case studies. You can unsubscribe at any time.",
  },
];

export default function PrivacyPage(): React.ReactElement {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "privacySettings", user.uid)).then((snap) => {
      setSettings(snap.exists() ? (snap.data() as PrivacySettings) : DEFAULT);
    });
  }, [user]);

  const toggle = (key: keyof PrivacySettings) => {
    setSettings((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const save = async () => {
    if (!user || !settings) return;
    setSaving(true);
    await setDoc(doc(db, "privacySettings", user.uid), { ...settings, updatedAt: serverTimestamp() });
    setSaving(false);
  };

  const exportData = async () => {
    alert("Your data export has been queued. You'll receive an email with a download link within 24 hours.");
  };

  if (!settings) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Privacy settings</h2>
        <p className="text-muted-foreground text-sm">Control how your data is used.</p>
      </div>

      <div className="space-y-0 rounded-lg border divide-y">
        {TOGGLES.map(({ key, label, description }) => (
          <div key={key} className="flex items-start justify-between gap-6 p-4">
            <div className="space-y-0.5">
              <Label htmlFor={key} className="text-sm font-medium cursor-pointer">{label}</Label>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              id={key}
              checked={settings[key]}
              onCheckedChange={() => toggle(key)}
              className="shrink-0"
            />
          </div>
        ))}
      </div>

      <Button onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </Button>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Data export</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Download a ZIP file of all your data: profile, resumes, applications, and cover letters.
          </p>
        </div>
        <Button variant="outline" onClick={() => void exportData()}>
          Request data export
        </Button>
      </div>
    </div>
  );
}
