export interface RequestTenantContext {
  tenantId?: string;
  userId?: string;
  isSuperAdmin: boolean;
  userRole?: any;
}
