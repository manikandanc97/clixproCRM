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
