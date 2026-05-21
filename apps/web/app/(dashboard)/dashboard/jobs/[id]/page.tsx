"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description?: string;
  salary?: string;
  postedAt?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  userId: string;
}

export default function JobDetailPage(): React.ReactElement {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<SavedJob | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    getDoc(doc(db, "savedJobs", id)).then((snap) => {
      if (snap.exists()) {
        setJob({ id: snap.id, ...(snap.data() as Omit<SavedJob, "id">) });
      } else {
        setJob(null);
      }
    });
  }, [user, id]);

  const handleSaveToggle = async () => {
    if (!user || !job) return;
    setSaving(true);
    try {
      if (job.userId === user.uid) {
        await deleteDoc(doc(db, "savedJobs", id));
        router.push("/dashboard/jobs");
      } else {
        await setDoc(doc(db, "savedJobs", id), { ...job, userId: user.uid });
        setJob({ ...job, userId: user.uid });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!job?.url) return;
    window.open(job.url, "_blank");
    if (user) {
      await addDoc(collection(db, "applications"), {
        userId: user.uid,
        company: job.company,
        role: job.title,
        url: job.url,
        source: job.source,
        status: "applied",
        appliedAt: new Date(),
      });
    }
  };

  if (job === undefined) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Job not found.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/jobs")}>Back to jobs</Button>
      </div>
    );
  }

  const isSaved = job.userId === user?.uid;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold">{job.title}</h1>
                <p className="text-muted-foreground mt-1">{job.company} · {job.location}</p>
              </div>
              <div className="flex items-center gap-2">
                {job.matchScore !== undefined && (
                  <Badge variant="secondary" className="text-sm">{job.matchScore}% match</Badge>
                )}
                <Badge variant="outline" className="capitalize">{job.source}</Badge>
              </div>
            </div>
            {job.salary && (
              <p className="mt-2 text-sm font-medium">{job.salary}</p>
            )}
          </div>

          <Separator />

          {job.description ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h2 className="text-lg font-semibold mb-3">Job description</h2>
              <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-7">
                {job.description}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">No description available. View on the job board for full details.</p>
            </div>
          )}

          {(job.matchedSkills?.length || job.missingSkills?.length) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Match breakdown</h2>
                {job.matchedSkills?.length ? (
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Matched skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.matchedSkills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {job.missingSkills?.length ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Missing skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.missingSkills.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="lg:sticky lg:top-6 h-fit space-y-3 rounded-xl border p-5">
          <Button className="w-full" onClick={() => void handleApply()}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Apply now
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => void handleSaveToggle()}
            disabled={saving}
          >
            {isSaved ? (
              <><BookmarkCheck className="mr-2 h-4 w-4" />Saved</>
            ) : (
              <><Bookmark className="mr-2 h-4 w-4" />Save job</>
            )}
          </Button>
          <Separator />
          <Button variant="ghost" className="w-full justify-start text-sm" render={<Link href={`/dashboard/resume/${id}/tailor`} />}>
            <FileText className="mr-2 h-4 w-4" />
            Tailor resume
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate cover letter
          </Button>
        </div>
      </div>
    </div>
  );
}
