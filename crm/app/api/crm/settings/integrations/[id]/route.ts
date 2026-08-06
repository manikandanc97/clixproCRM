import { NextResponse } from "next/server";
import { IntegrationService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "MANAGER"]);
    const data = await req.json();
    const updated = await IntegrationService.updateIntegrationSettings(session.tenantId, id, data.connected);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
