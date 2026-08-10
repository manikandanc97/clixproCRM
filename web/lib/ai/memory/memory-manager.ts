import prisma from '../../prisma';
import { ModelMessage } from 'ai';

export class MemoryManager {
  static async loadConversation(conversationId: string, tenantId: string, userId: string): Promise<ModelMessage[]> {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id: conversationId, tenantId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50 // Only fetch the last 50 messages to prevent context overflow
        }
      }
    });

    if (!conversation) {
      return [];
    }

    const coreMessages: ModelMessage[] = [];

    // If there's a summary, inject it as a system message at the start
    if (conversation.summary) {
      coreMessages.push({
        role: 'system',
        content: `Previous Conversation Summary: ${conversation.summary}`
      });
    }

    for (const msg of conversation.messages) {
      if (msg.role === 'tool') continue; // Tool messages have complex parts, skipping for simple text memory
      coreMessages.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      });
    }

    return coreMessages as ModelMessage[];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async saveMessage(conversationId: string, role: string, content: string, toolCalls?: any) {
    await prisma.aiMessage.create({
      data: {
        conversationId,
        role,
        content,
        toolCalls,
      }
    });
  }

  static async createConversation(tenantId: string, userId: string, title?: string) {
    return await prisma.aiConversation.create({
      data: {
        tenantId,
        userId,
        title: title || 'New Chat'
      }
    });
  }
}
