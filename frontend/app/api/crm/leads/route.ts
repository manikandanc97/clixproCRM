import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const leads = await CrmService.getLeads(session.activeTenantId);
    return NextResponse.json({ success: true, data: leads }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
