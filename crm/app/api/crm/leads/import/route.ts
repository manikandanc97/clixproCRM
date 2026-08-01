import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const importSchema = z.object({
  duplicateStrategy: z.enum(["skip", "update", "create"]).default("skip"),
  leads: z.array(z.any()),
});

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    
    const rawBody = await req.json();
    const { duplicateStrategy, leads } = importSchema.parse(rawBody);
    
    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: false, message: "No leads provided" }, { status: 400 });
    }

    const result = await CrmService.bulkImportLeads(
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
