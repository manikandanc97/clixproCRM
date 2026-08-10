import { NextResponse } from "next/server";
import { LeadTimelineService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const timeline = await LeadTimelineService.getLeadTimeline(session.tenantId, id);
    return NextResponse.json({ success: true, data: timeline }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const event = await LeadTimelineService.createTimelineEvent(session.tenantId, id, body.action, body.description, session.userId);
    
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
