import client from "./client";

export interface PlatformOverviewData {
  metrics: {
    totalOrganizations: number;
    activeOrganizations: number;
    suspendedOrganizations: number;
    totalUsers: number;
    activeUsers: number;
    totalLeads: number;
    totalCustomers: number;
    totalDeals: number;
  };
  planDistribution: Array<{ plan: string; count: number }>;
  recentOrganizations: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: "ACTIVE" | "SUSPENDED";
    userCount: number;
    leadCount: number;
    customerCount: number;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    module: string;
    actor: string;
    actorEmail: string | null;
    tenantId: string | null;
    details: any;
    createdAt: string;
  }>;
}

export interface PlatformOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: "ACTIVE" | "SUSPENDED";
  currency: string;
  timezone: string;
  userCount: number;
  leadCount: number;
  customerCount: number;
  dealCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isSuperAdmin: boolean;
  createdAt: string;
  organizations: Array<{
    tenantId: string;
    name: string;
    slug: string;
    status: "ACTIVE" | "SUSPENDED";
    role: string;
    membershipStatus: string;
  }>;
}

export interface PlatformAnalyticsData {
  totals: {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    totalLeads: number;
    totalDeals: number;
    totalCustomers: number;
    totalQuotations: number;
    estimatedMRR: number;
    estimatedARR: number;
  };
  monthlyTrends: Array<{
    month: string;
    organizations: number;
    users: number;
  }>;
  planBreakdown: Array<{
    plan: string;
    count: number;
    price: number;
    monthlyRevenue: number;
  }>;
}

export interface PlatformAuditLog {
  id: string;
  action: string;
  module: string;
  tenantId: string | null;
  organizationName: string;
  actor: string;
  actorEmail: string | null;
  targetUser: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const fetchPlatformOverview = async (): Promise<PlatformOverviewData> => {
  const response = await client.get<{ success: boolean; data: PlatformOverviewData }>(
    "/super-admin/dashboard"
  );
  return response.data.data;
};

export const fetchPlatformOrganizations = async (params?: {
  search?: string;
  status?: "ACTIVE" | "SUSPENDED";
  plan?: string;
  page?: number;
  limit?: number;
}): Promise<{
  organizations: PlatformOrganization[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await client.get<{
    success: boolean;
    data: {
      organizations: PlatformOrganization[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };
  }>("/super-admin/organizations", { params });
  return response.data.data;
};

export const fetchPlatformOrganizationDetails = async (id: string) => {
  const response = await client.get<{ success: boolean; data: any }>(
    `/super-admin/organizations/${id}`
  );
  return response.data.data;
};

export const createPlatformOrganization = async (data: {
  name: string;
  slug?: string;
  plan?: string;
  currency?: string;
  timezone?: string;
}) => {
  const response = await client.post<{ success: boolean; data: any; message: string }>(
    "/super-admin/organizations",
    data
  );
  return response.data;
};

export const updatePlatformOrganization = async (
  id: string,
  data: Partial<PlatformOrganization>
) => {
  const response = await client.put<{ success: boolean; data: any; message: string }>(
    `/super-admin/organizations/${id}`,
    data
  );
  return response.data;
};

export const updateOrganizationStatus = async (
  id: string,
  status: "ACTIVE" | "SUSPENDED",
  reason?: string
) => {
  const response = await client.patch<{ success: boolean; data: any; message: string }>(
    `/super-admin/organizations/${id}/status`,
    { status, reason }
  );
  return response.data;
};

export const deletePlatformOrganization = async (id: string) => {
  const response = await client.delete<{ success: boolean; data: any; message: string }>(
    `/super-admin/organizations/${id}`
  );
  return response.data;
};

export const fetchPlatformUsers = async (params?: {
  search?: string;
  status?: string;
  isSuperAdmin?: boolean;
  page?: number;
  limit?: number;
}): Promise<{
  users: PlatformUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await client.get<{
    success: boolean;
    data: {
      users: PlatformUser[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };
  }>("/super-admin/users", { params });
  return response.data.data;
};

export const updatePlatformUserStatus = async (
  id: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
) => {
  const response = await client.patch<{ success: boolean; data: any; message: string }>(
    `/super-admin/users/${id}/status`,
    { status }
  );
  return response.data;
};

export const toggleSuperAdminRole = async (id: string, isSuperAdmin: boolean) => {
  const response = await client.patch<{ success: boolean; data: any; message: string }>(
    `/super-admin/users/${id}/super-admin`,
    { isSuperAdmin }
  );
  return response.data;
};

export const fetchPlatformAnalytics = async (): Promise<PlatformAnalyticsData> => {
  const response = await client.get<{ success: boolean; data: PlatformAnalyticsData }>(
    "/super-admin/analytics"
  );
  return response.data.data;
};

export const fetchPlatformAuditLogs = async (params?: {
  tenantId?: string;
  action?: string;
  module?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  logs: PlatformAuditLog[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await client.get<{
    success: boolean;
    data: {
      logs: PlatformAuditLog[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };
  }>("/super-admin/audit-logs", { params });
  return response.data.data;
};

export interface AuditIntegrityReport {
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  scope: string;
  checkedRecords: number;
  brokenLinks: number;
  missingArchives: number;
  hashMismatches: number;
  missingHashes: number;
  timestampAnomalies: number;
  failedArchives: number;
  staleOutboxRecords: number;
  archiveCoveragePercent: number;
  firstFailureId: string | null;
  lastCheckAt: string;
  reason: string | null;
}

export const fetchAuditIntegrityStatus = async (): Promise<AuditIntegrityReport> => {
  const response = await client.get<{ success: boolean; data: AuditIntegrityReport }>(
    "/super-admin/audit-integrity/status"
  );
  return response.data.data;
};

export const triggerAuditIntegrityVerify = async (
  tenantId?: string
): Promise<AuditIntegrityReport> => {
  const response = await client.post<{ success: boolean; data: AuditIntegrityReport }>(
    "/super-admin/audit-integrity/verify",
    undefined,
    { params: tenantId ? { tenantId } : undefined }
  );
  return response.data.data;
};

export const triggerAuditDrVerify = async (
  recordId: string
): Promise<{ restorable: boolean; reason: string | null }> => {
  const response = await client.post<{
    success: boolean;
    data: { restorable: boolean; reason: string | null };
  }>(`/super-admin/audit-integrity/dr-verify/${recordId}`);
  return response.data.data;
};

export interface SecurityIncidentItem {
  id: string;
  incidentNumber: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED" | "FALSE_POSITIVE";
  title: string;
  description: string;
  incidentType: string;
  detectedAt: string;
  detectedBy: string;
  tenantId: string | null;
  affectedUserId: string | null;
  createdBy: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityCenterStatus {
  emergencyMode: boolean;
  emergencyReason: string | null;
  openIncidents: number;
  criticalIncidents: number;
  lockedUsers: number;
  lockedTenants: number;
  auditIntegrityStatus: "HEALTHY" | "WARNING" | "CRITICAL";
  archiveCoveragePercent: number;
  checkedRecords: number;
  brokenChains: number;
  failedArchives: number;
  lastCheckAt: string;
}

export const fetchSecurityCenterStatus = async (): Promise<SecurityCenterStatus> => {
  const response = await client.get<{ success: boolean; data: SecurityCenterStatus }>(
    "/super-admin/security/center/status"
  );
  return response.data.data;
};

export const fetchSecurityIncidents = async (params?: {
  severity?: string;
  status?: string;
  tenantId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  incidents: SecurityIncidentItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await client.get<{
    success: boolean;
    data: {
      incidents: SecurityIncidentItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };
  }>("/super-admin/security/incidents", { params });
  return response.data.data;
};

export const createSecurityIncident = async (data: {
  title: string;
  description: string;
  severity: string;
  incidentType?: string;
  tenantId?: string;
  affectedUserId?: string;
}): Promise<SecurityIncidentItem> => {
  const response = await client.post<{ success: boolean; data: SecurityIncidentItem }>(
    "/super-admin/security/incidents",
    data
  );
  return response.data.data;
};

export const resolveSecurityIncident = async (
  id: string,
  resolutionNotes: string
): Promise<SecurityIncidentItem> => {
  const response = await client.post<{ success: boolean; data: SecurityIncidentItem }>(
    `/super-admin/security/incidents/${id}/resolve`,
    { resolutionNotes }
  );
  return response.data.data;
};

export const emergencyLockUser = async (
  userId: string,
  reason: string,
  confirmation: string
) => {
  const response = await client.post<{ success: boolean; message: string }>(
    `/super-admin/security/emergency/lock-user/${userId}`,
    { reason, confirmation }
  );
  return response.data;
};

export const emergencyUnlockUser = async (userId: string, reason: string) => {
  const response = await client.post<{ success: boolean; message: string }>(
    `/super-admin/security/emergency/unlock-user/${userId}`,
    { reason }
  );
  return response.data;
};

export const emergencyLockTenant = async (
  tenantId: string,
  reason: string,
  confirmation: string
) => {
  const response = await client.post<{ success: boolean; message: string }>(
    `/super-admin/security/emergency/lock-tenant/${tenantId}`,
    { reason, confirmation }
  );
  return response.data;
};

export const emergencyUnlockTenant = async (tenantId: string, reason: string) => {
  const response = await client.post<{ success: boolean; message: string }>(
    `/super-admin/security/emergency/unlock-tenant/${tenantId}`,
    { reason }
  );
  return response.data;
};

export const generateBreakGlassCode = async (): Promise<string> => {
  const response = await client.post<{
    success: boolean;
    data: { confirmationCode: string };
  }>("/super-admin/security/emergency/generate-break-glass-code");
  return response.data.data.confirmationCode;
};

export const enablePlatformEmergency = async (
  reason: string,
  confirmation: string,
  confirmationCode: string
) => {
  const response = await client.post<{ success: boolean; message: string }>(
    "/super-admin/security/emergency/platform-lockdown",
    { reason, confirmation, confirmationCode }
  );
  return response.data;
};

export const disablePlatformEmergency = async (reason: string) => {
  const response = await client.post<{ success: boolean; message: string }>(
    "/super-admin/security/emergency/platform-unlock",
    { reason }
  );
  return response.data;
};

export const fetchPlatformSettings = async () => {
  const response = await client.get<{ success: boolean; data: any }>(
    "/super-admin/settings"
  );
  return response.data.data;
};

export const updatePlatformSettings = async (data: any) => {
  const response = await client.post<{ success: boolean; data: any }>(
    "/super-admin/settings",
    data
  );
  return response.data;
};

export interface PlatformModule {
  id: string;
  key: string;
  label: string;
  icon: string;
  route: string;
  group: string;
  parentId: string | null;
  sortOrder: number;
  isEnabled: boolean;
  isVisible: boolean;
  isSystem: boolean;
  permission: string | null;
  badge: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  children?: PlatformModule[];
}

export interface CreatePlatformModuleDto {
  key?: string;
  label: string;
  icon?: string;
  route: string;
  group?: string;
  parentId?: string | null;
  sortOrder?: number;
  isEnabled?: boolean;
  isVisible?: boolean;
  isSystem?: boolean;
  permission?: string | null;
  badge?: string | null;
  description?: string | null;
}

export interface UpdatePlatformModuleDto {
  key?: string;
  label?: string;
  icon?: string;
  route?: string;
  group?: string;
  parentId?: string | null;
  sortOrder?: number;
  isEnabled?: boolean;
  isVisible?: boolean;
  isSystem?: boolean;
  permission?: string | null;
  badge?: string | null;
  description?: string | null;
}

export const fetchPlatformModules = async (params?: {
  search?: string;
  group?: string;
  isEnabled?: boolean;
  isVisible?: boolean;
}): Promise<{
  modules: PlatformModule[];
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    system: number;
  };
}> => {
  const response = await client.get<{
    success: boolean;
    data: {
      modules: PlatformModule[];
      stats: {
        total: number;
        enabled: number;
        disabled: number;
        system: number;
      };
    };
  }>("/super-admin/modules", { params });
  return response.data.data;
};

export const fetchPlatformNavigation = async (): Promise<PlatformModule[]> => {
  const response = await client.get<{
    success: boolean;
    data: PlatformModule[];
  }>("/super-admin/modules/navigation");
  return response.data.data;
};

export const createPlatformModule = async (data: CreatePlatformModuleDto) => {
  const response = await client.post<{
    success: boolean;
    data: PlatformModule;
    message: string;
  }>("/super-admin/modules", data);
  return response.data;
};

export const updatePlatformModule = async (
  id: string,
  data: UpdatePlatformModuleDto
) => {
  const response = await client.put<{
    success: boolean;
    data: PlatformModule;
    message: string;
  }>(`/super-admin/modules/${id}`, data);
  return response.data;
};

export const togglePlatformModuleStatus = async (
  id: string,
  params: { isEnabled?: boolean; isVisible?: boolean }
) => {
  const response = await client.patch<{
    success: boolean;
    data: PlatformModule;
    message: string;
  }>(`/super-admin/modules/${id}/toggle`, params);
  return response.data;
};

export const reorderPlatformModules = async (
  items: Array<{ id: string; sortOrder: number }>
) => {
  const response = await client.patch<{
    success: boolean;
    message: string;
  }>("/super-admin/modules/reorder", { items });
  return response.data;
};

export const deletePlatformModule = async (id: string) => {
  const response = await client.delete<{
    success: boolean;
    message: string;
  }>(`/super-admin/modules/${id}`);
  return response.data;
};

