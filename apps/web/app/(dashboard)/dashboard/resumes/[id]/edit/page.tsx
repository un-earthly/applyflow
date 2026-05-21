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
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section =
  | "basics"
  | "work"
  | "education"
  | "skills"
  | "projects";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "basics", label: "Basics", icon: User },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
];

interface Basics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: string;
}

interface WorkEntry {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
}

interface EducationEntry {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score: string;
}

interface SkillEntry {
  name: string;
  level: string;
  keywords: string;
}

interface ProjectEntry {
  name: string;
  description: string;
  url: string;
  highlights: string;
  startDate: string;
  endDate: string;
}

interface JsonData {
  basics: Basics;
  work: WorkEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}

const EMPTY_BASICS: Basics = {
  name: "", label: "", email: "", phone: "", url: "", summary: "", location: "",
};
const EMPTY_WORK: WorkEntry = {
  name: "", position: "", url: "", startDate: "", endDate: "", summary: "",
};
const EMPTY_EDUCATION: EducationEntry = {
  institution: "", area: "", studyType: "", startDate: "", endDate: "", score: "",
};
const EMPTY_SKILL: SkillEntry = { name: "", level: "", keywords: "" };
const EMPTY_PROJECT: ProjectEntry = {
  name: "", description: "", url: "", highlights: "", startDate: "", endDate: "",
};

function BasicsForm({
  data,
  onChange,
}: {
  data: Basics;
  onChange: (d: Basics) => void;
}): React.ReactElement {
  const set = (key: keyof Basics) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input value={data.name} onChange={set("name")} placeholder="Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label>Title / label</Label>
          <Input value={data.label} onChange={set("label")} placeholder="Senior Software Engineer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={data.email} onChange={set("email")} placeholder="jane@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={data.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input type="url" value={data.url} onChange={set("url")} placeholder="https://janesmith.dev" />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={data.location} onChange={set("location")} placeholder="San Francisco, CA" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Summary</Label>
        <Textarea
          value={data.summary}
          onChange={set("summary")}
          placeholder="2–3 sentence professional summary…"
          rows={4}
        />
      </div>
    </div>
  );
}

function WorkForm({
  entries,
  onChange,
}: {
  entries: WorkEntry[];
  onChange: (e: WorkEntry[]) => void;
}): React.ReactElement {
  const update = (i: number, key: keyof WorkEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = entries.map((entry, idx) =>
      idx === i ? { ...entry, [key]: e.target.value } : entry,
    );
    onChange(next);
  };
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{entry.name || `Position ${i + 1}`}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={entry.name} onChange={update(i, "name")} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input value={entry.position} onChange={update(i, "position")} placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input value={entry.startDate} onChange={update(i, "startDate")} placeholder="2022-01" />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input value={entry.endDate} onChange={update(i, "endDate")} placeholder="Present" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input type="url" value={entry.url} onChange={update(i, "url")} placeholder="https://acme.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Summary / highlights</Label>
            <Textarea value={entry.summary} onChange={update(i, "summary")} placeholder="Key achievements and responsibilities…" rows={3} />
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_WORK }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add position
      </Button>
    </div>
  );
}

function EducationForm({
  entries,
  onChange,
}: {
  entries: EducationEntry[];
  onChange: (e: EducationEntry[]) => void;
}): React.ReactElement {
  const update = (i: number, key: keyof EducationEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  };
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{entry.institution || `School ${i + 1}`}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Input value={entry.institution} onChange={update(i, "institution")} placeholder="MIT" />
            </div>
            <div className="space-y-1.5">
              <Label>Degree type</Label>
              <Input value={entry.studyType} onChange={update(i, "studyType")} placeholder="Bachelor" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Field of study</Label>
              <Input value={entry.area} onChange={update(i, "area")} placeholder="Computer Science" />
            </div>
            <div className="space-y-1.5">
              <Label>GPA / Score</Label>
              <Input value={entry.score} onChange={update(i, "score")} placeholder="3.9 / 4.0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input value={entry.startDate} onChange={update(i, "startDate")} placeholder="2018-09" />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input value={entry.endDate} onChange={update(i, "endDate")} placeholder="2022-05" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_EDUCATION }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add education
      </Button>
    </div>
  );
}

function SkillsForm({
  entries,
  onChange,
}: {
  entries: SkillEntry[];
  onChange: (e: SkillEntry[]) => void;
}): React.ReactElement {
  const update = (i: number, key: keyof SkillEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  };
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input value={entry.name} onChange={update(i, "name")} placeholder="Category (e.g. Languages)" />
              <Input value={entry.level} onChange={update(i, "level")} placeholder="Level (e.g. Expert)" />
            </div>
            <Input value={entry.keywords} onChange={update(i, "keywords")} placeholder="Keywords, comma-separated (e.g. TypeScript, Python)" />
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} className="mt-0.5">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_SKILL }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add skill group
      </Button>
    </div>
  );
}

function ProjectsForm({
  entries,
  onChange,
}: {
  entries: ProjectEntry[];
  onChange: (e: ProjectEntry[]) => void;
}): React.ReactElement {
  const update = (i: number, key: keyof ProjectEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(entries.map((entry, idx) => idx === i ? { ...entry, [key]: e.target.value } : entry));
  };
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      {entries.map((entry, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{entry.name || `Project ${i + 1}`}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={entry.name} onChange={update(i, "name")} placeholder="My Project" />
            </div>
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input type="url" value={entry.url} onChange={update(i, "url")} placeholder="https://github.com/…" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input value={entry.startDate} onChange={update(i, "startDate")} placeholder="2023-01" />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input value={entry.endDate} onChange={update(i, "endDate")} placeholder="Present" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={entry.description} onChange={update(i, "description")} placeholder="What you built and why…" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Highlights</Label>
            <Textarea value={entry.highlights} onChange={update(i, "highlights")} placeholder="Key achievements, one per line…" rows={2} />
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange([...entries, { ...EMPTY_PROJECT }])}>
        <Plus className="mr-2 h-4 w-4" />
        Add project
      </Button>
    </div>
  );
}

function ResumePreview({ data }: { data: JsonData }): React.ReactElement {
  const b = data.basics;
  return (
    <div className="space-y-5 text-sm">
      {b.name && (
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold">{b.name}</h2>
          {b.label && <p className="text-muted-foreground">{b.label}</p>}
          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            {b.email && <span>{b.email}</span>}
            {b.phone && <span>{b.phone}</span>}
            {b.location && <span>{b.location}</span>}
            {b.url && <span>{b.url}</span>}
          </div>
        </div>
      )}
      {b.summary && (
        <div>
          <h3 className="mb-1 font-semibold uppercase tracking-wide text-xs text-muted-foreground">Summary</h3>
          <p>{b.summary}</p>
        </div>
      )}
      {data.work.length > 0 && data.work.some((w) => w.name) && (
        <div>
          <h3 className="mb-2 font-semibold uppercase tracking-wide text-xs text-muted-foreground">Experience</h3>
          <div className="space-y-3">
            {data.work.filter((w) => w.name).map((w, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{w.position}</span>
                  <span className="text-muted-foreground text-xs">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                </div>
                <p className="text-muted-foreground text-xs">{w.name}</p>
                {w.summary && <p className="mt-1">{w.summary}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {data.education.length > 0 && data.education.some((e) => e.institution) && (
        <div>
          <h3 className="mb-2 font-semibold uppercase tracking-wide text-xs text-muted-foreground">Education</h3>
          <div className="space-y-2">
            {data.education.filter((e) => e.institution).map((e, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{e.institution}</span>
                  <span className="text-muted-foreground text-xs">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>
                </div>
                <p className="text-muted-foreground text-xs">{[e.studyType, e.area].filter(Boolean).join(", ")}{e.score ? ` · ${e.score}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.skills.length > 0 && data.skills.some((s) => s.name) && (
        <div>
          <h3 className="mb-2 font-semibold uppercase tracking-wide text-xs text-muted-foreground">Skills</h3>
          <div className="space-y-1">
            {data.skills.filter((s) => s.name).map((s, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-medium shrink-0">{s.name}:</span>
                <span className="text-muted-foreground">{s.keywords}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.projects.length > 0 && data.projects.some((p) => p.name) && (
        <div>
          <h3 className="mb-2 font-semibold uppercase tracking-wide text-xs text-muted-foreground">Projects</h3>
          <div className="space-y-3">
            {data.projects.filter((p) => p.name).map((p, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-muted-foreground text-xs">{[p.startDate, p.endDate].filter(Boolean).join(" – ")}</span>
                </div>
                {p.description && <p className="mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeEditPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [resumeName, setResumeName] = useState("");
  const [data, setData] = useState<JsonData | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("basics");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    return onSnapshot(doc(db, "users", user.uid, "resumes", id), (snap) => {
      if (!snap.exists()) { router.replace("/dashboard/resumes"); return; }
      const d = snap.data();
      setResumeName(d.name as string);
      setData(d.jsonData as JsonData);
    });
  }, [id, user, router]);

  const save = useCallback(
    async (nextData: JsonData) => {
      if (!id) return;
      setSaveStatus("saving");
      try {
        await updateDoc(doc(db, "users", user!.uid, "resumes", id), {
          jsonData: nextData,
          updatedAt: serverTimestamp(),
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    },
    [id],
  );

  const handleChange = (nextData: JsonData) => {
    setData(nextData);
    setSaveStatus("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void save(nextData); }, 1500);
  };

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/dashboard/resume")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">{resumeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              saveStatus === "saving" && "opacity-60",
              saveStatus === "unsaved" && "text-destructive",
            )}
          >
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/resume/${id}/preview`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={() => save(data)}>
            Save
          </Button>
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: section nav */}
        <aside className="flex w-44 shrink-0 flex-col border-r">
          {SECTIONS.map(({ id: sId, label, icon: Icon }) => (
            <button
              key={sId}
              onClick={() => setActiveSection(sId)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 text-sm transition-colors",
                activeSection === sId
                  ? "bg-muted font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* Center: form */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "basics" && (
            <BasicsForm
              data={{ ...EMPTY_BASICS, ...data.basics }}
              onChange={(basics) => handleChange({ ...data, basics })}
            />
          )}
          {activeSection === "work" && (
            <WorkForm
              entries={data.work ?? []}
              onChange={(work) => handleChange({ ...data, work })}
            />
          )}
          {activeSection === "education" && (
            <EducationForm
              entries={data.education ?? []}
              onChange={(education) => handleChange({ ...data, education })}
            />
          )}
          {activeSection === "skills" && (
            <SkillsForm
              entries={data.skills ?? []}
              onChange={(skills) => handleChange({ ...data, skills })}
            />
          )}
          {activeSection === "projects" && (
            <ProjectsForm
              entries={data.projects ?? []}
              onChange={(projects) => handleChange({ ...data, projects })}
            />
          )}
        </div>

        <Separator orientation="vertical" />

        {/* Right: preview */}
        <div className="w-80 shrink-0 overflow-y-auto p-6">
          <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wide">
            Preview
          </p>
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  );
}
