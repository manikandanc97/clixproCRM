import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { PlatformModulesService } from '../services/platform-modules.service';

export class CreatePlatformModuleDto {
  key?: string;
  label!: string;
  icon?: string;
  route!: string;
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

export class UpdatePlatformModuleDto {
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


@Controller(['super-admin/modules', 'super_admin/modules'])
export class PlatformModulesController {
  constructor(private readonly modulesService: PlatformModulesService) {}

  /**
   * Dynamic navigation menu endpoint for authenticated tenant users and Super Admins.
   * Only requires SupabaseAuthGuard so tenant users can query enabled modules for their role.
   */
  @Get('navigation')
  @UseGuards(SupabaseAuthGuard)
  async getNavigation(@Req() req: any) {
    const user = req.user;
    const modules = await this.modulesService.getNavigationMenu({
      isSuperAdmin: user?.isSuperAdmin === true,
      role: user?.role,
      permissions: user?.permissions,
    });
    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Super Admin full module management endpoints.
   * Strictly guarded by SuperAdminGuard.
   */
  @Get()
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async listModules(
    @Query('search') search?: string,
    @Query('group') group?: string,
    @Query('isEnabled') isEnabled?: string,
    @Query('isVisible') isVisible?: string,
  ) {
    const data = await this.modulesService.listModules({
      search,
      group,
      isEnabled: isEnabled !== undefined ? isEnabled === 'true' : undefined,
      isVisible: isVisible !== undefined ? isVisible === 'true' : undefined,
    });
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async getModule(@Param('id') id: string) {
    const data = await this.modulesService.getModuleById(id);
    return {
      success: true,
      data,
    };
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async createModule(@Req() req: any, @Body() body: CreatePlatformModuleDto) {
    if (!body.label || !body.route) {
      throw new HttpException(
        { success: false, message: 'Module label and route are required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = await this.modulesService.createModule(body, req.user.id);
    return {
      success: true,
      data,
      message: 'Platform module created successfully',
    };
  }

  @Patch('reorder')
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async reorderModules(
    @Req() req: any,
    @Body() body: { items: Array<{ id: string; sortOrder: number }> },
  ) {
    const result = await this.modulesService.reorderModules(body.items, req.user.id);
    return result;
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async updateModule(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdatePlatformModuleDto,
  ) {
    const data = await this.modulesService.updateModule(id, body, req.user.id);
    return {
      success: true,
      data,
      message: 'Platform module updated successfully',
    };
  }

  @Patch(':id/toggle')
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async toggleStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { isEnabled?: boolean; isVisible?: boolean },
  ) {
    const data = await this.modulesService.toggleModuleStatus(id, body, req.user.id);
    return {
      success: true,
      data,
      message: 'Module status updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, SuperAdminGuard)
  async deleteModule(@Req() req: any, @Param('id') id: string) {
    const result = await this.modulesService.deleteModule(id, req.user.id);
    return result;
  }
}
