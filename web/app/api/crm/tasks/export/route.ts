import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

// Escapes CSV values and prevents formula injection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return "";
  
  let stringValue = String(value);
  
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = "'" + stringValue;
  }
  
  // Escape quotes
  if (stringValue.includes('"')) {
    stringValue = stringValue.replace(/"/g, '""');
  }
  
  // Wrap in quotes if it contains commas, newlines, or quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue}"`;
  }
  
  return stringValue;
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const identifier = `export_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.EXPORT || 10);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests" } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.EXPORT || 10);

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    // Check RBAC - only managers, admins and sales can export
    await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const priority = url.searchParams.get("priority") || "all";
    const assignedToId = url.searchParams.get("assignedToId") || undefined;
    const idsString = url.searchParams.get("ids") || undefined;
    
    const where: Prisma.TaskWhereInput = {
      tenantId: session.tenantId,
      deletedAt: null,
    };

    if (idsString) {
      const ids = idsString.split(",");
      where.id = { in: ids };
    } else {
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (status !== "all") where.status = status as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (priority !== "all") where.priority = priority as any;
      if (assignedToId) where.assignedToId = assignedToId;
    }
    
    // If EMPLOYEE role somehow bypassed (should be blocked by requireRole, but defense in depth)
    if (session.role === "EMPLOYEE") {
      where.OR = [
        ...(where.OR ? [{ OR: where.OR }] : []),
        { assignedToId: session.userId },
        { createdById: session.userId }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        relatedLead: { select: { name: true } },
        relatedCustomer: { select: { name: true } }
      }
    });

    // Generate CSV
    const headers = [
      "Task ID", "Title", "Description", "Status", "Priority", 
      "Due Date", "Assigned To", "Related Entity", "Created At"
    ];

    const csvRows = [headers.join(",")];

    for (const task of tasks) {
      const relatedEntity = task.relatedLead?.name || task.relatedCustomer?.name || "";
      const row = [
        escapeCSV(task.id),
        escapeCSV(task.title),
        escapeCSV(task.description),
        escapeCSV(task.status),
        escapeCSV(task.priority),
        escapeCSV(task.dueDate ? new Date(task.dueDate).toISOString() : ""),
        escapeCSV(task.assignedTo?.name || task.assignedTo?.email || ""),
        escapeCSV(relatedEntity),
        escapeCSV(task.createdAt.toISOString())
      ];
      csvRows.push(row.join(","));
    }

    const csvString = csvRows.join("\n");
    
    // Audit Log for export
    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        userId: session.userId,
        action: "EXPORT_TASKS",
        module: "TASKS",
        details: { count: tasks.length, filters: { search, status, priority } }
      }
    });

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tasks_export_${new Date().toISOString().split('T')[0]}.csv"`,
      }
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
