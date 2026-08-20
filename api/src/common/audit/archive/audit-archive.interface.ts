export interface CanonicalAuditArchiveRecord {
  archiveVersion: string;
  archivedAt: string;
  chainScope: 'tenant' | 'platform';
  record: {
    id: string;
    tenantId: string | null;
    userId: string | null;
    targetUserId: string | null;
    action: string;
    module: string | null;
    details: any;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    previousHash: string | null;
    recordHash: string;
  };
}

export interface PutArchiveResult {
  objectKey: string;
  versionId?: string;
  etag?: string;
}

export interface HeadArchiveResult {
  exists: boolean;
  metadata?: Record<string, string>;
  recordHash?: string;
}

export interface AuditArchiveProvider {
  putObject(
    key: string,
    record: CanonicalAuditArchiveRecord,
    retentionDays: number,
  ): Promise<PutArchiveResult>;

  getObject(key: string): Promise<CanonicalAuditArchiveRecord | null>;

  headObject(key: string): Promise<HeadArchiveResult>;
}

export interface ArchiveIntegrityResult {
  valid: boolean;
  checkedRecords: number;
  missingArchives: number;
  mismatchedArchives: number;
  firstMismatchId: string | null;
  reason: string | null;
}
