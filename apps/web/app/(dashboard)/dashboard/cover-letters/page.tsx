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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Mail, Clock } from "lucide-react";

interface CoverLetter {
  id: string;
  company: string;
  role: string;
  content: string;
  createdAt: { seconds: number } | null;
}

export default function CoverLettersPage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetter[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", jobDescription: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "coverLetters"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setLetters(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CoverLetter, "id">) })),
      );
    });
  }, [user]);

  const handleCreate = async () => {
    if (!user || !form.company || !form.role) return;
    setCreating(true);
    try {
      const placeholder = `Dear Hiring Manager,\n\nI am excited to apply for the ${form.role} position at ${form.company}. [Edit this cover letter to make it your own.]\n\nBest regards,\n${user.displayName ?? "Your Name"}`;
      const ref = await addDoc(collection(db, "coverLetters"), {
        userId: user.uid,
        company: form.company,
        role: form.role,
        jobDescription: form.jobDescription,
        content: placeholder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setOpen(false);
      setForm({ company: "", role: "", jobDescription: "" });
      router.push(`/dashboard/cover-letters/${ref.id}`);
    } finally {
      setCreating(false);
    }
  };

  if (letters === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cover Letters</h1>
          <p className="text-muted-foreground text-sm">Write and manage your cover letters.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />New letter</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New cover letter</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Company</Label>
                  <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Corp" />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Software Engineer" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Job description (optional)</Label>
                <Textarea value={form.jobDescription} onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))} placeholder="Paste the job description for better AI suggestions…" rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating || !form.company || !form.role}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {letters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <Mail className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="font-medium">No cover letters yet</p>
          <p className="text-muted-foreground mt-1 text-sm">Create your first cover letter to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter) => (
            <Card
              key={letter.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/dashboard/cover-letters/${letter.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{letter.company}</CardTitle>
                <CardDescription>{letter.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 text-xs">{letter.content}</p>
                {letter.createdAt && (
                  <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(letter.createdAt.seconds * 1000).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
