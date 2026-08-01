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
  console.error("API Error encountered:", error);
  if (error instanceof Error) {
    console.error("Stack trace:", error.stack);
  }
  logger.error(error);

  if (error instanceof ZodError || (error instanceof Error && error.name === "ZodError")) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Validation Error", 
        errors: (error as ZodError).issues 
      },
      { status: 400 }
    );
  }

  if (error instanceof Error && error.name === "ApiError") {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: (error as ApiError).statusCode }
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
