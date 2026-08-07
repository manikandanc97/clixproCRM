import prisma from "@/lib/prisma";




export class WorkspaceService {
  static async getWorkspace(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    return { 
      name: tenant?.name || "ClixProCRM Workspace",
      taxId: (tenant as ReturnType<typeof JSON.parse>)?.taxId || "",
      address: (tenant as ReturnType<typeof JSON.parse>)?.address || "",
      currency: (tenant as ReturnType<typeof JSON.parse>)?.currency || "INR",
      timezone: (tenant as ReturnType<typeof JSON.parse>)?.timezone || "ist",
      logo: (tenant as ReturnType<typeof JSON.parse>)?.logo || null
    };
  }

  static async updateWorkspace(tenantId: string, data: ReturnType<typeof JSON.parse>) {
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
      }
    });
    return updated;
  }
}


