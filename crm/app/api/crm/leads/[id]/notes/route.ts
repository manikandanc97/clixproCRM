import { NextResponse } from "next/server";
import { LeadNoteService, LeadTimelineService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const notes = await LeadNoteService.getLeadNotes(session.tenantId, id);
    return NextResponse.json({ success: true, data: notes }, { status: 200 });
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
    const note = await LeadNoteService.createLeadNote(session.tenantId, id, session.userId, body);
    
    // Automatically add a timeline event
    await LeadTimelineService.createTimelineEvent(session.tenantId, id, "Note Added", "A new note was added", session.userId);
    
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
