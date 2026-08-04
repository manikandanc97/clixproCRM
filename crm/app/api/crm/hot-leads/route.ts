import { NextResponse } from "next/server";
import { LeadService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: LeadService.getHotLeads
    };
    const leads = await serviceMap.method(session.tenantId);
    return NextResponse.json({ success: true, data: { leads } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
