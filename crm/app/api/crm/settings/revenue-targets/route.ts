import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { RevenueService } from "@/services";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "USER"]);
    const targets = await RevenueService.getRevenueTargets(session.tenantId);
    return NextResponse.json({ success: true, data: targets }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await request.json();
    const target = await RevenueService.createRevenueTarget(session.tenantId, body);
    return NextResponse.json({ success: true, data: target }, { status: 201 });
  } catch (error: unknown) { return handleApiError(error); }
}
