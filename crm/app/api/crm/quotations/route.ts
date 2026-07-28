import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { quoteSchema, paginationSchema } from "@/shared/validations";

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

    const quotations = await CrmService.getQuotations(session.tenantId, page, limit, search);
    return NextResponse.json({ success: true, data: quotations }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const rawBody = await req.json();
    const body = quoteSchema.parse(rawBody);
    const quotation = await CrmService.createQuotation(session.tenantId, body);
    return NextResponse.json({ success: true, data: quotation }, { status: 201 });
  } catch (error: any) { return handleApiError(error); }
}
