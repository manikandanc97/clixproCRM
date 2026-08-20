import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';

/**
 * ENCRYPTION NOTE:
 *  - Tenant.taxId and Tenant.address are AES-256-GCM encrypted.
 *  - Decryption happens transparently on read before returning to client.
 */
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enc: EncryptionService,
  ) {}

  async getWorkspace(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    return {
      name: tenant?.name || 'ClixProCRM Workspace',
      taxId: this.enc.decrypt(tenant?.taxId) || '',
      address: this.enc.decrypt(tenant?.address) || '',
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
        taxId: data.taxId !== undefined ? this.enc.encrypt(data.taxId) : undefined,
        address: data.address !== undefined ? this.enc.encrypt(data.address) : undefined,
        currency: data.currency,
        timezone: data.timezone,
        logo: data.logo,
      },
    });
  }
}
