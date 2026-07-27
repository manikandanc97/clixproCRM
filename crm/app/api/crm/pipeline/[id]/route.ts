import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { leadSchema } from "@/shared/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const rawBody = await request.json();
    const body = leadSchema.partial().parse(rawBody);
    const resolvedParams = await params;
    const lead = await CrmService.updateLead(session.tenantId, resolvedParams.id, body);
    
    return NextResponse.json({ success: true, data: lead }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}
