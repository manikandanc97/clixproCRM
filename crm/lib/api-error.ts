import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  logger.error(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Validation Error", 
        errors: error.issues 
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof SyntaxError && "body" in (error as unknown as Record<string, unknown>) === false) {
    // Basic check for JSON parse errors from req.json()
    return NextResponse.json(
      { success: false, message: "Malformed JSON payload" },
      { status: 400 }
    );
  }

  // Handle generic errors securely
  return NextResponse.json(
    { success: false, message: "Internal Server Error" },
    { status: 500 }
  );
}
