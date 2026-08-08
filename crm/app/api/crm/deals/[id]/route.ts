import { NextResponse } from "next/server";
import { DealService } from "@/services";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
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
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const params = await context.params;
    await DealService.deleteDeal(session.tenantId, params.id);
    return NextResponse.json({ success: true, message: "Deal deleted successfully" }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
