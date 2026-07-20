import { NextResponse } from "next/server";
import { CustomerService } from "../../../../services/customer.service";
import { getAuthSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const customers = await CustomerService.getCustomers(session.activeTenantId);
    return NextResponse.json({ success: true, data: customers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const customer = await CustomerService.createCustomer(session.activeTenantId, body, session.user.id);
    
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
