import { NextResponse } from "next/server";
import { LeadAttachmentService, LeadTimelineService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const attachments = await LeadAttachmentService.getLeadAttachments(session.tenantId, id);
    return NextResponse.json({ success: true, data: attachments }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `upload_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.FILE_UPLOAD);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.FILE_UPLOAD);

    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const attachment = await LeadAttachmentService.createLeadAttachment(session.tenantId, id, session.userId, body);
    
    await LeadTimelineService.createTimelineEvent(session.tenantId, id, "Attachment Added", `Uploaded ${body.fileName}`, session.userId);
    
    return NextResponse.json({ success: true, data: attachment }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
