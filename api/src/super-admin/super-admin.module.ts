import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
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

@Module({
  imports: [PrismaModule],
  controllers: [
    PlatformDashboardController,
    PlatformOrganizationsController,
    PlatformUsersController,
    PlatformAnalyticsController,
    PlatformAuditLogsController,
    PlatformSettingsController,
  ],
  providers: [
    PlatformDashboardService,
    PlatformOrganizationsService,
    PlatformUsersService,
    PlatformAnalyticsService,
    PlatformAuditLogsService,
    PlatformSettingsService,
  ],
  exports: [
    PlatformDashboardService,
    PlatformOrganizationsService,
    PlatformUsersService,
    PlatformAnalyticsService,
    PlatformAuditLogsService,
    PlatformSettingsService,
  ],
})
export class SuperAdminModule {}
