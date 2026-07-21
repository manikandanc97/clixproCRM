import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Using PascalCase for method name mapping
    const moduleName = "reports";
    const methodName = "get" + moduleName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    
    const data = await (CrmService as any)[methodName](session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
