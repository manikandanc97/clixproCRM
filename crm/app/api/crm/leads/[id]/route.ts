import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { leadSchema } from "@/shared/validations";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = leadSchema.partial().parse(rawBody);
    
    const lead = await CrmService.updateLead(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: lead }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;
    
    await CrmService.deleteLead(session.tenantId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}
