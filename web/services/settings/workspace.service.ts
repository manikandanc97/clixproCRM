import prisma from "@/lib/prisma";




export class WorkspaceService {
  static async getWorkspace(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    return { 
      name: tenant?.name || "ClixProCRM Workspace",
      taxId: tenant?.taxId || "",
      address: tenant?.address || "",
      currency: tenant?.currency || "INR",
      timezone: tenant?.timezone || "ist",
      logo: tenant?.logo || null
    };
  }

  static async updateWorkspace(tenantId: string, data: ReturnType<typeof JSON.parse>) {
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        taxId: data.taxId,
        address: data.address,
        currency: data.currency,
        timezone: data.timezone,
        logo: data.logo,
      }
    });
    return updated;
  }
}


