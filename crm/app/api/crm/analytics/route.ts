import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: CrmService.getAnalytics
    };
    const data = await serviceMap.method(session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}


