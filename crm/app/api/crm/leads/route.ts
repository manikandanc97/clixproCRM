import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { leadSchema, paginationSchema } from "@/shared/validations";

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
    const stage = url.searchParams.get("stage") || url.searchParams.get("status") || "";

    const leads = await CrmService.getLeads(session.tenantId, "USD", page, limit, search, stage);
    return NextResponse.json({ success: true, data: leads }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const rawBody = await req.json();
    const body = leadSchema.parse(rawBody);
    const lead = await CrmService.createLead(session.tenantId, session.userId, body);
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error: unknown) { return handleApiError(error); }
}
