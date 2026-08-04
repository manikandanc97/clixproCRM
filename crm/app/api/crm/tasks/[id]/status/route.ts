import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED", "OVERDUE"]),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]);
    const params = await context.params;
    const { id } = params;

    const rawBody = await req.json();
    const { status } = statusSchema.parse(rawBody);

    const task = await CrmService.updateTask(session.tenantId, session.userId, id, { status });

    return NextResponse.json({ success: true, data: task }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
