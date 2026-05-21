"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  query,
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
import { Plus, FileText, Star, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResumeDoc {
  id: string;
  name: string;
  isDefault: boolean;
  updatedAt: { seconds: number } | null;
}

function NewResumeDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCreated,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated: (id: string) => void;
}): React.ReactElement {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "users", user.uid, "resumes"), {
        name: name.trim(),
        isDefault: false,
        basics: {
          name: user.displayName ?? "",
          email: user.email ?? "",
          phone: "",
          url: "",
          summary: "",
          location: "",
          label: "",
        },
        work: [],
        education: [],
        skills: [],
        projects: [],
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
      <DialogTrigger>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New resume
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="resume-name">Resume Name</Label>
          <Input
            id="resume-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Software Engineer — 2024"
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

export default function ResumesListPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumes, setResumes] = useState<ResumeDoc[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") setDialogOpen(true);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "resumes"),
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
            Create, manage, and tailor your resumes for job applications.
          </p>
        </div>
        <NewResumeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={(id) => router.push(`/dashboard/resumes/${id}/edit`)}
        />
      </div>

      {resumes === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
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
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => router.push(`/dashboard/resumes/${resume.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-base">
                      {resume.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {resume.updatedAt
                        ? `Updated ${new Date(resume.updatedAt.seconds * 1000).toLocaleDateString()}`
                        : "Just created"}
                    </CardDescription>
                  </div>
                  {resume.isDefault && (
                    <Badge variant="secondary" className="shrink-0">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/resumes/${resume.id}/edit`);
                  }}
                >
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/resumes/${resume.id}/tailor`)}>
                      Tailor for Job
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/resumes/${resume.id}/preview`)}>
                      Preview
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
