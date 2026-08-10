import { Module } from '@nestjs/common';
import { WorkspaceController } from './controllers/workspace.controller';
import { SettingsController } from './controllers/settings.controller';
import { WorkspaceService } from './services/workspace.service';
import { SettingsService } from './services/settings.service';

@Module({
  controllers: [WorkspaceController, SettingsController],
  providers: [WorkspaceService, SettingsService],
})
export class WorkspaceModule {}
