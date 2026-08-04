import { NextResponse } from "next/server";
import { ReportsService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: ReportsService.getReports
    };
    const data = await serviceMap.method(session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}


