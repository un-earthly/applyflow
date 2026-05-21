import { z } from "zod";

// JSON Resume v1 schema (subset + extensions)
export const jsonResumeSchema = z.object({
  basics: z.object({
    name: z.string().max(100).optional(),
    label: z.string().max(200).optional(),
    email: z.string().email().or(z.literal("")).optional(),
    phone: z.string().max(30).optional(),
    url: z.string().url().or(z.literal("")).optional(),
    summary: z.string().max(5000).optional(),
    location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      countryCode: z.string().optional(),
      region: z.string().optional(),
    }).optional(),
    profiles: z.array(z.object({
      network: z.string(),
      username: z.string(),
      url: z.string().url().or(z.literal("")).optional(),
    })).default([]),
  }).default({}),

  work: z.array(z.object({
    name: z.string().max(200),
    position: z.string().max(200),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    summary: z.string().max(5000).optional(),
    highlights: z.array(z.string().max(500)).default([]),
    url: z.string().url().or(z.literal("")).optional(),
  })).default([]),

  education: z.array(z.object({
    institution: z.string().max(200),
    area: z.string().max(200).optional(),
    studyType: z.string().max(100).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().max(20).optional(),
    courses: z.array(z.string()).default([]),
  })).default([]),

  skills: z.array(z.object({
    name: z.string().max(100),
    level: z.string().max(50).optional(),
    keywords: z.array(z.string().max(50)).default([]),
  })).default([]),

  projects: z.array(z.object({
    name: z.string().max(200),
    description: z.string().max(2000).optional(),
    highlights: z.array(z.string().max(500)).default([]),
    keywords: z.array(z.string().max(50)).default([]),
    url: z.string().url().or(z.literal("")).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).default([]),

  certifications: z.array(z.object({
    name: z.string().max(200),
    date: z.string().optional(),
    issuer: z.string().max(200).optional(),
    url: z.string().url().or(z.literal("")).optional(),
  })).default([]),

  languages: z.array(z.object({
    language: z.string().max(100),
    fluency: z.string().max(50).optional(),
  })).default([]),

  awards: z.array(z.object({
    title: z.string().max(200),
    date: z.string().optional(),
    awarder: z.string().max(200).optional(),
    summary: z.string().max(1000).optional(),
  })).default([]),
});

export const resumeCreateSchema = z.object({
  name: z.string().min(1).max(200),
  content: jsonResumeSchema.optional(),
});

export type JsonResume = z.infer<typeof jsonResumeSchema>;
export type ResumeCreateInput = z.infer<typeof resumeCreateSchema>;
