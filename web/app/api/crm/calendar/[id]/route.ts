import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { MeetingService } from "@/services";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: paramId } = await params;
    const body = await req.json();
    const { startTime, endTime, title, description, location, isOnline, assignedToId, status } = body;

    if (!paramId.startsWith("meeting-")) {
      return new NextResponse("Only meeting events can be updated directly currently.", { status: 400 });
    }
    const id = paramId.replace("meeting-", "");

    const updated = await MeetingService.updateMeeting(session.tenantId, id, {
      title,
      description,
      startTime,
      endTime,
      location,
      isOnline,
      assignedToId,
      status,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CALENDAR_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `delete_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: paramId } = await params;

    if (!paramId.startsWith("meeting-")) {
      return new NextResponse("Only meeting events can be deleted directly currently.", { status: 400 });
    }
    const id = paramId.replace("meeting-", "");

    await MeetingService.deleteMeeting(session.tenantId, id);

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[CALENDAR_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
