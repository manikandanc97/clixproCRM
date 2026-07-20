import { NextResponse } from "next/server";
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

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  // Handle generic errors securely
  return NextResponse.json(
    { success: false, message: "Internal Server Error" },
    { status: 500 }
  );
}
