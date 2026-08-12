import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AiService } from './ai.service';
import { SupabaseAuthGuard } from '../auth/supabase.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: any, @Res() res: FastifyReply) {
    const messages = body.messages || [];
    const model = body.model || 'gemini-1.5-flash';

    const streamResult = await this.aiService.generateStream(messages, model);

    res.raw.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    });

    streamResult.pipeTextStreamToResponse(res.raw);
  }
}
