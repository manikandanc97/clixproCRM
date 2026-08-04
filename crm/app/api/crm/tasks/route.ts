import { NextResponse } from "next/server";
import { CrmService } from "@/services/crm.service";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { taskSchema, paginationSchema } from "@/shared/validations";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });

    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const priority = url.searchParams.get("priority") || "all";
    const assignedToId = url.searchParams.get("assignedToId") || undefined;
    const createdById = url.searchParams.get("createdById") || undefined;
    const relatedLeadId = url.searchParams.get("relatedLeadId") || undefined;
    const relatedCustomerId = url.searchParams.get("relatedCustomerId") || undefined;
    const tagsParam = url.searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const sortBy = url.searchParams.get("sortBy") || "dueDate";
    const sortOrder = (url.searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    const result = await CrmService.getTasks(session.tenantId, {
      userId: session.userId,
      role: session.role,
      page,
      limit,
      search,
      status,
      priority,
      assignedToId,
      createdById,
      relatedLeadId,
      relatedCustomerId,
      tags,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]);

    const rawBody = await req.json();
    const body = taskSchema.parse(rawBody);
    
    const task = await CrmService.createTask(session.tenantId, session.userId, {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      assignedToId: body.assignedToId,
      priority: body.priority as any,
      status: body.status as any,
      reminderDate: body.reminderDate,
      createdById: session.userId,
      relatedLeadId: body.relatedLeadId,
      relatedCustomerId: body.relatedCustomerId,
      relatedMeetingId: body.relatedMeetingId,
      relatedQuotationId: body.relatedQuotationId,
      tags: body.tags,
      checklist: body.checklist,
      attachments: body.attachments,
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
