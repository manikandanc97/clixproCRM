import { NextResponse } from "next/server";
import { CompanyService } from "@/services";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { paginationSchema } from "@/shared/validations";

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

    const data = await CompanyService.getCompanies(session.tenantId, page, limit, search);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    
    // NOTE: Ideally this would be validated with a zod schema for companies
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }
    
    const company = await CompanyService.createCompany(session.tenantId, body, session.userId);
    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error: unknown) { return handleApiError(error); }
}
