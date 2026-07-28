import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" }
    }, { status: 500 });
  }
}
