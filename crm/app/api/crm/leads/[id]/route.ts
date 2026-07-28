import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import {  requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { leadSchema } from "@/shared/validations";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = leadSchema.partial().parse(rawBody);
    
    const lead = await CrmService.updateLead(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: lead }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    
    await CrmService.deleteLead(session.tenantId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
