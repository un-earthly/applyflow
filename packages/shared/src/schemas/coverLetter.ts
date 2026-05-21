import { z } from "zod";

export const coverLetterSchema = z.object({
  id: z.string(),
  userId: z.string(),
  resumeId: z.string(),
  companyName: z.string().min(1),
  roleTitle: z.string().min(1),
  content: z.string().min(1),
  tone: z.enum(["professional", "enthusiastic", "concise", "formal", "casual"]).default("professional"),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

export const generateCoverLetterSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(10, "Job description is too short"),
  tone: z.enum(["professional", "enthusiastic", "concise", "formal", "casual"]).optional(),
});

export type CoverLetter = z.infer<typeof coverLetterSchema>;
export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>;
