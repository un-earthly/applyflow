"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp,
} from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/use-auth";
import { db, storage } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, FileText, Star, MoreVertical, Upload, Loader2, Check,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import type { TemplateInfo } from "@/lib/resume-templates";
import { TemplatePreview } from "@/components/resume/template-preview";

interface ResumeDoc {
  id: string;
  name: string;
  isDefault: boolean;
  templateId?: string;
  updatedAt: { seconds: number } | null;
}

// ── New resume dialog (blank or template) ─────────────────────────────────────

function NewResumeDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(RESUME_TEMPLATES[0]!);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "users", user.uid, "resumes"), {
        name: name.trim(),
        templateId: selectedTemplate.id,
        isDefault: false,
        jsonData: {
          basics: { name: user.displayName ?? "", email: user.email ?? "", phone: "", url: "", summary: "", location: "", label: "" },
          work: [], education: [], skills: [], projects: [],
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onOpenChange(false);
      setName("");
      onCreated(ref.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
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

          <div>
            <Label className="mb-3 block">Choose a Template</Label>
            <div className="grid grid-cols-4 gap-3 max-h-105 overflow-y-auto pr-1">
              {RESUME_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all hover:border-primary/60",
                    selectedTemplate.id === tpl.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border",
                  )}
                >
                  <div className="relative overflow-hidden rounded bg-muted/30" style={{ width: 160, height: 226 }}>
                    <TemplatePreview template={tpl} scale={0.2} />
                    {selectedTemplate.id === tpl.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold">{tpl.name}</div>
                    <div className="text-muted-foreground text-[10px] leading-tight mt-0.5 line-clamp-2">{tpl.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : "Create Resume"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Upload PDF dialog ─────────────────────────────────────────────────────────

function UploadDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "done" | "error">("idle");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(RESUME_TEMPLATES[0]!);

  const handleFile = (f: File) => {
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!user || !file || !name.trim()) return;
    setStatus("uploading");
    setProgress(0);

    try {
      // 1. Upload PDF to Firebase Storage
      const path = `users/${user.uid}/resumes/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, file);

      const pdfUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 60)),
          reject,
          async () => { resolve(await getDownloadURL(uploadTask.snapshot.ref)); },
        );
      });

      setStatus("parsing");
      setProgress(70);

      // 2. Parse PDF → JSON data via API
      const token = await user.getIdToken();
      const parseRes = await fetch("/api/resumes/parse-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pdfUrl, fileName: file.name }),
      });

      let jsonData = { basics: { name: user.displayName ?? "", email: user.email ?? "", phone: "", url: "", summary: "", location: "", label: "" }, work: [], education: [], skills: [], projects: [] };
      if (parseRes.ok) {
        const parsed = await parseRes.json() as { jsonData?: typeof jsonData };
        if (parsed.jsonData) jsonData = parsed.jsonData;
      }

      setProgress(90);

      // 3. Create resume document
      const ref = await addDoc(collection(db, "users", user.uid, "resumes"), {
        name: name.trim(),
        templateId: selectedTemplate.id,
        isDefault: false,
        pdfUrl,
        jsonData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setProgress(100);
      setStatus("done");
      setTimeout(() => {
        onOpenChange(false);
        setStatus("idle");
        setFile(null);
        setName("");
        onCreated(ref.id);
      }, 600);
    } catch {
      setStatus("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload PDF Resume</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition-colors cursor-pointer",
              file ? "border-primary/60 bg-primary/5" : "border-border hover:border-primary/40",
            )}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") handleFile(f);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {file ? (
              <div className="text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-primary" />
                <div className="font-medium text-sm">{file.name}</div>
                <div className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(0)} KB · Click to change</div>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <div className="font-medium text-sm">Drop your PDF here</div>
                <div className="text-muted-foreground text-xs mt-1">or click to browse · PDF only</div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upload-name">Resume Name</Label>
            <Input
              id="upload-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Resume 2024"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm">Template to apply</Label>
            <div className="grid grid-cols-5 gap-2 max-h-52 overflow-y-auto">
              {RESUME_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border p-1.5 transition-all",
                    selectedTemplate.id === tpl.id ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/40",
                  )}
                >
                  <div style={{ width: 80, height: 113, overflow: "hidden", borderRadius: 3, background: "#f3f4f6" }}>
                    <TemplatePreview template={tpl} scale={0.1} />
                  </div>
                  <span className="text-[10px] font-medium">{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {status !== "idle" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {status === "uploading" ? "Uploading…" : status === "parsing" ? "Parsing resume with AI…" : status === "done" ? "Done!" : "Error"}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="text-destructive text-sm">Upload failed. Please try again.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !name.trim() || status !== "idle"}
          >
            {status !== "idle" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload & Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResumesListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeDoc[] | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

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
          <p className="text-muted-foreground text-sm">
            Create tailored resumes from beautiful templates.
          </p>
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

      <NewResumeDialog open={newOpen} onOpenChange={setNewOpen} onCreated={(id) => router.push(`/dashboard/resumes/${id}/edit`)} />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onCreated={(id) => router.push(`/dashboard/resumes/${id}/edit`)} />

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
          {/* "New" card always first */}
          <button
            onClick={() => setNewOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors hover:border-primary/60 hover:bg-muted/30"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">New Resume</span>
          </button>

          {resumes.map((resume) => {
            const tpl = RESUME_TEMPLATES.find((t) => t.id === resume.templateId) ?? RESUME_TEMPLATES[0]!;
            return (
              <div
                key={resume.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/dashboard/resumes/${resume.id}/edit`)}
              >
                {/* Template preview thumbnail */}
                <div className="relative overflow-hidden bg-muted/20" style={{ height: 180 }}>
                  <TemplatePreview template={tpl} scale={0.226} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{resume.name}</div>
                    <div className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: tpl.accent }}
                      />
                      {tpl.name} · {resume.updatedAt ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString() : "New"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {resume.isDefault && (
                      <Badge variant="secondary" className="text-[10px] py-0">
                        <Star className="mr-1 h-2.5 w-2.5 fill-current" />Default
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/edit`); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/preview`); }}>Preview</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/tailor`); }}>Tailor for Job</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/resumes/${resume.id}/versions`); }}>Version History</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
