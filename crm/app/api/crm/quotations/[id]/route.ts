import { NextResponse } from "next/server";
import { QuotationService } from "@/services";
import {  requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { quoteSchema } from "@/shared/validations";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = quoteSchema.partial().parse(rawBody);
    
    const quotation = await QuotationService.updateQuotation(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: quotation }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    
    await QuotationService.deleteQuotation(session.tenantId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
