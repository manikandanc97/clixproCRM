import { NextResponse } from "next/server";
import { AnalyticsService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || undefined;
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: AnalyticsService.getAnalytics
    };
    const data = await serviceMap.method(session.tenantId, filter);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
