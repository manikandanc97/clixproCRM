import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { EncryptionService } from '../common/encryption/encryption.service';

/**
 * ENCRYPTION NOTE:
 *  - Company.name, email, phone, address, notes are AES-256-GCM encrypted.
 *  - Company.nameHash (HMAC-SHA256) is used for exact-match lookups from
 *    lead create/convert/import services.
 *  - Company.industry and Company.website are NOT encrypted (not PII).
 *  - List search is applied post-decryption for name/industry substring match.
 */
@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enc: EncryptionService,
  ) {}

  async getCompanies(tenantId: string, query: PaginationQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(query.limit || 1000, 10000));
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = { tenantId, deletedAt: null };

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { customers: { where: { deletedAt: null } }, deals: true },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    // Decrypt PII fields
    const decrypted = companies.map((c) => ({
      ...c,
      name: this.enc.decrypt(c.name),
      email: this.enc.decrypt(c.email),
      phone: this.enc.decrypt(c.phone),
      address: this.enc.decrypt(c.address),
      notes: this.enc.decrypt(c.notes),
    }));

    // Apply search post-decryption (name substring, industry is plaintext)
    const filtered = search
      ? decrypted.filter(
          (c) =>
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.industry || '').toLowerCase().includes(search.toLowerCase()),
        )
      : decrypted;

    return {
      companies: filtered,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCompany(
    tenantId: string,
    data: CreateCompanyDto,
    userId: string,
  ) {
    const { encrypted: encName, hash: nameHash } = this.enc.encryptWithHash(
      data.name,
    );
    return this.prisma.company.create({
      data: {
        tenantId,
        ownerId: userId,
        name: encName!,
        nameHash,
        industry: data.industry,
        website: data.website,
        email: this.enc.encrypt(data.email),
        phone: this.enc.encrypt(data.phone),
        address: this.enc.encrypt(data.address),
        notes: this.enc.encrypt(data.notes),
        status: data.status || 'ACTIVE',
      },
    });
  }

  async updateCompany(tenantId: string, id: string, data: Partial<CreateCompanyDto>) {
    const updateData: any = {};
    if (data.name !== undefined) {
      const { encrypted: encName, hash: nameHash } =
        this.enc.encryptWithHash(data.name);
      updateData.name = encName;
      updateData.nameHash = nameHash;
    }
    if (data.email !== undefined) updateData.email = this.enc.encrypt(data.email);
    if (data.phone !== undefined) updateData.phone = this.enc.encrypt(data.phone);
    if (data.address !== undefined) updateData.address = this.enc.encrypt(data.address);
    if (data.notes !== undefined) updateData.notes = this.enc.encrypt(data.notes);
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.company.update({ where: { id, tenantId }, data: updateData });
  }
}
