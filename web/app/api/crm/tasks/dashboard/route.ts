import { NextResponse } from "next/server";
import { TaskQueryService } from "@/services";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const result = await TaskQueryService.getTasks(session.tenantId, {
      userId: session.userId,
      role: session.role,
      limit: 1000,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          stats: result.stats,
          dashboardStats: result.dashboardStats,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
