import { z } from "zod";

export const applicationStatusEnum = z.enum([
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
]);

export const sourceEnum = z.enum([
  "linkedin",
  "indeed",
  "greenhouse",
  "lever",
  "workday",
  "ashby",
  "direct",
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
