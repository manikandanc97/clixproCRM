import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { customerSchema } from "@/shared/validations";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = customerSchema.partial().parse(rawBody);
    
    const customer = await CrmService.updateCustomer(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: customer }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await CrmService.deleteCustomer(session.tenantId, id);
    
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}
