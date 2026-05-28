import { z } from "zod";

export const profileSchema = z.object({
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
