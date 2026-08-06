import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { RevenueService } from "@/services";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "USER"]);
    const targets = await RevenueService.getRevenueTargets(session.tenantId);
    return NextResponse.json({ success: true, data: targets }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
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
    const target = await RevenueService.createRevenueTarget(session.tenantId, body);
    return NextResponse.json({ success: true, data: target }, { status: 201 });
  } catch (error: unknown) { return handleApiError(error); }
}
