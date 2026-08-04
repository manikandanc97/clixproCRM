import { NextResponse } from "next/server";
import { CustomerService } from "@/services";
import {  requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { customerSchema } from "@/shared/validations";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = customerSchema.partial().parse(rawBody);
    
    const customer = await CustomerService.updateCustomer(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: customer }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const { id } = await params;
    await CustomerService.deleteCustomer(session.tenantId, id);
    
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
