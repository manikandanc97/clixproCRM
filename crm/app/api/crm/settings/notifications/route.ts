import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    const data = await CrmService.getNotificationSettings(session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
