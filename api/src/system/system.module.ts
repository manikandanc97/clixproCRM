import { Module } from '@nestjs/common';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { SearchController } from './controllers/search.controller';
import { AuditLogsService } from './services/audit-logs.service';
import { SearchService } from './services/search.service';

@Module({
  controllers: [AuditLogsController, SearchController],
  providers: [AuditLogsService, SearchService],
})
export class SystemModule {}
