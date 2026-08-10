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

  static async getRoles(tenantId: string) {
    const roles = await prisma.role.findMany({
      where: { tenantId },
      include: {
        _count: { select: { users: true } },
        permissions: true,
      },
      orderBy: { priority: "desc" },
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      key: role.name.toUpperCase(),
      membersCount: role._count.users,
      permissionsCount: role.permissions.filter(p => p.hasAccess).length,
      description: role.description || `${role.name} role`,
      status: role.isActive ? "ACTIVE" : "INACTIVE",
      createdDate: role.createdAt.toISOString(),
    }));

    return {
      roles: formattedRoles,
      stats: [
        { title: "Total Roles", value: roles.length.toString(), change: "0", positive: true }
      ],
      securityLogs: [],
      permissionModules: []
    };
  }
}


