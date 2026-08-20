import { Module } from '@nestjs/common';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { SearchController } from './controllers/search.controller';
import { AuditLogsService } from './services/audit-logs.service';
import { SearchService } from './services/search.service';
import { AuditLoggerService } from '../common/audit/audit-logger.service';
import { AuditArchiveService } from '../common/audit/archive/audit-archive.service';
import { AuditIntegrityMonitorService } from '../common/audit/integrity/audit-integrity-monitor.service';
import { AuditIntegrityAlertService } from '../common/audit/integrity/audit-integrity-alert.service';
import { AuditDisasterRecoveryService } from '../common/audit/integrity/audit-dr.service';

@Module({
  controllers: [AuditLogsController, SearchController],
  providers: [
    AuditLogsService,
    SearchService,
    AuditLoggerService,
    AuditArchiveService,
    AuditIntegrityMonitorService,
    AuditIntegrityAlertService,
    AuditDisasterRecoveryService,
  ],
  exports: [
    AuditLogsService,
    AuditLoggerService,
    AuditArchiveService,
    AuditIntegrityMonitorService,
    AuditIntegrityAlertService,
    AuditDisasterRecoveryService,
  ],
})
export class SystemModule {}
