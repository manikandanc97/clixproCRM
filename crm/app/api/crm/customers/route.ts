import { NextResponse } from "next/server";
import { CustomerService } from "@/services";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { customerSchema, paginationSchema } from "@/shared/validations";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });
    const search = url.searchParams.get("search") || "";

    const data = await CustomerService.getCustomers(session.tenantId, page, limit, search);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const rawBody = await req.json();
    const body = customerSchema.parse(rawBody);
    const customer = await CustomerService.createCustomer(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: unknown) { return handleApiError(error); }
}
