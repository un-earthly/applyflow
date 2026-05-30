"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Pencil, Printer } from "lucide-react";
import { getTemplate, RESUME_TEMPLATES } from "@/lib/resume-templates";
import type { ResumeData } from "@/lib/resume-templates/types";

export default function ResumePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [data, setData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState("classic");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    return onSnapshot(doc(db, "users", user.uid, "resumes", id), (snap) => {
      if (!snap.exists()) { router.replace("/dashboard/resumes"); return; }
      const d = snap.data();
      setName((d.name as string) ?? "Resume");
      setTemplateId((d.templateId as string | undefined) ?? "classic");
      setData((d.jsonData ?? {
        basics: d.basics ?? {},
        work: d.work ?? [],
        education: d.education ?? [],
        skills: d.skills ?? [],
        projects: d.projects ?? [],
      }) as ResumeData);
    });
  }, [id, user, router]);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/resumes/${id}/export`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const tpl = getTemplate(templateId);

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-3.5rem)] flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm truncate max-w-60">{name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "classic")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESUME_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
                    {t.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {exporting ? "Exporting…" : "PDF"}
          </Button>
          <Button size="sm" onClick={() => router.push(`/dashboard/resumes/${id}/edit`)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />Edit
          </Button>
        </div>
      </div>

      {/* A4 canvas — scrollable viewport */}
      <div className="flex-1 overflow-auto flex justify-center py-8 px-4">
        {!data ? (
          <Skeleton style={{ width: 794, height: 1123 }} className="rounded-lg" />
        ) : (
          <div
            style={{
              width: 794,
              minHeight: 1123,
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <tpl.component data={data} />
          </div>
        )}
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}
