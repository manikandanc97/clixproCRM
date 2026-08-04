import { NextResponse } from "next/server";
import { TaskService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]);
    const params = await context.params;
    const { id } = params;

    const task = await TaskService.updateTask(session.tenantId, session.userId, id, { status: "COMPLETED" });

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
