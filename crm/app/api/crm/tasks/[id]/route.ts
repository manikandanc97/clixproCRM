import { NextResponse } from "next/server";
import { TaskQueryService, TaskService } from "@/services";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { taskSchema } from "@/shared/validations";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const { id } = params;

    const task = await TaskQueryService.getTaskById(session.tenantId, id);
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

    const task = await TaskService.updateTask(session.tenantId, session.userId, id, body as any);
    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `delete_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const params = await context.params;
    const { id } = params;

    await TaskService.deleteTask(session.tenantId, session.userId, id);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
