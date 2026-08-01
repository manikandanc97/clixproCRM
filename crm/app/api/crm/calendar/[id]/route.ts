import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
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

    const meeting = await prisma.meeting.findUnique({
      where: { id, tenantId: session.tenantId },
    });

    if (!meeting) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(isOnline !== undefined && { isOnline }),
        ...(assignedToId && { assignedToId }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CALENDAR_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: paramId } = await params;

    if (!paramId.startsWith("meeting-")) {
      return new NextResponse("Only meeting events can be deleted directly currently.", { status: 400 });
    }
    const id = paramId.replace("meeting-", "");

    const meeting = await prisma.meeting.findUnique({
      where: { id, tenantId: session.tenantId },
    });

    if (!meeting) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.meeting.delete({
      where: { id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[CALENDAR_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
