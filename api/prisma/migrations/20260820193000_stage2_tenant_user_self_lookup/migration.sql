-- ============================================================================
-- Migration: 20260820193000_stage2_tenant_user_self_lookup
-- Stage 2 RLS: Self-membership lookup support for unauthenticated bootstrap
-- Allows authenticated users to safely query ONLY their own TenantUser memberships
-- and associated Role/RolePermissions before active tenant context is known.
-- ============================================================================

-- 1. Helper function for current user ID
CREATE OR REPLACE FUNCTION current_app_user() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '');
$$ LANGUAGE sql STABLE;

-- 2. Update TenantUser policy to allow user self-membership lookup
DROP POLICY IF EXISTS "tenant_isolation_tenantuser" ON "TenantUser";
CREATE POLICY "tenant_isolation_tenantuser" ON "TenantUser"
  FOR ALL
  USING ("tenantId" = current_app_tenant() OR "userId" = current_app_user() OR is_app_super_admin())
  WITH CHECK ("tenantId" = current_app_tenant() OR is_app_super_admin());

-- 3. Update Role policy to allow reading assigned roles during user self-bootstrap
DROP POLICY IF EXISTS "tenant_isolation_role" ON "Role";
CREATE POLICY "tenant_isolation_role" ON "Role"
  FOR ALL
  USING (
    "tenantId" = current_app_tenant()
    OR is_app_super_admin()
    OR EXISTS (
      SELECT 1 FROM "TenantUser"
      WHERE "TenantUser"."roleId" = "Role"."id"
        AND "TenantUser"."userId" = current_app_user()
    )
  )
  WITH CHECK ("tenantId" = current_app_tenant() OR is_app_super_admin());

-- 4. Update RolePermission policy to allow reading assigned permissions during user self-bootstrap
DROP POLICY IF EXISTS "tenant_isolation_rolepermission" ON "RolePermission";
CREATE POLICY "tenant_isolation_rolepermission" ON "RolePermission"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Role"
      WHERE "Role"."id" = "RolePermission"."roleId"
        AND (
          "Role"."tenantId" = current_app_tenant()
          OR is_app_super_admin()
          OR EXISTS (
            SELECT 1 FROM "TenantUser"
            WHERE "TenantUser"."roleId" = "Role"."id"
              AND "TenantUser"."userId" = current_app_user()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Role"
      WHERE "Role"."id" = "RolePermission"."roleId"
        AND ("Role"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  );
