import { z } from "zod";

<<<<<<< HEAD
export const tierEnum = z.enum(["free", "pro", "teams"]);
export type Tier = z.infer<typeof tierEnum>;

export const subscriptionStatusEnum = z.enum([
  "active", "cancelled", "past_due", "trialing", "paused",
]);

export const subscriptionSchema = z.object({
  userId: z.string(),
  tier: tierEnum,
  status: subscriptionStatusEnum,
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodEnd: z.any().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export const PLAN_LIMITS: Record<Tier, { autofills: number; resumes: number; tailors: number }> = {
  free: { autofills: 10, resumes: 3, tailors: 3 },
  pro: { autofills: 200, resumes: 50, tailors: 50 },
  teams: { autofills: 1000, resumes: 200, tailors: 200 },
};
=======
export const tierEnum = z.enum(["free", "pro", "team"]);

export const subscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tier: tierEnum,
  status: z.enum(["active", "trialing", "past_due", "canceled", "incomplete"]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodStart: z.string().datetime().or(z.date()).optional(),
  currentPeriodEnd: z.string().datetime().or(z.date()).optional(),
  cancelAtPeriodEnd: z.boolean().default(false),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
});

export const usageQuotaSchema = z.object({
  userId: z.string(),
  month: z.string(), // YYYY-MM
  autofillsUsed: z.number().min(0).default(0),
  autofillsCap: z.number().min(0).default(50),
  resumesUsed: z.number().min(0).default(0),
  resumesCap: z.number().min(0).default(3),
  aiTokensUsed: z.number().min(0).default(0),
  aiTokensCap: z.number().min(0).default(100000),
  tailoredVersionsUsed: z.number().min(0).default(0),
  tailoredVersionsCap: z.number().min(0).default(0),
});

export type Tier = z.infer<typeof tierEnum>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type UsageQuota = z.infer<typeof usageQuotaSchema>;
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
