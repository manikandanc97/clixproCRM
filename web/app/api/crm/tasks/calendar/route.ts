import { NextResponse } from "next/server";
import { TaskQueryService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;

    const result = await TaskQueryService.getTasks(session.tenantId, {
      userId: session.userId,
      role: session.role,
      limit: 500,
      startDate,
      endDate,
    });

    const calendarEvents = result.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDateValue || task.createdAt,
      end: task.dueDateValue || task.createdAt,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      isOverdue: task.isOverdue,
      rawTask: task,
    }));

    return NextResponse.json({ success: true, data: calendarEvents }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
