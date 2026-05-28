import { z } from "zod";

export const coverLetterSchema = z.object({
  userId: z.string(),
  resumeId: z.string().optional(),
  applicationId: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
  tone: z.enum(["professional", "friendly", "concise", "enthusiastic"]).default("professional"),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export type CoverLetter = z.infer<typeof coverLetterSchema>;
