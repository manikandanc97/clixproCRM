import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspace(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    return {
      name: tenant?.name || 'ClixProCRM Workspace',
      taxId: tenant?.taxId || '',
      address: tenant?.address || '',
      currency: tenant?.currency || 'INR',
      timezone: tenant?.timezone || 'ist',
      logo: tenant?.logo || null,
    };
  }

  async updateWorkspace(tenantId: string, data: any) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        taxId: data.taxId,
        address: data.address,
        currency: data.currency,
        timezone: data.timezone,
        logo: data.logo,
      },
    });
  }
}
