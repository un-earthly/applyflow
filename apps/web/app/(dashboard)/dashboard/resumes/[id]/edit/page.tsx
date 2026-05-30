"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  User, Briefcase, GraduationCap, Code2, FolderGit2,
  ArrowLeft, Plus, Trash2, Eye, Download, Palette, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RESUME_TEMPLATES, getTemplate } from "@/lib/resume-templates";
import { TemplatePreview } from "@/components/resume/template-preview";

type Section = "basics" | "work" | "education" | "skills" | "projects";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "basics",    label: "Basics",    icon: User },
  { id: "work",      label: "Work",      icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills",    label: "Skills",    icon: Code2 },
  { id: "projects",  label: "Projects",  icon: FolderGit2 },
];

interface Basics { name: string; label: string; email: string; phone: string; url: string; summary: string; location: string; }
interface WorkEntry { name: string; position: string; url: string; startDate: string; endDate: string; summary: string; }
interface EducationEntry { institution: string; area: string; studyType: string; startDate: string; endDate: string; score: string; }
interface SkillEntry { name: string; level: string; keywords: string; }
interface ProjectEntry { name: string; description: string; url: string; highlights: string; startDate: string; endDate: string; }

interface JsonData {
  basics: Basics;
  work: WorkEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}

const EMPTY_BASICS: Basics = { name: "", label: "", email: "", phone: "", url: "", summary: "", location: "" };
const EMPTY_WORK: WorkEntry = { name: "", position: "", url: "", startDate: "", endDate: "", summary: "" };
const EMPTY_EDUCATION: EducationEntry = { institution: "", area: "", studyType: "", startDate: "", endDate: "", score: "" };
const EMPTY_SKILL: SkillEntry = { name: "", level: "", keywords: "" };
const EMPTY_PROJECT: ProjectEntry = { name: "", description: "", url: "", highlights: "", startDate: "", endDate: "" };

// ── Section form components ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function BasicsForm({ data, onChange }: { data: Basics; onChange: (d: Basics) => void }) {
  const set = (key: keyof Basics) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [key]: e.target.value });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full name"><Input value={data.name} onChange={set("name")} placeholder="Jane Smith" /></Field>
        <Field label="Title / label"><Input value={data.label} onChange={set("label")} placeholder="Senior Software Engineer" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email"><Input type="email" value={data.email} onChange={set("email")} placeholder="jane@example.com" /></Field>
        <Field label="Phone"><Input value={data.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Website"><Input type="url" value={data.url} onChange={set("url")} placeholder="https://janesmith.dev" /></Field>
        <Field label="Location"><Input value={data.location} onChange={set("location")} placeholder="San Francisco, CA" /></Field>
      </div>
      <Field label="Summary">
        <Textarea value={data.summary} onChange={set("summary")} placeholder="2–3 sentence professional summary…" rows={4} />
      </Field>
    </div>
  );
}

function WorkForm({ entries, onChange }: { entries: WorkEntry[]; onChange: (e: WorkEntry[]) => void }) {
  const update = (i: number, key: keyof WorkEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{entry.name || `Position ${i + 1}`}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onChange(entries.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company"><Input value={entry.name} onChange={update(i, "name")} placeholder="Acme Corp" /></Field>
            <Field label="Position"><Input value={entry.position} onChange={update(i, "position")} placeholder="Software Engineer" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input value={entry.startDate} onChange={update(i, "startDate")} placeholder="2022-01" /></Field>
            <Field label="End date"><Input value={entry.endDate} onChange={update(i, "endDate")} placeholder="Present" /></Field>
          </div>
          <Field label="Website"><Input type="url" value={entry.url} onChange={update(i, "url")} placeholder="https://acme.com" /></Field>
          <Field label="Summary / highlights">
            <Textarea value={entry.summary} onChange={update(i, "summary")} placeholder="Key achievements and responsibilities…" rows={3} />
          </Field>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_WORK }])}>
        <Plus className="mr-2 h-4 w-4" />Add position
      </Button>
    </div>
  );
}

function EducationForm({ entries, onChange }: { entries: EducationEntry[]; onChange: (e: EducationEntry[]) => void }) {
  const update = (i: number, key: keyof EducationEntry) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{entry.institution || `School ${i + 1}`}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onChange(entries.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Institution"><Input value={entry.institution} onChange={update(i, "institution")} placeholder="MIT" /></Field>
            <Field label="Degree type"><Input value={entry.studyType} onChange={update(i, "studyType")} placeholder="Bachelor" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Field of study"><Input value={entry.area} onChange={update(i, "area")} placeholder="Computer Science" /></Field>
            <Field label="GPA / Score"><Input value={entry.score} onChange={update(i, "score")} placeholder="3.9 / 4.0" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input value={entry.startDate} onChange={update(i, "startDate")} placeholder="2018-09" /></Field>
            <Field label="End date"><Input value={entry.endDate} onChange={update(i, "endDate")} placeholder="2022-05" /></Field>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_EDUCATION }])}>
        <Plus className="mr-2 h-4 w-4" />Add education
      </Button>
    </div>
  );
}

function SkillsForm({ entries, onChange }: { entries: SkillEntry[]; onChange: (e: SkillEntry[]) => void }) {
  const update = (i: number, key: keyof SkillEntry) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input value={entry.name} onChange={update(i, "name")} placeholder="Category (e.g. Languages)" />
              <Input value={entry.level} onChange={update(i, "level")} placeholder="Level (e.g. Expert)" />
            </div>
            <Input value={entry.keywords} onChange={update(i, "keywords")} placeholder="TypeScript, Python, React — comma-separated" />
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground mt-0.5" onClick={() => onChange(entries.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_SKILL }])}>
        <Plus className="mr-2 h-4 w-4" />Add skill group
      </Button>
    </div>
  );
}

function ProjectsForm({ entries, onChange }: { entries: ProjectEntry[]; onChange: (e: ProjectEntry[]) => void }) {
  const update = (i: number, key: keyof ProjectEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{entry.name || `Project ${i + 1}`}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onChange(entries.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><Input value={entry.name} onChange={update(i, "name")} placeholder="My Project" /></Field>
            <Field label="URL"><Input type="url" value={entry.url} onChange={update(i, "url")} placeholder="https://github.com/…" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input value={entry.startDate} onChange={update(i, "startDate")} placeholder="2023-01" /></Field>
            <Field label="End date"><Input value={entry.endDate} onChange={update(i, "endDate")} placeholder="Present" /></Field>
          </div>
          <Field label="Description">
            <Textarea value={entry.description} onChange={update(i, "description")} placeholder="What you built and why…" rows={2} />
          </Field>
          <Field label="Highlights (one per line)">
            <Textarea value={entry.highlights} onChange={update(i, "highlights")} placeholder="• Reduced load time by 60%&#10;• Used by 10k+ people" rows={3} />
          </Field>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_PROJECT }])}>
        <Plus className="mr-2 h-4 w-4" />Add project
      </Button>
    </div>
  );
}

// ── Template picker dialog ────────────────────────────────────────────────────

function TemplatePicker({
  open, onOpenChange, currentId, onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentId: string;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 max-h-130 overflow-y-auto pr-1">
          {RESUME_TEMPLATES.map((tpl) => {
            const active = tpl.id === currentId;
            return (
              <button
                key={tpl.id}
                onClick={() => { onSelect(tpl.id); onOpenChange(false); }}
                onMouseEnter={() => setHovered(tpl.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all",
                  active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
                )}
              >
                <div className="relative overflow-hidden rounded" style={{ width: 168, height: 238 }}>
                  <div className="bg-muted/30 w-full h-full absolute inset-0" />
                  <TemplatePreview template={tpl} scale={0.212} />
                  {active && (
                    <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="text-xs font-semibold">{tpl.name}</div>
                  <div className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">{tpl.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main edit page ─────────────────────────────────────────────────────────────

export default function ResumeEditPage() {
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
      // Support both old (flat fields) and new (jsonData) format
      if (d.jsonData) {
        setData(d.jsonData as JsonData);
      } else {
        setData({
          basics: (d.basics as Basics) ?? EMPTY_BASICS,
          work: (d.work as WorkEntry[]) ?? [],
          education: (d.education as EducationEntry[]) ?? [],
          skills: (d.skills as SkillEntry[]) ?? [],
          projects: (d.projects as ProjectEntry[]) ?? [],
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

          {/* Template switcher */}
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
        {/* Left: section nav */}
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

        {/* Center: form */}
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

        {/* Right: live preview */}
        <div className="w-80 shrink-0 overflow-y-auto border-l bg-muted/10">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Preview</p>
            <span className="text-[10px] text-muted-foreground">{tpl.name}</span>
          </div>
          <div className="p-3 flex justify-center">
            {/* Scale the full template into the 288px preview pane */}
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
