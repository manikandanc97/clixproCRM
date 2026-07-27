import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: CrmService.getHotLeads
    };
    const leads = await serviceMap.method(session.tenantId);
    return NextResponse.json({ success: true, leads }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}
