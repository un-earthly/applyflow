import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  headline: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  linkedin: z.string().url().or(z.literal("")).optional(),
  bio: z.string().max(2000).optional(),
  workAuthStatus: z.enum(["citizen", "pr", "work_visa", "need_sponsorship"]).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
});

export const preferencesSchema = z.object({
  titles: z.array(z.string().max(100)).min(1, "Add at least one job title"),
  locations: z.array(z.string().max(100)).default([]),
  openToRemote: z.boolean().default(false),
  salaryCurrency: z.string().default("USD"),
  salaryMin: z.number().min(0).default(0),
  salaryMax: z.number().min(0).default(200000),
  employmentTypes: z.array(z.enum(["full-time", "contract", "part-time", "internship", "freelance"])).default([]),
  industries: z.array(z.string().max(100)).default([]),
  excludeCompanies: z.array(z.string().max(200)).default([]),
  excludeKeywords: z.array(z.string().max(100)).default([]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
