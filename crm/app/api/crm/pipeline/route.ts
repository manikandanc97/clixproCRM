import { NextResponse } from "next/server";
import { DealPipelineService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const pipeline = await DealPipelineService.getPipeline(session.tenantId);
    return NextResponse.json({ success: true, data: pipeline }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
