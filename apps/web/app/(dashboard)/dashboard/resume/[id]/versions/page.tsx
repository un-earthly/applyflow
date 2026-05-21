"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, History, Undo2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResumeVersion {
  id: string;
  resumeId: string;
  label: string;
  tailored?: boolean;
  createdAt?: { seconds: number };
  content?: Record<string, unknown>;
}

export default function ResumeVersionsPage(): React.ReactElement {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [versions, setVersions] = useState<ResumeVersion[] | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    const q = query(
      collection(db, "resumeVersions"),
      where("resumeId", "==", id),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    getDocs(q).then((snap) => {
      setVersions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResumeVersion, "id">) })));
    });
  }, [user, id]);

  const restore = async (version: ResumeVersion) => {
    if (!version.content) return;
    setRestoring(version.id);
    await setDoc(doc(db, "resumes", id), { content: version.content }, { merge: true });
    setRestoring(null);
    router.push(`/dashboard/resume/${id}/edit`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Version history</h1>
          <p className="text-muted-foreground text-sm">Restore a previous version of this resume.</p>
        </div>
      </div>

      {versions === null ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <History className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="font-medium">No versions saved yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Versions are saved automatically when you tailor a resume.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between gap-4 p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{version.label}</span>
                  {version.tailored && (
                    <Badge variant="secondary" className="text-xs">Tailored</Badge>
                  )}
                </div>
                {version.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(version.createdAt.seconds * 1000).toLocaleString()}
                  </p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={restoring === version.id || !version.content}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore this version?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will overwrite the current resume content with the content from &quot;{version.label}&quot;.
                      The current content will be saved as a new version first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void restore(version)}>
                      Restore
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
