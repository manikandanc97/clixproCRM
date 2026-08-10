import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "USER"]);
    
    return NextResponse.json({
      success: true,
      data: {
        activeSessions: [],
        loginHistory: [],
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
