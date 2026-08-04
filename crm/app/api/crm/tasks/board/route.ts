import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const result = await CrmService.getTasks(session.tenantId, {
      userId: session.userId,
      role: session.role,
      limit: 1000,
      search,
    });

    const columns = {
      PENDING: result.tasks.filter((t) => t.status === "PENDING"),
      IN_PROGRESS: result.tasks.filter((t) => t.status === "IN_PROGRESS"),
      BLOCKED: result.tasks.filter((t) => t.status === "BLOCKED"),
      COMPLETED: result.tasks.filter((t) => t.status === "COMPLETED"),
      CANCELLED: result.tasks.filter((t) => t.status === "CANCELLED"),
      OVERDUE: result.tasks.filter((t) => t.status === "OVERDUE"),
    };

    return NextResponse.json({ success: true, data: columns }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
