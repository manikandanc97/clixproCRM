import { NextResponse } from "next/server";
import { CompanyService } from "@/services/company/company.service";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    
    const params = await context.params;
    const company = await CompanyService.getCompanyById(session.tenantId, params.id);
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, data: company }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    
    const params = await context.params;
    const data = await req.json();
    const updated = await CompanyService.updateCompany(session.tenantId, params.id, data);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(req);
    const identifier = `delete_company_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    const params = await context.params;
    await CompanyService.deleteCompany(session.tenantId, params.id);
    return NextResponse.json({ success: true, message: "Company deleted" }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
