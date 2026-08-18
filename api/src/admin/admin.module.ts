import { Module } from '@nestjs/common';
import { DepartmentsController } from './controllers/departments.controller';
import { EmployeesController } from './controllers/employees.controller';
import { RolesController } from './controllers/roles.controller';
import { RoleManagementController } from './controllers/role-management.controller';
import { DepartmentsService } from './services/departments.service';
import { EmployeesService } from './services/employees.service';
import { RolesService } from './services/roles.service';
import { RoleStatsService } from './services/role-stats.service';

@Module({
  controllers: [
    DepartmentsController,
    EmployeesController,
    RolesController,
    RoleManagementController,
  ],
  providers: [DepartmentsService, EmployeesService, RolesService, RoleStatsService],
})
export class AdminModule {}
