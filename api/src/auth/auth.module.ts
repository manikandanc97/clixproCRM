import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase.guard';
import { TenantGuard } from './tenant.guard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';

@Module({
  providers: [SupabaseAuthGuard, TenantGuard, RolesGuard, PermissionsGuard],
  exports: [SupabaseAuthGuard, TenantGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
