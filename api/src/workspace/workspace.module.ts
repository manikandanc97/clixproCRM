import { Module } from '@nestjs/common';
import { WorkspaceController } from './controllers/workspace.controller';
import { SettingsController } from './controllers/settings.controller';
import { WorkspaceService } from './services/workspace.service';
import { SettingsService } from './services/settings.service';
import { BrandingService } from './services/branding.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceController, SettingsController],
  providers: [WorkspaceService, SettingsService, BrandingService],
  exports: [WorkspaceService, SettingsService, BrandingService],
})
export class WorkspaceModule {}
