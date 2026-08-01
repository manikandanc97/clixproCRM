import { NextResponse } from "next/server";
import { AuthService, AuthError } from "@/services/auth.service";
import { LoginSchema } from "@/shared/validators/auth.validator";
import { extractClientIp } from "@/shared/lib/auth/utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid input data",
          details: result.error.issues
        }
      }, { status: 400 });
    }

    const ip = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const data = await AuthService.login(result.data, { ip, userAgent });

    const cookieStore = await cookies();
    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      path: string;
      maxAge?: number;
    } = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    if (result.data.staySignedIn) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
    }

    cookieStore.set("auth_token", data.token, cookieOptions);

    return NextResponse.json({
      success: true,
      data: { user: data.user },
      message: "Login successful"
    }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: error.message }
      }, { status: error.statusCode });
    }
    // Provide more specific error messages for database connection issues
    if (error instanceof Error && error.name.includes('Prisma')) {
      return NextResponse.json({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Database connection failed. Please check your connection and try again." }
      }, { status: 503 });
    }
    
    console.error("[LOGIN ERROR]", error);
    
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
