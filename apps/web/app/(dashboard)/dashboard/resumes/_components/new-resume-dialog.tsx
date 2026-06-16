"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import type { TemplateInfo } from "@/lib/resume-templates";
import { TemplatePreview } from "@/components/resume/template-preview";

export function NewResumeDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}): React.ReactElement {
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
                    selectedTemplate.id === tpl.id ? "border-primary ring-2 ring-primary/20" : "border-border",
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
