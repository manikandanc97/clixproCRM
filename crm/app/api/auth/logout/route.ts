import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (token) {
      await AuthService.logout(token);
      cookieStore.delete("auth_token");
    }

    return NextResponse.json({
      success: true,
      message: "Logout successful"
    }, { status: 200 });
  } catch (error: unknown) {
    // Provide more specific error messages for database connection issues
    if (error instanceof Error && error.name.includes('Prisma')) {
      return NextResponse.json({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Database connection failed. Please check your connection and try again." }
      }, { status: 503 });
    }
    
    console.error("[LOGOUT ERROR]", error);
    
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
