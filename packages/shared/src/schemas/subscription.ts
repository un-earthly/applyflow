import { z } from "zod";

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
