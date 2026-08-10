import { NextResponse } from "next/server";
import { TaskService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const assignSchema = z.object({
  assignedToId: z.string().min(1, "Assignee ID is required"),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    const params = await context.params;
    const { id } = params;

    const rawBody = await req.json();
    const { assignedToId } = assignSchema.parse(rawBody);

    const task = await TaskService.updateTask(session.tenantId, session.userId, id, { assignedToId });

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
