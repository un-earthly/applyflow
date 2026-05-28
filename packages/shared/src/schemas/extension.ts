import { z } from "zod";

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
