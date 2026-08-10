import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const identifier = `search_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.SEARCH || 100);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests" } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.SEARCH || 100);

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const { tenantId } = session;
    const isEmployee = session.role === "EMPLOYEE";
    const employeeFilter = isEmployee ? { ownerId: session.userId } : {};

    const [leads, customers, companies, deals, tasks] = await Promise.all([
      // Leads
      prisma.lead.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
          ],
          ...employeeFilter
        },
        take: 10,
        select: { id: true, name: true, email: true, company: true }
      }),
      // Customers
      prisma.customer.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
          ],
          ...employeeFilter
        },
        take: 10,
        select: { id: true, name: true, email: true, company: true }
      }),
      // Companies
      prisma.company.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
          ...employeeFilter
        },
        take: 10,
        select: { id: true, name: true, email: true }
      }),
      // Deals
      prisma.deal.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
          ],
          ...employeeFilter
        },
        take: 10,
        select: { id: true, name: true, value: true }
      }),
      // Tasks
      prisma.task.findMany({
        where: {
          tenantId,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 30, // Get a bit more tasks to allow manual filtering
        select: { id: true, title: true, priority: true, assignedToId: true, createdById: true }
      })
    ]);

    const filteredTasks = isEmployee 
      ? tasks.filter(t => t.assignedToId === session.userId || t.createdById === session.userId)
      : tasks;

    const results = [
      ...leads.map(l => ({ id: l.id, title: l.name, subtitle: l.company || l.email || "Lead", type: "Lead", url: `/leads/${l.id}` })),
      ...customers.map(c => ({ id: c.id, title: c.name, subtitle: c.company || c.email || "Customer", type: "Customer", url: `/customers/${c.id}` })),
      ...companies.map(c => ({ id: c.id, title: c.name, subtitle: c.email || "Company", type: "Company", url: `/companies/${c.id}` })),
      ...deals.map(d => ({ id: d.id, title: d.name, subtitle: `Value: ${d.value}`, type: "Deal", url: `/pipeline` })),
      ...filteredTasks.map(t => ({ id: t.id, title: t.title, subtitle: t.priority || "Task", type: "Task", url: `/tasks` })),
    ];

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
