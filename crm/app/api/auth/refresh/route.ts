import { NextResponse } from "next/server";
import { AuthService, AuthError } from "@/services/auth.service";
import { extractClientIp } from "@/shared/lib/auth/utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "No refresh token provided" }
      }, { status: 401 });
    }

    const ip = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const data = await AuthService.refreshSession(refreshToken, { ip, userAgent });

    const commonCookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      path: string;
    } = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    // Access token (15 mins)
    cookieStore.set("auth_token", data.token, { 
      ...commonCookieOptions, 
      maxAge: 15 * 60 
    });

    // Refresh token
    const refreshOptions = { ...commonCookieOptions, maxAge: undefined as number | undefined };
    if (data.isExtendedSession) {
      refreshOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
    }
    cookieStore.set("refresh_token", data.refreshToken, refreshOptions);

    return NextResponse.json({
      success: true,
      data: { user: data.user },
      message: "Session refreshed successfully"
    }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: error.message }
      }, { status: error.statusCode });
    }
    
    console.error("[REFRESH ERROR]", error);
    
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" }
    }, { status: 500 });
  }
}
