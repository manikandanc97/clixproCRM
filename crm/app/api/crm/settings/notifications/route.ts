import { NextResponse } from "next/server";
import { NotificationService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    const data = await NotificationService.getNotificationSettings(session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "SUPPORT", "EMPLOYEE"]);
    const data = await req.json();
    const updated = await NotificationService.updateNotificationSettings(session.tenantId, data);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
