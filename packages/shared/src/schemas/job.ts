import { z } from "zod";

export const savedJobSchema = z.object({
<<<<<<< HEAD
  userId: z.string(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  url: z.string().url().optional(),
  source: z.string().default("manual"),
  description: z.string().optional(),
  salary: z.string().optional(),
  postedAt: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  matchedSkills: z.array(z.string()).optional(),
  missingSkills: z.array(z.string()).optional(),
  savedAt: z.any(),
});

export const jobMatchSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(1),
  score: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  summary: z.string().optional(),
=======
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
});

export type SavedJob = z.infer<typeof savedJobSchema>;
export type JobMatch = z.infer<typeof jobMatchSchema>;
