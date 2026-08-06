import { NextResponse } from "next/server";
import { LeadImportService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const importSchema = z.object({
  duplicateStrategy: z.enum(["skip", "update", "create"]).default("skip"),
  leads: z.array(z.any()),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const identifier = `import_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.IMPORT);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.IMPORT);

    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    
    const rawBody = await req.json();
    const { duplicateStrategy, leads } = importSchema.parse(rawBody);
    
    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: false, message: "No leads provided" }, { status: 400 });
    }

    const result = await LeadImportService.bulkImportLeads(
      session.tenantId,
      session.userId,
      leads,
      duplicateStrategy
    );
    
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) { 
    return handleApiError(error); 
  }
}
