"use client";

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Upload, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import type { TemplateInfo } from "@/lib/resume-templates";
import { TemplatePreview } from "@/components/resume/template-preview";

export function UploadDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}): React.ReactElement {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "done" | "error">("idle");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(RESUME_TEMPLATES[0]!);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const resetDialog = () => {
    setStatus("idle");
    setFile(null);
    setName("");
    setSelectedTemplate(RESUME_TEMPLATES[0]!);
    setProgress(0);
  };

  const { startUpload } = useUploadThing("resumePdf", {
    headers: async () => {
      const token = await user!.getIdToken();
      return { authorization: `Bearer ${token}` };
    },
    onUploadProgress: (p) => setProgress(Math.round(p * 0.6)),
    onClientUploadComplete: async (res) => {
      const pdfUrl = res[0]?.ufsUrl ?? "";
      setStatus("parsing");
      setProgress(70);

      const token = await user!.getIdToken();
      const parseRes = await fetch("/api/resumes/parse-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pdfUrl, fileName: file?.name }),
      });

      let jsonData = { basics: { name: user?.displayName ?? "", email: user?.email ?? "", phone: "", url: "", summary: "", location: "", label: "" }, work: [], education: [], skills: [], projects: [] };
      if (parseRes.ok) {
        const parsed = await parseRes.json() as { jsonData?: typeof jsonData };
        if (parsed.jsonData) jsonData = parsed.jsonData;
      }

      setProgress(90);

      const docRef = await addDoc(collection(db, "users", user!.uid, "resumes"), {
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
        resetDialog();
        onCreated(docRef.id);
      }, 600);
    },
    onUploadError: () => setStatus("error"),
  });

  const handleUpload = async () => {
    if (!user || !file || !name.trim()) return;
    setStatus("uploading");
    setProgress(0);
    await startUpload([file]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetDialog(); }}>
      <DialogContent className="max-h-[90vh] min-w-7xl flex flex-col gap-0 p-4 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-lg">Upload PDF Resume</DialogTitle>
          <p className="text-muted-foreground text-sm mt-0.5">
            Import your existing resume. Optionally apply one of our templates to it.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-5">
          {/* Drop zone */}
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-all cursor-pointer select-none",
              dragOver ? "border-primary bg-primary/8 scale-[1.01]" :
                file ? "border-primary/50 bg-primary/5" :
                  "border-border hover:border-primary/40 hover:bg-muted/30",
            )}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
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
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB · <span className="text-primary/80">Click to change</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="font-medium text-sm">Drop your PDF here</div>
                <div className="text-muted-foreground text-xs mt-1">or click to browse · PDF only · max 16 MB</div>
              </div>
            )}
          </div>

          {/* Resume name */}
          <div className="space-y-1.5">
            <Label htmlFor="upload-name">Resume Name</Label>
            <Input
              id="upload-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Resume 2024"
            />
          </div>

          {/* Template picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm">Choose a template</Label>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {RESUME_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className="group relative flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all"
                    style={{
                      borderColor: isSelected ? tpl.accent : undefined,
                      boxShadow: isSelected
                        ? `0 0 0 1px ${tpl.accent}4d, 0 0 20px ${tpl.accent}33`
                        : undefined,
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center overflow-hidden rounded-lg w-full transition-all",
                        !isSelected && "border border-border group-hover:border-border/60",
                      )}
                      style={{ height: 113 }}
                    >
                      <TemplatePreview template={tpl} scale={0.1} />
                    </div>
                    <span className="text-[11px] font-medium">{tpl.name}</span>
                    {isSelected && (
                      <div
                        className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ backgroundColor: tpl.accent }}
                      >
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          {status !== "idle" && (
            <div className="space-y-1.5 rounded-lg bg-muted/40 p-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {status === "uploading" ? "Uploading PDF…"
                    : status === "parsing" ? "Extracting resume data with AI…"
                      : status === "done" ? "All done!"
                        : "Upload failed"}
                </span>
                <span className={status === "error" ? "text-destructive" : ""}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    status === "error" ? "bg-destructive" : status === "done" ? "bg-green-500" : "bg-primary",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => { onOpenChange(false); resetDialog(); }}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !name.trim() || status !== "idle"}
          >
            {status !== "idle" && status !== "error"
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Upload className="mr-2 h-4 w-4" />}
            Upload & Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
