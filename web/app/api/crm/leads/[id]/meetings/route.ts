import { NextResponse } from "next/server";
import { MeetingService, LeadTimelineService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const meetings = await MeetingService.getLeadMeetings(session.tenantId, id);
    return NextResponse.json({ success: true, data: meetings }, { status: 200 });
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
    const meeting = await prisma.meeting.create({
      data: {
        tenantId: session.tenantId,
        title: body.title,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location || null,
        isOnline: body.isOnline || false,
        type: body.type || "MEETING",
        description: body.description || null,
        isAllDay: body.isAllDay || false,
        assignedToId: body.assignedToId || session.userId,
        leadId: id,
        status: body.status || "SCHEDULED",
      },
      include: {
        assignedTo: { select: { name: true, email: true, id: true } }
      }
    });
    
    await LeadTimelineService.createTimelineEvent(session.tenantId, id, "Meeting Scheduled", `Scheduled meeting: ${meeting.title}`, session.userId);
    
    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
