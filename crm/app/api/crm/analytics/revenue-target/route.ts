import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { CrmService } from "@/services/crm.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "USER"]);
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    
    const data = await CrmService.getRevenueTargetAnalytics(session.tenantId, filters);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
