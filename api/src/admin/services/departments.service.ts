import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDepartments(tenantId: string) {
    const departments = await this.prisma.department.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return departments;
  }

  async createDepartment(tenantId: string, userId: string, name: string, description?: string) {
    const existing = await this.prisma.department.findFirst({
      where: { tenantId, name }
    });

    if (existing) {
      throw new Error('Department already exists');
    }

    const department = await this.prisma.department.create({
      data: {
        tenantId,
        name,
        description
      }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE_DEPARTMENT',
        module: 'Employees',
        details: { name: department.name }
      }
    });

    return department;
  }

  async updateDepartment(tenantId: string, departmentId: string, userId: string, name?: string, description?: string) {
    const existing = await this.prisma.department.findFirst({
      where: { tenantId, id: departmentId }
    });

    if (!existing) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }

    if (name && name !== existing.name) {
      const duplicate = await this.prisma.department.findFirst({
        where: { tenantId, name }
      });
      if (duplicate) {
        throw new HttpException('Department name already in use', HttpStatus.BAD_REQUEST);
      }
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id: departmentId },
      data: { name, description }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'UPDATE_DEPARTMENT',
        module: 'Employees',
        details: { departmentId, name: updatedDepartment.name }
      }
    });

    return updatedDepartment;
  }

  async deleteDepartment(tenantId: string, departmentId: string, userId: string) {
    const existing = await this.prisma.department.findFirst({
      where: { tenantId, id: departmentId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!existing) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }

    if (existing._count.users > 0) {
      throw new HttpException('Cannot delete department with assigned users', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.department.delete({
      where: { id: departmentId }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'DELETE_DEPARTMENT',
        module: 'Employees',
        details: { departmentName: existing.name }
      }
    });

    return true;
  }
}
