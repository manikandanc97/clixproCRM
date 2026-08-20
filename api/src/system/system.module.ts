import { Module } from '@nestjs/common';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { SearchController } from './controllers/search.controller';
import { AuditLogsService } from './services/audit-logs.service';
import { SearchService } from './services/search.service';
import { AuditLoggerService } from '../common/audit/audit-logger.service';
import { AuditArchiveService } from '../common/audit/archive/audit-archive.service';

@Module({
  controllers: [AuditLogsController, SearchController],
  providers: [AuditLogsService, SearchService, AuditLoggerService, AuditArchiveService],
  exports: [AuditLogsService, AuditLoggerService, AuditArchiveService],
})
export class SystemModule {}
