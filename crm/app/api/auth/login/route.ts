import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
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
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 1 day
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: { user: data.user },
      message: "Login successful"
    }, { status: 200 });
  } catch (error: unknown) {
    if (error.message === "Invalid credentials" || error.message.includes("locked")) {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: error.message }
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" }
    }, { status: 500 });
  }
}
