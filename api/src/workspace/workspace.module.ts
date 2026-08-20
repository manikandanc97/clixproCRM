import { Module } from '@nestjs/common';
import { WorkspaceController } from './controllers/workspace.controller';
import { SettingsController } from './controllers/settings.controller';
import { WorkspaceService } from './services/workspace.service';
import { SettingsService } from './services/settings.service';
import { BrandingService } from './services/branding.service';

@Module({
  controllers: [WorkspaceController, SettingsController],
  providers: [WorkspaceService, SettingsService, BrandingService],
  exports: [WorkspaceService, BrandingService],
})
export class WorkspaceModule {}
