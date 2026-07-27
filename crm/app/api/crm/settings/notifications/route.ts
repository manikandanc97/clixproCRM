import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    await requireRole(["ADMIN", "MANAGER"]);
    
    // Mark as Coming Soon
    return NextResponse.json(
      { success: false, message: "Coming Soon - This feature is currently under development" },
      { status: 501 }
    );
  } catch (error: any) { return handleApiError(error); }
}
