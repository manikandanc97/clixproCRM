import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase.guard';
import { TenantGuard } from './tenant.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    const result = await this.authService.getMe(
      userId,
      req.tenantId,
      req.user.email,
    );
    return { success: true, data: result };
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const result = await this.authService.updateMe(req.user.sub, body);
    return { success: true, data: result };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('onboarding')
  async onboarding(@Req() req: any, @Body() body: any) {
    const { companyName } = body;
    const name =
      req.user.user_metadata?.name ||
      req.user.user_metadata?.full_name ||
      req.user.email?.split('@')[0] ||
      'User';
    const email = req.user.email;
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    const userId = req.user.id || req.user.sub;
    const result = await this.authService.register(
      { userId, name, email, companyName },
      { ip: typeof ip === 'string' ? ip : undefined, userAgent },
    );
    return { success: true, data: result, message: 'Onboarding successful' };
  }

  @UseGuards(SupabaseAuthGuard, TenantGuard)
  @Delete('account')
  async deleteAccount(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub;
    const tenantId = req.tenantId;
    const result = await this.authService.deleteAccount(
      userId,
      tenantId,
      body || {},
    );
    return result;
  }
}
