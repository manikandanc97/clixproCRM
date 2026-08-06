import { NextResponse } from "next/server";
import { QuotationService } from "@/services";
import {  requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { quoteSchema } from "@/shared/validations";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = quoteSchema.partial().parse(rawBody);
    
    const quotation = await QuotationService.updateQuotation(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: quotation }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `delete_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;
    
    await QuotationService.deleteQuotation(session.tenantId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
