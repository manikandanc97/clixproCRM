import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { leadSchema } from "@/shared/validations";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const leads = await CrmService.getLeads(session.tenantId);
    return NextResponse.json({ success: true, data: leads }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const rawBody = await req.json();
    const body = leadSchema.parse(rawBody);
    const lead = await CrmService.createLead(session.tenantId, body);
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error: any) { return handleApiError(error); }
}
