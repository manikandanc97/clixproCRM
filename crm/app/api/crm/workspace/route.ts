import { NextResponse } from "next/server";
import { WorkspaceService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "MANAGER"]);
    
    // Using PascalCase for method name mapping
            // Type-safe lookup object approach
    const serviceMap = {
      method: WorkspaceService.getWorkspace
    };
    const data = await serviceMap.method(session.tenantId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
