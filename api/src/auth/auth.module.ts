import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase.guard';
import { TenantGuard } from './tenant.guard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [PrismaModule, WorkspaceModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseAuthGuard,
    TenantGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    SupabaseAuthGuard,
    TenantGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
