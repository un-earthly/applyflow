"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Briefcase, GraduationCap, Code2, FolderGit2,
  ArrowLeft, Eye, Download, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplate } from "@/lib/resume-templates";
import { BasicsForm, WorkForm, EducationForm, SkillsForm, ProjectsForm } from "../../_components/section-forms";
import { TemplatePicker } from "../../_components/template-picker";
import type { JsonData } from "../../_components/types";
import { EMPTY_BASICS } from "../../_components/types";

type Section = "basics" | "work" | "education" | "skills" | "projects";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "basics", label: "Basics", icon: User },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
];

export default function ResumeEditPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [resumeName, setResumeName] = useState("");
  const [data, setData] = useState<JsonData | null>(null);
  const [templateId, setTemplateId] = useState("classic");
  const [activeSection, setActiveSection] = useState<Section>("basics");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    return onSnapshot(doc(db, "users", user.uid, "resumes", id), (snap) => {
      if (!snap.exists()) { router.replace("/dashboard/resumes"); return; }
      const d = snap.data();
      setResumeName(d.name as string);
      setTemplateId((d.templateId as string | undefined) ?? "classic");
      if (d.jsonData) {
        setData(d.jsonData as JsonData);
      } else {
        setData({
          basics: (d.basics as JsonData["basics"]) ?? EMPTY_BASICS,
          work: (d.work as JsonData["work"]) ?? [],
          education: (d.education as JsonData["education"]) ?? [],
          skills: (d.skills as JsonData["skills"]) ?? [],
          projects: (d.projects as JsonData["projects"]) ?? [],
        });
      }
    });
  }, [id, user, router]);

  const save = useCallback(async (nextData: JsonData, nextTemplateId?: string) => {
    if (!id || !user) return;
    setSaveStatus("saving");
    try {
      await updateDoc(doc(db, "users", user.uid, "resumes", id), {
        jsonData: nextData,
        templateId: nextTemplateId ?? templateId,
        updatedAt: serverTimestamp(),
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }, [id, user, templateId]);

  const handleChange = (nextData: JsonData) => {
    setData(nextData);
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void save(nextData); }, 1200);
  };

  const handleTemplateChange = async (newId: string) => {
    setTemplateId(newId);
    if (data) await save(data, newId);
  };

  const handleExport = async () => {
    if (!user) return;
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
    a.download = `${resumeName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tpl = getTemplate(templateId);

  if (!data) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-125 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/dashboard/resumes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm truncate max-w-48">{resumeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              saveStatus === "saving" && "opacity-60",
              saveStatus === "unsaved" && "text-destructive",
            )}
          >
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
            <Palette className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">{tpl.name}</span>
            <span className="ml-1.5 inline-block w-2 h-2 rounded-full" style={{ backgroundColor: tpl.accent }} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/resumes/${id}/preview`)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />Preview
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />PDF
          </Button>
          <Button size="sm" onClick={() => save(data)}>Save</Button>
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-40 shrink-0 flex-col border-r bg-muted/20">
          {SECTIONS.map(({ id: sId, label, icon: Icon }) => (
            <button
              key={sId}
              onClick={() => setActiveSection(sId)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 text-sm transition-colors text-left",
                activeSection === sId
                  ? "bg-background font-medium border-r-2 border-r-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {activeSection === "basics" && (
              <BasicsForm data={{ ...EMPTY_BASICS, ...data.basics }} onChange={(basics) => handleChange({ ...data, basics })} />
            )}
            {activeSection === "work" && (
              <WorkForm entries={data.work ?? []} onChange={(work) => handleChange({ ...data, work })} />
            )}
            {activeSection === "education" && (
              <EducationForm entries={data.education ?? []} onChange={(education) => handleChange({ ...data, education })} />
            )}
            {activeSection === "skills" && (
              <SkillsForm entries={data.skills ?? []} onChange={(skills) => handleChange({ ...data, skills })} />
            )}
            {activeSection === "projects" && (
              <ProjectsForm entries={data.projects ?? []} onChange={(projects) => handleChange({ ...data, projects })} />
            )}
          </div>
        </div>

        <Separator orientation="vertical" />

        <div className="w-80 shrink-0 overflow-y-auto border-l bg-muted/10">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Preview</p>
            <span className="text-[10px] text-muted-foreground">{tpl.name}</span>
          </div>
          <div className="p-3 flex justify-center">
            <div style={{ width: 278, height: 393, overflow: "hidden", borderRadius: 6, border: "1px solid hsl(var(--border))", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ width: 794, height: 1123, transform: "scale(0.35)", transformOrigin: "top left" }}>
                <tpl.component data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TemplatePicker
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        currentId={templateId}
        onSelect={handleTemplateChange}
      />
    </div>
  );
}
