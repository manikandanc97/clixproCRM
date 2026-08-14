import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, generateText, convertToModelMessages, isStepCount } from 'ai';
import { ConfigService } from '@nestjs/config';
import { tool } from 'ai';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private googleAi;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.googleAi = createGoogleGenerativeAI({ apiKey });
    }
  }

  async generateStream(
    messages: any[],
    modelName = 'gemini-3.5-flash',
    tenantId?: string,
  ): Promise<any> {
    if (!this.googleAi) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured on the backend',
      );
    }

    try {
      const tools = this.getTools(tenantId);
      const sanitizedMessages = messages.map(m => {
        if (!m.parts && m.content) {
          return { ...m, parts: [{ type: 'text', text: m.content }] };
        }
        return m;
      });
      const coreMessages = await convertToModelMessages(sanitizedMessages, { tools });

      const result = await streamText({
        model: this.googleAi(modelName),
        messages: coreMessages,
        temperature: 0.7,
        stopWhen: isStepCount(5),
        system: `You are an expert CRM assistant for ClixProCRM. You help users manage their pipeline, customers, and daily tasks efficiently. Maintain a professional, helpful, and concise tone. Today's date is ${new Date().toISOString().split('T')[0]}. Use the provided tools to query real database information when asked about deals, revenue, customers, tasks, etc. Use Indian Rupees (₹) for currency values by default unless specified otherwise.`,
        tools,
        onStepFinish: (event) => {
          console.log('\n[AI_CHAT] stage: onStepFinish');
          console.log('[AI_CHAT] step toolCalls:', JSON.stringify(event.toolCalls, null, 2));
          console.log('[AI_CHAT] step toolResults:', JSON.stringify(event.toolResults, null, 2));
          console.log('[AI_CHAT] step finishReason:', event.finishReason);
          console.log('[AI_CHAT] step usage:', event.usage);
        },
        onFinish: (event) => {
          console.log('\n[AI_CHAT] stage: onFinish');
          console.log('[AI_CHAT] final finishReason:', event.finishReason);
          console.log('[AI_CHAT] response successfully finished.');
        }
      });

      return result;
    } catch (error: any) {
      console.error('[AI CHAT ERROR] generateStream failed:', error);
      if (error.stack) {
        console.error('[AI CHAT ERROR] Stack:', error.stack);
      }
      return { 
        pipeUIMessageStreamToResponse: async (res: any) => {
          if (res.statusCode === 200) {
            res.statusCode = 500;
          }
          res.end(JSON.stringify({ error: error.toString(), stack: error.stack }));
        }
      };
    }
  }

  async generateText(
    messages: any[],
    modelName = 'gemini-3.5-flash',
    tenantId?: string,
  ): Promise<any> {
    if (!this.googleAi) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured on the backend',
      );
    }

    try {
      const tools = this.getTools(tenantId);
      const sanitizedMessages = messages.map(m => {
        if (!m.parts && m.content) {
          return { ...m, parts: [{ type: 'text', text: m.content }] };
        }
        return m;
      });
      const coreMessages = await convertToModelMessages(sanitizedMessages, { tools });

      const result = await generateText({
        model: this.googleAi(modelName),
        messages: coreMessages,
        temperature: 0.7,
        stopWhen: isStepCount(5),
        system: `You are an expert CRM assistant for ClixProCRM. You help users manage their pipeline, customers, and daily tasks efficiently. Maintain a professional, helpful, and concise tone. Today's date is ${new Date().toISOString().split('T')[0]}. Use the provided tools to query real database information when asked about deals, revenue, customers, tasks, etc. Use Indian Rupees (₹) for currency values by default unless specified otherwise.`,
        tools,
      });

      return result.text;
    } catch (error: any) {
      console.error('[AI CHAT ERROR] generateText failed:', error);
      if (error.stack) {
        console.error('[AI CHAT ERROR] Stack:', error.stack);
      }
      throw new InternalServerErrorException(
        'Failed to generate AI text',
        error?.toString(),
      );
    }
  }

  private getTools(tenantId?: string) {
    return {
      getDealsSummary: tool({
        description: 'Get summary statistics of deals and pipeline revenue in the CRM. Can optionally filter by date range.',
        parameters: z.object({
          startDate: z.string().optional().describe('ISO date string (YYYY-MM-DD) for start of period'),
          endDate: z.string().optional().describe('ISO date string (YYYY-MM-DD) for end of period')
        }),
        execute: async (args: { startDate?: string, endDate?: string }) => {
          try {
            const { startDate, endDate } = args;
            if (!tenantId) {
              return { error: 'Tenant ID not provided. Cannot fetch data.' };
            }
            const whereClause: any = { tenantId, deletedAt: null };
            if (startDate || endDate) {
              whereClause.createdAt = {};
              if (startDate) whereClause.createdAt.gte = new Date(startDate);
              if (endDate) whereClause.createdAt.lte = new Date(endDate);
            }
            const deals = await this.prisma.deal.findMany({ where: whereClause });
            
            const totalDeals = deals.length;
            const wonDeals = deals.filter(d => d.stage === 'WON');
            const pipelineValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
            const wonRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

            return {
              totalDeals,
              pipelineValue,
              wonDealsCount: wonDeals.length,
              wonRevenue,
              dealsByStage: deals.reduce((acc: any, d) => {
                acc[d.stage] = (acc[d.stage] || 0) + 1;
                return acc;
              }, {})
            };
          } catch (e: any) {
            return { error: 'Failed to fetch deals summary.', details: e.message };
          }
        },
      } as any),
      getTopDeals: tool({
        description: 'Get a list of the top deals by value. Optionally filter by stage or date range.',
        parameters: z.object({
          limit: z.number().optional().describe('Maximum number of deals to return. Default is 5.'),
          stage: z.string().optional().describe('Deal stage to filter by, e.g. WON, NEW, PROPOSAL, etc.'),
          startDate: z.string().optional().describe('ISO date string for start of period'),
          endDate: z.string().optional().describe('ISO date string for end of period')
        }),
        execute: async (args: { limit?: number, stage?: string, startDate?: string, endDate?: string }) => {
          try {
            const { limit = 5, stage, startDate, endDate } = args;
            if (!tenantId) {
              return { error: 'Tenant ID not provided.' };
            }
            const whereClause: any = { tenantId, deletedAt: null };
            if (stage) whereClause.stage = stage;
            if (startDate || endDate) {
              whereClause.createdAt = {};
              if (startDate) whereClause.createdAt.gte = new Date(startDate);
              if (endDate) whereClause.createdAt.lte = new Date(endDate);
            }
            const deals = await this.prisma.deal.findMany({
              where: whereClause,
              orderBy: { value: 'desc' },
              take: limit,
              select: { id: true, name: true, value: true, stage: true, expectedCloseDate: true, company: { select: { name: true } } }
            });
            return deals.map(d => ({
              ...d,
              value: d.value ? Number(d.value) : 0,
              expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.toISOString() : null,
            }));
          } catch (e: any) {
            return { error: 'Failed to fetch top deals.', details: e.message };
          }
        }
      } as any),
      getQuotations: tool({
        description: 'Get a list of quotations. Can filter by status (e.g. PENDING, APPROVED, DRAFT, SENT).',
        parameters: z.object({
          limit: z.number().optional().describe('Maximum number of quotations to return. Default is 5.'),
          status: z.string().optional().describe('Quotation status to filter by, e.g. PENDING, APPROVED, EXPIRED, DRAFT, SENT, VIEWED.')
        }),
        execute: async (args: { limit?: number, status?: string }) => {
          try {
            const { limit = 5, status } = args;
            if (!tenantId) return { error: 'Tenant ID not provided.' };
            const whereClause: any = { tenantId, deletedAt: null };
            if (status) whereClause.status = status;
            const quotations = await this.prisma.quotation.findMany({
              where: whereClause,
              orderBy: { createdAt: 'desc' },
              take: limit,
              select: { quoteNumber: true, client: true, amount: true, status: true, validTill: true }
            });
            return quotations.map(q => ({
              ...q,
              amount: q.amount ? Number(q.amount) : 0,
              validTill: q.validTill ? q.validTill.toISOString() : null,
            }));
          } catch (e: any) {
            return { error: 'Failed to fetch quotations.', details: e.message };
          }
        }
      } as any),
      getLeads: tool({
        description: 'Get a list of leads. Use this when the user asks for leads, hot leads, or leads to follow up on.',
        parameters: z.object({
          limit: z.number().optional().describe('Maximum number of leads to return. Default is 5.'),
          priority: z.string().optional().describe('Lead priority to filter by (e.g. HIGH, MEDIUM, LOW)'),
          stage: z.string().optional().describe('Lead stage to filter by (e.g. NEW, CONTACTED, PROPOSAL_SENT)'),
          isConverted: z.boolean().optional().describe('Filter by converted status')
        }),
        execute: async (args: { limit?: number, priority?: string, stage?: string, isConverted?: boolean }) => {
          try {
            const { limit = 5, priority, stage, isConverted } = args;
            if (!tenantId) return { error: 'Tenant ID not provided.' };
            const whereClause: any = { tenantId, deletedAt: null };
            if (priority) whereClause.priority = priority;
            if (stage) whereClause.stage = stage;
            if (isConverted !== undefined) whereClause.isConverted = isConverted;
            const leads = await this.prisma.lead.findMany({
              where: whereClause,
              orderBy: { createdAt: 'desc' },
              take: limit,
              select: { id: true, name: true, company: true, email: true, value: true, priority: true, stage: true }
            });
            return leads.map(l => ({
              ...l,
              value: l.value ? Number(l.value) : 0,
            }));
          } catch (e: any) {
            return { error: 'Failed to fetch leads.', details: e.message };
          }
        }
      } as any),
    };
  }
}
