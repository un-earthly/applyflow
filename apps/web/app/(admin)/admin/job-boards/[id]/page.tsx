"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";

interface JobBoardConfig {
  name?: string;
  domain?: string;
  selectors?: string;
  selectorsVersion?: string;
}

const DEFAULT_SELECTORS = JSON.stringify({
  nameField: 'input[name="name"], input[id*="name"]',
  emailField: 'input[type="email"]',
  phoneField: 'input[type="tel"], input[name*="phone"]',
  resumeUpload: 'input[type="file"][accept*="pdf"]',
  submitButton: 'button[type="submit"]',
}, null, 2);

export default function AdminJobBoardDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [config, setConfig] = useState<JobBoardConfig | null>(null);
  const [selectors, setSelectors] = useState(DEFAULT_SELECTORS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "jobBoards", id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as JobBoardConfig;
        setConfig(data);
        if (data.selectors) setSelectors(data.selectors);
      } else {
        setConfig({ name: id, domain: `${id}.com` });
      }
    });
  }, [id]);

  const save = async () => {
    try {
      JSON.parse(selectors);
    } catch {
      setError("Invalid JSON. Please fix the selectors before saving.");
      return;
    }
    setSaving(true);
    setError("");
    await setDoc(doc(db, "jobBoards", id), {
      ...config,
      selectors,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setSaving(false);
  };

  if (!config) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{config.name ?? id}</h1>
          <p className="text-muted-foreground text-sm">{config.domain}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="selectors">Selector configuration (JSON)</Label>
        <p className="text-xs text-muted-foreground">
          CSS selectors used by the extension to identify form fields on this job board.
        </p>
        <Textarea
          id="selectors"
          value={selectors}
          onChange={(e) => { setSelectors(e.target.value); setError(""); }}
          rows={20}
          className="font-mono text-xs"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button onClick={() => void save()} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Saving…" : "Save selectors"}
      </Button>
    </div>
  );
}
