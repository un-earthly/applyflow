"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotifSettings {
  statusChange: boolean;
  weeklyDigest: boolean;
  interviewReminder: boolean;
  newJobMatch: boolean;
  marketingEmails: boolean;
}

const DEFAULT: NotifSettings = {
  statusChange: true,
  weeklyDigest: true,
  interviewReminder: true,
  newJobMatch: false,
  marketingEmails: false,
};

const ITEMS: { key: keyof NotifSettings; label: string; description: string }[] = [
  { key: "statusChange", label: "Application status changes", description: "When an application status is updated." },
  { key: "interviewReminder", label: "Interview reminders", description: "24-hour reminder before scheduled interviews." },
  { key: "weeklyDigest", label: "Weekly digest", description: "Summary of your job hunt activity each Monday." },
  { key: "newJobMatch", label: "New job matches", description: "When a new job matches your preferences." },
  { key: "marketingEmails", label: "Product updates & tips", description: "Occasional emails about new features." },
];

export default function NotificationsPage(): React.ReactElement {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "notificationSettings", user.uid)).then((snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT, ...(snap.data() as NotifSettings) });
    });
  }, [user]);

  const toggle = (key: keyof NotifSettings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "notificationSettings", user.uid), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Notifications</h2>
        <p className="text-muted-foreground text-sm">Control what emails and alerts you receive.</p>
      </div>
      <Separator />

      <div className="space-y-4">
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor={item.key} className="cursor-pointer font-medium">
                {item.label}
              </Label>
              <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
            </div>
            <Switch
              id={item.key}
              checked={settings[item.key]}
              onCheckedChange={() => toggle(item.key)}
            />
          </div>
        ))}
      </div>

      {saved && (
        <Alert>
          <AlertDescription>Notification preferences saved.</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving…" : "Save preferences"}
      </Button>
    </div>
  );
}
