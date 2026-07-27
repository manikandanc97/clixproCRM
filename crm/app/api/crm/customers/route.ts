import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { customerSchema } from "@/shared/validations";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const customers = await CrmService.getCustomers(session.tenantId);
    return NextResponse.json({ success: true, data: customers }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const rawBody = await req.json();
    const body = customerSchema.parse(rawBody);
    const customer = await CrmService.createCustomer(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) { return handleApiError(error); }
}
