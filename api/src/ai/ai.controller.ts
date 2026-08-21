import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AiService } from './ai.service';
import { AiSecurityService } from './ai-security.service';
import { SupabaseAuthGuard } from '../auth/supabase.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(SupabaseAuthGuard, TenantGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiSecurityService: AiSecurityService,
  ) {}

  @Post('chat')
  async chat(@Body() body: any, @Res() res: FastifyReply, @Req() req: any) {
    try {
      const messages = body.messages || [];
      const model = body.model || 'gemini-3.6-flash';

      // Tenant and User resolution STRICTLY from authenticated guards
      const tenantId = req.tenantId;
      const userId = req.user?.id || req.user?.sub;
      const userRole = req.userRole;
      const isSuperAdmin = req.isSuperAdmin || false;

      // Build full RBAC and hierarchy security context
      const securityContext =
        await this.aiSecurityService.buildSecurityContext(
          userId,
          tenantId,
          userRole,
          isSuperAdmin,
        );

      const streamResult = await this.aiService.generateStream(
        messages,
        model,
        securityContext,
      );

      // Pipe UI message stream to response (CORS is handled globally by NestJS middleware)
      const pipePromise = streamResult.pipeUIMessageStreamToResponse(res.raw);
      if (pipePromise && pipePromise.catch) {
        pipePromise.catch((error: any) => {
          console.error('[AI CHAT ERROR] Error during streaming:', error);
          if (error.stack) console.error('[AI CHAT ERROR] Stack:', error.stack);
        });
      }
    } catch (e: any) {
      console.error('[AI CHAT ERROR] Unhandled controller error:', e);
      res.status(500).send({
        error: e.message || 'Internal Controller Error',
      });
    }
  }
}
