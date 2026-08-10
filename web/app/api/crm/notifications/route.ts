import { NextResponse } from "next/server";
import { CommonNotificationService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    const data = await CommonNotificationService.getNotifications(session.tenantId, session.userId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
