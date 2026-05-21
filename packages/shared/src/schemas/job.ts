import { z } from "zod";

export const savedJobSchema = z.object({
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
});

export type SavedJob = z.infer<typeof savedJobSchema>;
export type JobMatch = z.infer<typeof jobMatchSchema>;
