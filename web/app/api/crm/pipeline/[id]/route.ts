import { NextResponse } from "next/server";
import { DealService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const rawBody = await request.json();
    const resolvedParams = await params;
    const deal = await DealService.updateDeal(session.tenantId, resolvedParams.id, rawBody, session.userId);
    
    return NextResponse.json({ success: true, data: deal }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
