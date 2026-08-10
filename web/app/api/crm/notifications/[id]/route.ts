import { NextResponse } from "next/server";
import { CommonNotificationService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    const resolvedParams = await params;
    await CommonNotificationService.markAsRead(session.tenantId, session.userId, resolvedParams.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
