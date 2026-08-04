import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: CrmService.getMeetings
    };
    const meetings = await serviceMap.method(session.tenantId);
    return NextResponse.json({ success: true, data: { meetings } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const meeting = await CrmService.createMeeting(session.tenantId, session.userId, {
      title: body.title,
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      isOnline: body.isOnline,
      type: body.type,
      description: body.description,
      isAllDay: body.isAllDay,
      assignedToId: body.assignedToId,
      leadId: body.leadId,
      taskId: body.taskId,
      status: body.status,
    });
    
    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
