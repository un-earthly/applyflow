import { z } from "zod";

export const applicationStatusEnum = z.enum([
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
]);

<<<<<<< HEAD
export const sourceEnum = z.enum([
=======
export const applicationSourceEnum = z.enum([
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
  "linkedin",
  "indeed",
  "greenhouse",
  "lever",
  "workday",
  "ashby",
  "direct",
<<<<<<< HEAD
  "referral",
  "other",
]);

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  roleTitle: z.string().min(1, "Role title is required").max(200),
  jobUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  source: sourceEnum.default("direct"),
  status: applicationStatusEnum.default("applied"),
  location: z.string().max(200).optional(),
  salaryRange: z.string().max(100).optional(),
  notes: z.string().max(10000).optional(),
  appliedAt: z.string().datetime().optional(),
});

export const applicationUpdateSchema = applicationSchema.partial();

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
=======
]);

export const remoteTypeEnum = z.enum(["onsite", "hybrid", "remote"]);

export const applicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  resumeId: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  jobUrl: z.string().url().optional().or(z.literal("")),
  source: applicationSourceEnum,
  status: applicationStatusEnum,
  appliedAt: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
  salaryRange: z.string().optional(),
  location: z.string().optional(),
  remoteType: remoteTypeEnum.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createApplicationSchema = applicationSchema.omit({
  id: true,
  userId: true,
  appliedAt: true,
}).extend({
  appliedAt: z.string().datetime().or(z.date()).optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;
export type ApplicationSource = z.infer<typeof applicationSourceEnum>;
export type RemoteType = z.infer<typeof remoteTypeEnum>;
export type Application = z.infer<typeof applicationSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
