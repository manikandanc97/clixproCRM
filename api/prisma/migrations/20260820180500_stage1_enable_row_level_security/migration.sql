-- ============================================================================
-- Migration: 20260820180500_stage1_enable_row_level_security
-- Stage 1 Defense-in-Depth PostgreSQL Row-Level Security (RLS)
-- Enables RLS on all tenant-scoped tables with session-variable-backed policies.
-- Stage 1 non-breaking deployment (standard RLS).
-- ============================================================================

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION current_app_tenant() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_app_super_admin() RETURNS boolean AS $$
  SELECT COALESCE(current_setting('app.is_super_admin', true) = 'true', false);
$$ LANGUAGE sql STABLE;

-- 2. Direct Tenant Tables RLS & Policies
DO $$
DECLARE
  direct_tables text[] := ARRAY[
    'Lead',
    'Customer',
    'Deal',
    'Task',
    'Meeting',
    'Quotation',
    'Invoice',
    'InvoiceCounter',
    'Note',
    'Attachment',
    'TimelineEvent',
    'Product',
    'RevenueTarget',
    'Notification',
    'TenantAiConfig',
    'AiConversation',
    'Document',
    'Company',
    'Role',
    'Department',
    'Invitation',
    'TenantUser'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY direct_tables LOOP
    -- Enable RLS (standard non-forced for Stage 1)
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop existing policy if any
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', 'tenant_isolation_' || lower(tbl), tbl);
    
    -- Create tenant isolation policy
    EXECUTE format(
      'CREATE POLICY %I ON %I
       FOR ALL
       USING ("tenantId" = current_app_tenant() OR is_app_super_admin())
       WITH CHECK ("tenantId" = current_app_tenant() OR is_app_super_admin());',
      'tenant_isolation_' || lower(tbl),
      tbl
    );
  END LOOP;
END $$;

-- 3. Relational Child Tables RLS & Policies

-- 3a. AiMessage (scoped via parent AiConversation.tenantId)
ALTER TABLE "AiMessage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_aimessage" ON "AiMessage";
CREATE POLICY "tenant_isolation_aimessage" ON "AiMessage"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "AiConversation"
      WHERE "AiConversation"."id" = "AiMessage"."conversationId"
        AND ("AiConversation"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "AiConversation"
      WHERE "AiConversation"."id" = "AiMessage"."conversationId"
        AND ("AiConversation"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  );

-- 3b. DocumentChunk (scoped via parent Document.tenantId)
ALTER TABLE "DocumentChunk" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_documentchunk" ON "DocumentChunk";
CREATE POLICY "tenant_isolation_documentchunk" ON "DocumentChunk"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "DocumentChunk"."documentId"
        AND ("Document"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Document"
      WHERE "Document"."id" = "DocumentChunk"."documentId"
        AND ("Document"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  );

-- 3c. RolePermission (scoped via parent Role.tenantId)
ALTER TABLE "RolePermission" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_rolepermission" ON "RolePermission";
CREATE POLICY "tenant_isolation_rolepermission" ON "RolePermission"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Role"
      WHERE "Role"."id" = "RolePermission"."roleId"
        AND ("Role"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Role"
      WHERE "Role"."id" = "RolePermission"."roleId"
        AND ("Role"."tenantId" = current_app_tenant() OR is_app_super_admin())
    )
  );
