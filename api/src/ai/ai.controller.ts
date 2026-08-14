import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AiService } from './ai.service';
import { SupabaseAuthGuard } from '../auth/supabase.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: any, @Res() res: FastifyReply, @Req() req: any) {
    try {
      const messages = body.messages || [];
      const model = body.model || 'gemini-flash-latest';
      const tenantId = body.tenantId || req.headers['x-tenant-id'];

      const streamResult = await this.aiService.generateStream(messages, model, tenantId);

      const origin = req.headers.origin || '*';
      res.raw.setHeader('Access-Control-Allow-Origin', origin);
      res.raw.setHeader('Access-Control-Allow-Credentials', 'true');
      res.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id');

      // pipeUIMessageStreamToResponse might be synchronous or return a Promise
      const pipePromise = streamResult.pipeUIMessageStreamToResponse(res.raw);
      if (pipePromise && pipePromise.catch) {
        pipePromise.catch((error: any) => {
          console.error('[AI CHAT ERROR] Error during streaming:', error);
          if (error.stack) console.error('[AI CHAT ERROR] Stack:', error.stack);
        });
      }
    } catch (e: any) {
      console.error('[AI CHAT ERROR] Unhandled controller error:', e);
      res.status(500).send({ error: e.message || 'Internal Controller Error', stack: e.stack });
    }
  }
}
