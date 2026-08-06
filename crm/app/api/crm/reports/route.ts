import { NextResponse } from "next/server";
import { ReportsService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const { searchParams } = new URL(request.url);
    
    const filters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      assignedToId: searchParams.get("assignedToId") || undefined,
      teamId: searchParams.get("teamId") || undefined,
      pipeline: searchParams.get("pipeline") || undefined,
    };
    
    const data = await ReportsService.getReports(session.tenantId, filters);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
