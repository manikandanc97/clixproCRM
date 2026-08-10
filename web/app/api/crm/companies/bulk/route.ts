import { NextResponse } from "next/server";
import { CompanyService } from "@/services/company/company.service";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const identifier = `bulk_delete_companies_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.BULK_DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.BULK_DELETE);

    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const body = await req.json();
    if (!body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json({ success: false, message: "Invalid request. Expected array of ids." }, { status: 400 });
    }

    await CompanyService.bulkDeleteCompanies(session.tenantId, body.ids);
    
    return NextResponse.json({ success: true, data: { count: body.ids.length } }, { status: 200 });
  } catch (error: unknown) { 
    return handleApiError(error); 
  }
}
