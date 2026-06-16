"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { Basics, WorkEntry, EducationEntry, SkillEntry, ProjectEntry } from "./types";
import { EMPTY_WORK, EMPTY_EDUCATION, EMPTY_SKILL, EMPTY_PROJECT } from "./types";

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

export function BasicsForm({ data, onChange }: { data: Basics; onChange: (d: Basics) => void }): React.ReactElement {
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

export function WorkForm({ entries, onChange }: { entries: WorkEntry[]; onChange: (e: WorkEntry[]) => void }): React.ReactElement {
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

export function EducationForm({ entries, onChange }: { entries: EducationEntry[]; onChange: (e: EducationEntry[]) => void }): React.ReactElement {
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

export function SkillsForm({ entries, onChange }: { entries: SkillEntry[]; onChange: (e: SkillEntry[]) => void }): React.ReactElement {
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

export function ProjectsForm({ entries, onChange }: { entries: ProjectEntry[]; onChange: (e: ProjectEntry[]) => void }): React.ReactElement {
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
