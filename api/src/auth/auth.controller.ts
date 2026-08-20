import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  BadRequestException,
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
    const userId = req.user.id || req.user.sub;
    const result = await this.authService.updateMe(userId, body);
    return { success: true, data: result };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('avatar')
  async uploadAvatar(@Req() req: any, @Body() body: any) {
    let fileBuffer: Buffer | null = null;
    let filename = 'avatar.png';

    // 1. Check if sent as base64 in body (JSON)
    if (body?.fileData) {
      const base64Data = body.fileData.includes(';base64,')
        ? body.fileData.split(';base64,')[1]
        : body.fileData;
      fileBuffer = Buffer.from(base64Data, 'base64');
      filename = body.fileName || filename;
    }

    // 2. Check if multipart/form-data
    if (!fileBuffer && typeof req.isMultipart === 'function' && req.isMultipart()) {
      try {
        const file = await req.file();
        if (file) {
          fileBuffer = await file.toBuffer();
          filename = file.filename || filename;
        }
      } catch (err: any) {
        throw new BadRequestException(
          `Failed to read multipart upload: ${err?.message || err}`,
        );
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('No image file was provided');
    }

    const userId = req.user.id || req.user.sub;
    const result = await this.authService.uploadAvatar(
      userId,
      fileBuffer,
      filename,
    );

    return { success: true, data: result };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('onboarding')
  async onboarding(@Req() req: any, @Body() body: any) {
    let companyName = body?.companyName || '';
    let logoFile: { buffer: Buffer; filename?: string } | null = null;

    // 1. Check if multipart/form-data
    if (typeof req.isMultipart === 'function' && req.isMultipart()) {
      try {
        const parts = req.parts();
        for await (const part of parts) {
          if (part.type === 'file' && part.fieldname === 'logo') {
            const buffer = await part.toBuffer();
            if (buffer && buffer.length > 0) {
              logoFile = {
                buffer,
                filename: part.filename || 'logo.png',
              };
            }
          } else if (part.type === 'field' && part.fieldname === 'companyName') {
            companyName = part.value as string;
          }
        }
      } catch (err: any) {
        // Fall back to body if parts fail
      }
    }

    // 2. Check if sent as base64 in JSON body
    if (!logoFile && body?.logoData) {
      const base64Data = body.logoData.includes(';base64,')
        ? body.logoData.split(';base64,')[1]
        : body.logoData;
      logoFile = {
        buffer: Buffer.from(base64Data, 'base64'),
        filename: body.logoFilename || 'logo.png',
      };
    }

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
      { userId, name, email, companyName, logoFile },
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
