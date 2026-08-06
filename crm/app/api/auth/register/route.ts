import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { RegisterSchema } from "@/shared/validators/auth.validator";
import { extractClientIp } from "@/shared/lib/auth/utils";
import { checkRateLimit, incrementRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid input data",
          details: result.error.issues.map(issue => ({
            path: issue.path,
            message: issue.message
          }))
        }
      }, { status: 400 });
    }

    const ip = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const identifier = `register_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.REGISTER);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json({
        success: false,
        error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." }
      }, { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } });
    }

    await incrementRateLimit(identifier, RATE_LIMITS.REGISTER);

    const data = await AuthService.register(result.data, { ip, userAgent });

    return NextResponse.json({
      success: true,
      data,
      message: "Registration successful"
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Email already in use") {
      return NextResponse.json({
        success: false,
        error: { code: "CONFLICT", message: error.message }
      }, { status: 409 });
    }
    // Provide more specific error messages for database connection issues
    if (error instanceof Error && error.name.includes('Prisma')) {
      return NextResponse.json({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Database connection failed. Please check your connection and try again." }
      }, { status: 503 });
    }
    
    console.error("[REGISTER ERROR]", error);
    
    // In development mode, return the actual error message to help with debugging
    const message = process.env.NODE_ENV === "development" && error instanceof Error 
      ? error.message 
      : "An unexpected error occurred";

    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message }
    }, { status: 500 });
  }
}
