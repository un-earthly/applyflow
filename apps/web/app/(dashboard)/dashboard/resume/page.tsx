"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Star } from "lucide-react";

interface ResumeDoc {
  id: string;
  name: string;
  isDefault: boolean;
  updatedAt: { seconds: number } | null;
}

function NewResumeDialog({
  onCreated,
}: {
  onCreated: (id: string) => void;
}): React.ReactElement {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "resumes"), {
        userId: user.uid,
        name: name.trim(),
        isDefault: false,
        jsonData: {
          basics: { name: user.displayName ?? "", email: user.email ?? "" },
          work: [],
          education: [],
          skills: [],
          projects: [],
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setOpen(false);
      setName("");
      onCreated(ref.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New resume
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New resume</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="resume-name">Name</Label>
          <Input
            id="resume-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Software Engineer — Base"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ResumePage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeDoc[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "resumes"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setResumes(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ResumeDoc, "id">),
        })),
      );
    });
  }, [user]);

  const isEmpty = resumes !== null && resumes.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resumes</h1>
          <p className="text-muted-foreground text-sm">
            Manage and tailor your resumes for each application.
          </p>
        </div>
        <NewResumeDialog
          onCreated={(id) => router.push(`/dashboard/resume/${id}/edit`)}
        />
      </div>

      {resumes === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <FileText className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="font-medium">No resumes yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your first resume to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() =>
                router.push(`/dashboard/resume/${resume.id}/edit`)
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-base">
                    {resume.name}
                  </CardTitle>
                  {resume.isDefault && (
                    <Badge variant="secondary" className="shrink-0">
                      <Star className="mr-1 h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {resume.updatedAt
                    ? `Updated ${new Date(resume.updatedAt.seconds * 1000).toLocaleDateString()}`
                    : "Just created"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/resume/${resume.id}/edit`);
                  }}
                >
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
