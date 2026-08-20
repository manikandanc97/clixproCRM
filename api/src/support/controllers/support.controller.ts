import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SupportService } from '../services/support.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIp,
} from '../../common/utils/rate-limit.util';
import * as path from 'path';

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.pdf',
  '.txt',
  '.log',
  '.json',
  '.csv',
]);

const MAX_INDIVIDUAL_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_ATTACHMENTS_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_ATTACHMENTS_COUNT = 5;

const SUPPORT_RATE_LIMIT = { maxRequests: 5, windowMs: 10 * 60 * 1000 }; // 5 tickets per 10 mins

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('ticket')
  async createTicket(@Req() req: any, @Res() res: any) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    const ip = getClientIp(req);
    const identifier = `support_${userId}_${ip}`;

    const rateLimit = await checkRateLimit(identifier, SUPPORT_RATE_LIMIT);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil(
        (rateLimit.resetTime - Date.now()) / 1000,
      );
      res.header('Retry-After', retryAfterSeconds.toString());
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many support tickets submitted. Please try again later.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      const fastifyReq = req;
      if (!fastifyReq.isMultipart()) {
        throw new BadRequestException('Request must be multipart/form-data');
      }

      let subject = '';
      let category = '';
      let priority = '';
      let description = '';
      let diagnosticsStr = '';
      const attachments: { filename: string; content: Buffer }[] = [];
      let totalSize = 0;

      const parts = fastifyReq.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          if (attachments.length >= MAX_ATTACHMENTS_COUNT) {
            throw new BadRequestException(
              `Maximum of ${MAX_ATTACHMENTS_COUNT} attachments allowed per ticket`,
            );
          }

          const ext = path.extname(part.filename || '').toLowerCase();
          if (!ALLOWED_EXTENSIONS.has(ext)) {
            throw new BadRequestException(
              `File type '${ext || 'unknown'}' is not permitted. Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
            );
          }

          const buffer = await part.toBuffer();
          if (buffer.length > MAX_INDIVIDUAL_FILE_SIZE) {
            throw new BadRequestException(
              `File '${part.filename}' exceeds the 10MB size limit`,
            );
          }

          totalSize += buffer.length;
          if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
            throw new BadRequestException(
              'Total attachments size exceeds the 25MB limit',
            );
          }

          const sanitizedFilename = path
            .basename(part.filename || 'attachment')
            .replace(/[^a-zA-Z0-9._-]/g, '_');

          attachments.push({ filename: sanitizedFilename, content: buffer });
        } else {
          if (part.fieldname === 'subject') subject = String(part.value || '').trim();
          if (part.fieldname === 'category') category = String(part.value || '').trim();
          if (part.fieldname === 'priority') priority = String(part.value || '').trim();
          if (part.fieldname === 'description') description = String(part.value || '').trim();
          if (part.fieldname === 'diagnostics') diagnosticsStr = String(part.value || '').trim();
        }
      }

      if (!subject || !description) {
        throw new BadRequestException('Subject and description are required');
      }

      let diagnostics: any = {};
      if (diagnosticsStr) {
        try {
          diagnostics = JSON.parse(diagnosticsStr);
        } catch {
          diagnostics = {};
        }
      }

      // Attach authenticated user identity to diagnostics
      diagnostics.email = req.user?.email || diagnostics.email;
      diagnostics.userId = userId;

      await incrementRateLimit(identifier, SUPPORT_RATE_LIMIT);

      const data = await this.supportService.sendSupportTicket(
        subject,
        category || 'General',
        priority || 'Medium',
        description,
        diagnostics,
        attachments,
      );

      return res.status(200).send({
        success: true,
        ticketId: data.ticketId,
        estimatedResponseTime: data.estimatedResponseTime,
      });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, error: error.message || 'Failed to process ticket' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
