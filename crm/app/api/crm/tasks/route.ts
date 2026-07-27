import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { taskSchema } from "@/shared/validations";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const tasks = await CrmService.getTasks(session.tenantId);
    return NextResponse.json({ success: true, data: tasks }, { status: 200 });
  } catch (error: any) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const rawBody = await req.json();
    const body = taskSchema.parse(rawBody);
    const task = await CrmService.createTask(session.tenantId, body);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: any) { return handleApiError(error); }
}
