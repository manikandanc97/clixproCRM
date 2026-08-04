import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { taskSchema } from "@/shared/validations";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;

    const task = await CrmService.getTaskById(session.tenantId, id);
    if (!task) return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]);

    const params = await context.params;
    const { id } = params;
    const rawBody = await req.json();
    const body = taskSchema.partial().parse(rawBody);

    const task = await CrmService.updateTask(session.tenantId, session.userId, id, body as any);
    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;

    await CrmService.deleteTask(session.tenantId, session.userId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
