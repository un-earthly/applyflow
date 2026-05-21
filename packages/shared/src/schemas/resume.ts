import { z } from "zod";

export const workExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  highlights: z.array(z.string()).optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
});

export const languageSchema = z.object({
  language: z.string().min(1),
  fluency: z.enum(["basic", "conversational", "fluent", "native"]).optional(),
});

export const jsonResumeSchema = z.object({
  basics: z.object({
    name: z.string().min(1),
    label: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    url: z.string().url().optional().or(z.literal("")),
    summary: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    profiles: z.array(z.object({
      network: z.string(),
      url: z.string().url(),
      username: z.string().optional(),
    })).optional(),
  }),
  work: z.array(workExperienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  languages: z.array(languageSchema).optional(),
  awards: z.array(z.object({
    title: z.string(),
    date: z.string().optional(),
    awarder: z.string().optional(),
    summary: z.string().optional(),
  })).optional(),
  references: z.array(z.object({
    name: z.string(),
    reference: z.string(),
  })).optional(),
});

export const resumeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, "Resume name is required"),
  jsonData: jsonResumeSchema,
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

export const createResumeSchema = resumeSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateResumeSchema = createResumeSchema.partial();

export type JsonResume = z.infer<typeof jsonResumeSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
