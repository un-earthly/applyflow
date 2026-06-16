"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAtom } from "jotai";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Upload } from "lucide-react";
import { ResumeCard } from "./_components/resume-card";
import { newResumeDialogOpenAtom, uploadDialogOpenAtom } from "./_components/resume-dialog-atoms";
import type { ResumeDoc } from "./_components/types";

export default function ResumesListPage(): React.ReactElement {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeDoc[] | null>(null);
  const [, setNewOpen] = useAtom(newResumeDialogOpenAtom);
  const [, setUploadOpen] = useAtom(uploadDialogOpenAtom);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "resumes"), orderBy("updatedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setResumes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResumeDoc, "id">) })));
    });
  }, [user]);

  const isEmpty = resumes !== null && resumes.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resumes</h1>
          <p className="text-muted-foreground text-sm">Create tailored resumes from beautiful templates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload PDF
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Resume
          </Button>
        </div>
      </div>

      {resumes === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
          <FileText className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="font-medium">No resumes yet</p>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">Start with a template or upload your existing PDF.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setUploadOpen(true)}><Upload className="mr-2 h-4 w-4" />Upload PDF</Button>
            <Button onClick={() => setNewOpen(true)}><Plus className="mr-2 h-4 w-4" />Choose Template</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            onClick={() => setNewOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors hover:border-primary/60 hover:bg-muted/30"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">New Resume</span>
          </button>
          {resumes.map((resume) => <ResumeCard key={resume.id} resume={resume} />)}
        </div>
      )}
    </div>
  );
}
