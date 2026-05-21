"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface Resume {
  id: string;
  name: string;
  content?: Record<string, unknown>;
}

interface TailorResult {
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: { original: string; tailored: string; section: string }[];
}

type Step = 1 | 2 | 3 | 4;

export default function ResumeIdTailorPage(): React.ReactElement {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [resume, setResume] = useState<Resume | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "resumes", id)).then((snap) => {
      if (snap.exists()) setResume({ id: snap.id, ...(snap.data() as Omit<Resume, "id">) });
    });
  }, [id]);

  const analyze = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/resumes/${id}/tailor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jd }),
    });
    if (res.ok) {
      const data = await res.json() as TailorResult;
      setResult(data);
      setStep(2);
    }
    setLoading(false);
  };

  const saveVersion = async () => {
    if (!user || !result) return;
    setSaving(true);
    const acceptedSuggestions = result.suggestions.filter((_, i) => accepted.has(i));
    await addDoc(collection(db, "resumeVersions"), {
      resumeId: id,
      userId: user.uid,
      label: `Tailored — ${new Date().toLocaleDateString()}`,
      tailored: true,
      suggestions: acceptedSuggestions,
      createdAt: serverTimestamp(),
    });
    setSaving(false);
    router.push(`/dashboard/resume/${id}`);
  };

  if (!resume) {
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
          <h1 className="text-2xl font-semibold">Tailor resume</h1>
          <p className="text-muted-foreground text-sm">{resume.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`h-px w-8 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
        <div className="ml-2 text-sm text-muted-foreground">
          {step === 1 && "Paste job description"}
          {step === 2 && "Review match analysis"}
          {step === 3 && "Accept/reject changes"}
          {step === 4 && "Save tailored version"}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paste the job description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="jd">Job description</Label>
              <Textarea
                id="jd"
                rows={12}
                placeholder="Paste the full job description here…"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
            <Button onClick={() => void analyze()} disabled={!jd.trim() || loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Analyzing…" : "Analyze match"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched skills ({result.matchedSkills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-600 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  Missing skills ({result.missingSkills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Review suggested edits</Button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Accept or reject each suggested change. Accepted changes will be saved as a new version.
          </p>
          <div className="space-y-3">
            {result.suggestions.map((s, i) => (
              <Card key={i} className={`border-l-4 ${accepted.has(i) ? "border-l-primary" : "border-l-border"}`}>
                <CardContent className="pt-4 space-y-3">
                  <Badge variant="outline" className="text-xs">{s.section}</Badge>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Original</p>
                      <p className="text-muted-foreground">{s.original}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Suggested</p>
                      <p>{s.tailored}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={accepted.has(i) ? "default" : "outline"}
                      onClick={() => setAccepted((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i); else next.add(i);
                        return next;
                      })}
                    >
                      {accepted.has(i) ? "Accepted" : "Accept"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => void saveVersion()} disabled={saving}>
              {saving ? "Saving…" : `Save version (${accepted.size} changes)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
