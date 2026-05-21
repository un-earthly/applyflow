import { z } from "zod";

export const savedJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string().min(1),
  roleTitle: z.string().min(1),
  jobUrl: z.string().url(),
  location: z.string().optional(),
  remoteType: z.enum(["onsite", "hybrid", "remote"]).optional(),
  salaryRange: z.string().optional(),
  description: z.string().optional(),
  source: z.enum(["linkedin", "indeed", "greenhouse", "lever", "workday", "ashby", "direct"]),
  matchScore: z.number().min(0).max(100).optional(),
  savedAt: z.string().datetime().or(z.date()),
  applied: z.boolean().default(false),
});

export const jobMatchSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
  overallScore: z.number().min(0).max(100),
});

export type SavedJob = z.infer<typeof savedJobSchema>;
export type JobMatch = z.infer<typeof jobMatchSchema>;
