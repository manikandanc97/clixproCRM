import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { RevenueService } from "@/services";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    await RevenueService.deleteRevenueTarget(session.tenantId, id);
    return NextResponse.json({ success: true, message: "Target deleted successfully" }, { status: 200 });
  } catch (error: unknown) { 
    return handleApiError(error); 
  }
}
