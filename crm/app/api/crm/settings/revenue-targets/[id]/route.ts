import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { RevenueService } from "@/services";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(request);
    const identifier = `admin_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.ADMIN);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.ADMIN);

    const session = await requireRole(["ADMIN"]);
    const body = await request.json();
    const { id } = await params;
    const target = await RevenueService.updateRevenueTarget(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: target }, { status: 200 });
  } catch (error: unknown) { 
    return handleApiError(error); 
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(request);
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

    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    await RevenueService.deleteRevenueTarget(session.tenantId, id);
    return NextResponse.json({ success: true, message: "Target deleted successfully" }, { status: 200 });
  } catch (error: unknown) { 
    return handleApiError(error); 
  }
}
