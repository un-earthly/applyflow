export interface ResumeDoc {
  id: string;
  name: string;
  isDefault: boolean;
  templateId?: string;
  updatedAt: { seconds: number } | null;
}

export interface Basics { name: string; label: string; email: string; phone: string; url: string; summary: string; location: string; }
export interface WorkEntry { name: string; position: string; url: string; startDate: string; endDate: string; summary: string; }
export interface EducationEntry { institution: string; area: string; studyType: string; startDate: string; endDate: string; score: string; }
export interface SkillEntry { name: string; level: string; keywords: string; }
export interface ProjectEntry { name: string; description: string; url: string; highlights: string; startDate: string; endDate: string; }

export interface JsonData {
  basics: Basics;
  work: WorkEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}

export const EMPTY_BASICS: Basics = { name: "", label: "", email: "", phone: "", url: "", summary: "", location: "" };
export const EMPTY_WORK: WorkEntry = { name: "", position: "", url: "", startDate: "", endDate: "", summary: "" };
export const EMPTY_EDUCATION: EducationEntry = { institution: "", area: "", studyType: "", startDate: "", endDate: "", score: "" };
export const EMPTY_SKILL: SkillEntry = { name: "", level: "", keywords: "" };
export const EMPTY_PROJECT: ProjectEntry = { name: "", description: "", url: "", highlights: "", startDate: "", endDate: "" };
