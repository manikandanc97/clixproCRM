import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const attachments = await CrmService.getLeadAttachments(session.tenantId, id);
    return NextResponse.json({ success: true, data: attachments }, { status: 200 });
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
    const attachment = await CrmService.createLeadAttachment(session.tenantId, id, session.userId, body);
    
    await CrmService.createTimelineEvent(session.tenantId, id, "Attachment Added", `Uploaded ${body.fileName}`, session.userId);
    
    return NextResponse.json({ success: true, data: attachment }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
