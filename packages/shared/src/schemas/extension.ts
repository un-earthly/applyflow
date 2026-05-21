import { z } from "zod";

<<<<<<< HEAD
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
=======
export const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum([
    "text",
    "email",
    "tel",
    "url",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "file",
    "date",
    "number",
  ]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  selector: z.string(), // CSS selector
});

export const mappingSchema = z.object({
  fieldId: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.enum(["resume", "inferred", "default", "user"]).default("resume"),
});

export const confidenceSchema = z.object({
  high: z.number().min(0).max(1).default(0.85),
  medium: z.number().min(0).max(1).default(0.6),
});

export const formSnapshotSchema = z.object({
  url: z.string().url(),
  board: z.string(),
  fields: z.array(fieldSchema),
  mappings: z.array(mappingSchema),
  submittedAt: z.string().datetime().or(z.date()).optional(),
});

export type Field = z.infer<typeof fieldSchema>;
export type Mapping = z.infer<typeof mappingSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type FormSnapshot = z.infer<typeof formSnapshotSchema>;
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
