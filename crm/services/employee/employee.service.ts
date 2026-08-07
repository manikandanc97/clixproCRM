import prisma from "@/lib/prisma";




export class EmployeeService {
  static async getEmployees(tenantId: string, page = 1, limit = 10) {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(limit, 100));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { memberships: { some: { tenantId } } },
        include: {
          memberships: {
            where: { tenantId },
            select: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { memberships: { some: { tenantId } } } }),
    ]);

    return {
      employees: users.map(u => ({ 
        id: u.id, 
        name: u.name || "Unknown User", 
        email: u.email, 
        role: u.memberships[0]?.role?.name || "EMPLOYEE", 
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      })),
      stats: [
        { title: "Total Employees", value: users.length.toString(), change: "+1", positive: true },
        { title: "Active Staff", value: users.length.toString(), change: "+1", positive: true },
        { title: "On Leave", value: "0", change: "0", positive: true }
      ],
      activities: [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getRoles(_tenantId: string) {
    return {
      roles: [
        { id: "r1", name: "Administrator", key: "ADMIN", membersCount: 2, permissionsCount: 45, description: "Full system access", status: "ACTIVE", createdDate: "2026-01-01T00:00:00.000Z" },
        { id: "r2", name: "Manager", key: "MANAGER", membersCount: 5, permissionsCount: 30, description: "Department management", status: "ACTIVE", createdDate: "2026-01-15T00:00:00.000Z" }
      ],
      stats: [
        { title: "Total Roles", value: "2", change: "0", positive: true }
      ],
      securityLogs: [],
      permissionModules: []
    };
  }
}


