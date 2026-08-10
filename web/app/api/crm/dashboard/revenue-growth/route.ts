import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "Year";

    const data = await AnalyticsService.getRevenueGrowthData(session.tenantId, filter);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
