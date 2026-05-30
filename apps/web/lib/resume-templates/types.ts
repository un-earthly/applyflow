export interface ResumeBasics {
  name?: string;
  label?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: string;
}

export interface WorkEntry {
  name?: string;      // company name
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
}

export interface EducationEntry {
  institution?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
}

export interface SkillEntry {
  name?: string;
  level?: string;
  keywords?: string; // comma-separated string
}

export interface ProjectEntry {
  name?: string;
  description?: string;
  url?: string;
  highlights?: string; // newline-separated
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  basics: ResumeBasics;
  work: WorkEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  accent: string;
  textAccent: string;
  component: React.ComponentType<{ data: ResumeData }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function dateRange(start?: string, end?: string): string {
  const s = start?.trim() ?? "";
  const e = end?.trim() ?? "";
  if (!s && !e) return "";
  if (!s) return e;
  if (!e || e.toLowerCase() === "present") return `${s} – Present`;
  return `${s} – ${e}`;
}

export function keywords(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

export function highlights(raw?: string): string[] {
  if (!raw) return [];
  return raw.split("\n").map((h) => h.trim()).filter(Boolean);
}

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
