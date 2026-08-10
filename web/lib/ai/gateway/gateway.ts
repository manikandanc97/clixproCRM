import { UIMessage } from '@ai-sdk/react';
import { AIProvider } from '../types/provider';
import { GeminiProvider } from '../providers/gemini';
import { validateAiEnvironment } from '../utils/env';
import { AIPrompts } from '../prompts/prompt';
import { AIStreamManager } from '../stream/stream';

export interface GatewayExecutionParams {
  messages: UIMessage[];
  tenantId: string;
  userId: string;
  stream?: boolean;
}

/**
 * AI Gateway
 * The central orchestration layer for all AI requests.
 * Enforces security, validates environment, resolves the active provider, and handles stream routing.
 */
export class AIGateway {
  private static resolveProvider(): AIProvider {
    // Validate environment variables first. Throws if critical secrets are missing.
    const { googleApiKey } = validateAiEnvironment();

    // In a future multi-provider setup, you would check tenant preferences here
    // e.g., if (tenant.prefersOpenAI) return new OpenAIProvider(...)
    
    const provider = new GeminiProvider();
    provider.init(googleApiKey);
    
    return provider;
  }

  static async generateEmbeddings(tenantId: string, chunks: string[]): Promise<number[][]> {
    const provider = this.resolveProvider();
    if (!provider.embed) {
      throw new Error('Provider does not support embeddings');
    }
    return provider.embed(chunks);
  }

  static async execute(params: GatewayExecutionParams): Promise<Response> {
    try {
      const provider = this.resolveProvider();
      
      const systemPrompt = AIPrompts.getEnterpriseAssistantPrompt();

      if (params.stream) {
        // Handle streaming response using standard Vercel AI SDK wrappers
        const result = await provider.stream(params.messages, {
          system: systemPrompt,
          temperature: 0.7,
          // tools will be dynamically injected here in future implementations
        });
        
        return result.streamResponse;
      } else {
        // Handle blocking text response
        const text = await provider.chat(params.messages, {
          system: systemPrompt,
          temperature: 0.7,
        });
        
        return new Response(JSON.stringify({ text }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    } catch (error: unknown) {
      console.error('[AI Gateway Error]:', error);
      
      // Never silently fail. Return a robust error payload to the client.
      const errorPayload = AIStreamManager.formatStreamError(error);
      const httpError = error as { status?: number };
      
      return new Response(JSON.stringify(errorPayload), { 
        status: httpError.status || 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }
}
