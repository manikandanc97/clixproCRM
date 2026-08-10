import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await requirePermission("Roles", "Manage");
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    const search = searchParams.get("search") || "";
    
    const whereClause: Prisma.AuditLogWhereInput = { tenantId: session.tenantId };
    if (search) {
      whereClause.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { module: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true } },
          targetUser: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) { return handleApiError(error); }
}
