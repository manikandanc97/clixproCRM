import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { quoteSchema } from "@/shared/validations";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = quoteSchema.partial().parse(rawBody);
    
    const quotation = await CrmService.updateQuotation(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: quotation }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;
    
    await CrmService.deleteQuotation(session.tenantId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}
