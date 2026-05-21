import { z } from "zod";

<<<<<<< HEAD
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
=======
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
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
