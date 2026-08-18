import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiSecurityService } from './ai-security.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [PrismaModule, WorkspaceModule],
  controllers: [AiController],
  providers: [AiService, AiSecurityService],
  exports: [AiService, AiSecurityService],
})
export class AiModule {}

