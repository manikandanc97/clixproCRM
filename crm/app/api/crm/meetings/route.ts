import { NextResponse } from "next/server";
import { MeetingService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: MeetingService.getMeetings
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
    const isLog = body.isLog === true;
    
    // Backend validation for date/time
    const startTime = new Date(body.startTime);
    const now = new Date();
    
    if (isLog) {
      if (startTime > now) {
        return NextResponse.json({ success: false, message: "Cannot log a meeting in the future." }, { status: 400 });
      }
    } else {
      // Allow a 5-minute buffer for scheduling
      const bufferNow = new Date(now.getTime() - 5 * 60000);
      if (startTime < bufferNow) {
        return NextResponse.json({ success: false, message: "Cannot schedule a meeting in the past." }, { status: 400 });
      }
    }

    if (!body.leadId && !body.customerId && !body.quotationId) {
      return NextResponse.json({ success: false, message: "Meeting must be linked to a Lead, Customer, or Deal." }, { status: 400 });
    }

    const meeting = await MeetingService.createMeeting(session.tenantId, session.userId, {
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
      customerId: body.customerId,
      quotationId: body.quotationId,
      taskId: body.taskId,
      status: body.status,
      isLog: isLog,
      duration: body.duration,
      meetingNotes: body.notes,
    });
    
    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
