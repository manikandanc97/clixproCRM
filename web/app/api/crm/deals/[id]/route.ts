import { NextResponse } from "next/server";
import { DealService } from "@/services";
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
    const deal = await DealService.getDealById(session.tenantId, params.id);
    if (!deal) {
      return NextResponse.json({ success: false, message: "Deal not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: deal }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    const body = await req.json();
    
    const params = await context.params;
    const deal = await DealService.updateDeal(session.tenantId, params.id, body, session.userId);
    return NextResponse.json({ success: true, data: deal }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const session = await requireRole(["ADMIN", "MANAGER"]);
    const params = await context.params;
    await DealService.deleteDeal(session.tenantId, params.id);
    return NextResponse.json({ success: true, message: "Deal deleted successfully" }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
