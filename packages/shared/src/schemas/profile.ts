import { z } from "zod";

export const profileSchema = z.object({
<<<<<<< HEAD
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
=======
  id: z.string(),
  fullName: z.string().min(1, "Name is required"),
  headline: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  phone: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  workAuthStatus: z.enum(["citizen", "pr", "work_visa", "sponsorship"]).optional(),
  subscriptionTier: z.enum(["free", "pro", "team"]).default("free"),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()).optional(),
});

export const preferencesSchema = z.object({
  jobTitles: z.array(z.string().min(1)).min(1, "At least one job title is required"),
  locations: z.array(z.string().min(1)).min(1, "At least one location is required"),
  openToRemote: z.boolean().default(true),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().default("USD"),
  employmentTypes: z.array(z.enum(["full_time", "contract", "part_time", "internship"])),
  industries: z.array(z.string()).optional(),
  excludedCompanies: z.array(z.string()).optional(),
  excludedKeywords: z.array(z.string()).optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
