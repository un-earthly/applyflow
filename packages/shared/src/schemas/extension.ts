import { z } from "zod";

export const confidenceSchema = z.number().min(0).max(1);

export const fieldSchema = z.object({
  name: z.string().max(200),
  label: z.string().max(200).optional(),
  type: z.string().max(50).optional(),
  placeholder: z.string().max(500).optional(),
  required: z.boolean().optional(),
  selector: z.string().max(500).optional(),
});

export const mappingSchema = z.object({
  fieldName: z.string(),
  value: z.string(),
  confidence: confidenceSchema,
  source: z.enum(["profile", "resume", "previous_fill", "ai"]).default("profile"),
});

export const fieldMapRequestSchema = z.object({
  fields: z.array(fieldSchema),
  resumeId: z.string().optional(),
  url: z.string().url().optional(),
  boardName: z.string().max(100).optional(),
});

export const fieldMapResponseSchema = z.object({
  mappings: z.record(z.string()),
  confidence: z.number(),
});

export type FieldInput = z.infer<typeof fieldSchema>;
export type MappingInput = z.infer<typeof mappingSchema>;
export type FieldMapRequest = z.infer<typeof fieldMapRequestSchema>;
export type FieldMapResponse = z.infer<typeof fieldMapResponseSchema>;
