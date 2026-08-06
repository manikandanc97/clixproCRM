import { NextResponse } from "next/server";
import { AiService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const identifier = `ai_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.AI);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.AI);

    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    const data = await AiService.getAiSettings(session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const data = await req.json();
    const updated = await AiService.updateAiSettings(session.tenantId, data);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
