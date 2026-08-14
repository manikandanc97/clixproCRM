import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './src/prisma/prisma.service';
import { AiService } from './src/ai/ai.service';

async function bootstrap() {
  const config = new ConfigService();
  const prisma = {
    deal: { findMany: async () => [] },
    quotation: { findMany: async () => [] },
    lead: { findMany: async () => [] },
  } as any;
  const aiService = new AiService(config, prisma);
  
  try {
    const messages = [{ role: 'user', content: 'hi' }];
    const stream = await aiService.generateStream(messages, 'gemini-3.5-flash', 'dev-tenant-1');
    console.log('Stream proto:', Object.getOwnPropertyNames(Object.getPrototypeOf(stream)));
  } catch (error: any) {
    console.error('Error generating stream:', error);
    if (error.stack) console.error(error.stack);
  }
}

bootstrap();
