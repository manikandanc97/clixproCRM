import { NextResponse } from "next/server";
import { CommonNotificationService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(_req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    await CommonNotificationService.markAllAsRead(session.tenantId, session.userId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
