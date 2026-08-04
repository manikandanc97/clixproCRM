import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    const dashboardData = await CrmService.getDashboardData(session.tenantId, "USD", timeframe);
    return NextResponse.json({ success: true, data: dashboardData }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
