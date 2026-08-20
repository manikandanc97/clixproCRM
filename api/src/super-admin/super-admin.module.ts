import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemModule } from '../system/system.module';
import { PlatformDashboardController } from './controllers/platform-dashboard.controller';
import { PlatformDashboardService } from './services/platform-dashboard.service';
import { PlatformOrganizationsController } from './controllers/platform-organizations.controller';
import { PlatformOrganizationsService } from './services/platform-organizations.service';
import { PlatformUsersController } from './controllers/platform-users.controller';
import { PlatformUsersService } from './services/platform-users.service';
import { PlatformAnalyticsController } from './controllers/platform-analytics.controller';
import { PlatformAnalyticsService } from './services/platform-analytics.service';
import { PlatformAuditLogsController } from './controllers/platform-audit-logs.controller';
import { PlatformAuditLogsService } from './services/platform-audit-logs.service';
import { PlatformSettingsController } from './controllers/platform-settings.controller';
import { PlatformSettingsService } from './services/platform-settings.service';
import { PlatformModulesController } from './controllers/platform-modules.controller';
import { PlatformModulesService } from './services/platform-modules.service';
import { PlatformAuditIntegrityController } from './controllers/platform-audit-integrity.controller';
import { PlatformSecurityCenterController } from './controllers/platform-security-center.controller';
import { EmergencySecurityService } from './services/emergency-security.service';
import { SecurityIncidentsService } from './services/security-incidents.service';

@Module({
  imports: [PrismaModule, SystemModule],
  controllers: [
    PlatformDashboardController,
    PlatformOrganizationsController,
    PlatformUsersController,
    PlatformAnalyticsController,
    PlatformAuditLogsController,
    PlatformAuditIntegrityController,
    PlatformSecurityCenterController,
    PlatformSettingsController,
    PlatformModulesController,
  ],
  providers: [
    PlatformDashboardService,
    PlatformOrganizationsService,
    PlatformUsersService,
    PlatformAnalyticsService,
    PlatformAuditLogsService,
    PlatformSettingsService,
    PlatformModulesService,
    EmergencySecurityService,
    SecurityIncidentsService,
  ],
  exports: [
    PlatformDashboardService,
    PlatformOrganizationsService,
    PlatformUsersService,
    PlatformAnalyticsService,
    PlatformAuditLogsService,
    PlatformSettingsService,
    PlatformModulesService,
    EmergencySecurityService,
    SecurityIncidentsService,
  ],
})
export class SuperAdminModule {}

