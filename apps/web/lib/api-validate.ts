import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

export function validationError(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        fields: error.flatten().fieldErrors,
      },
    },
    { status: 400 },
  );
}

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): { data: T } | { error: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) return { error: validationError(result.error) };
  return { data: result.data };
}
