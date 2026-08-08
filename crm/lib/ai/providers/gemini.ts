import { AIProvider, AIStreamResult, GenerateOptions, StreamOptions } from '../types/provider';
import { generateText, streamText, embedMany } from 'ai';
import { UIMessage } from '@ai-sdk/react';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export class GeminiProvider implements AIProvider {
  private googleAi!: ReturnType<typeof createGoogleGenerativeAI>;

  init(apiKey: string): void {
    if (!apiKey) throw new Error('API key is required to initialize GeminiProvider');
    this.googleAi = createGoogleGenerativeAI({
      apiKey,
    });
  }

  async chat(messages: UIMessage[], options?: GenerateOptions): Promise<string> {
    if (!this.googleAi) throw new Error('GeminiProvider not initialized');
    const coreMessages = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.parts ? m.parts.map((p: any) => p.text).join('') : (m.content || ''),
    }));
    
    const { text } = await generateText({
      model: this.googleAi(options?.model || 'gemini-3.6-flash'),
      messages: coreMessages,
      system: options?.system,
      temperature: options?.temperature,
      tools: options?.tools as any,
    });
    
    return text;
  }

  async stream(messages: UIMessage[], options?: StreamOptions): Promise<AIStreamResult> {
    if (!this.googleAi) throw new Error('GeminiProvider not initialized');

    const coreMessages = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.parts ? m.parts.map((p: any) => p.text).join('') : (m.content || ''),
    }));

    const result = streamText({
      model: this.googleAi(options?.model || 'gemini-3.6-flash'),
      messages: coreMessages,
      system: options?.system,
      temperature: options?.temperature,
      tools: options?.tools as any,
      onError: (err: any) => {
        require('fs').appendFileSync('stream-error.log', 'STREAM ERROR: ' + (err?.error?.message || err?.message || JSON.stringify(err)) + '\n');
      },
      onFinish: async (event) => {
        if (options?.onFinish) {
          await options.onFinish(event.text, { usage: event.usage, finishReason: event.finishReason });
        }
      }
    });

    const { toUIMessageStream, createUIMessageStreamResponse } = await import('ai');

    const uiStream = toUIMessageStream({
      stream: result.stream,
    });

    return {
      streamResponse: createUIMessageStreamResponse({ stream: uiStream })
    };
  }

  async embed(texts: string[], model?: string): Promise<number[][]> {
    if (!this.googleAi) throw new Error('GeminiProvider not initialized');
    
    const { embeddings } = await embedMany({
      model: this.googleAi.textEmbeddingModel(model || 'text-embedding-004'),
      values: texts,
    });

    return embeddings;
  }

  async summarize(text: string): Promise<string> {
    if (!this.googleAi) throw new Error('GeminiProvider not initialized');

    const { text: summary } = await generateText({
      model: this.googleAi('gemini-3.6-flash'),
      prompt: `Summarize the following text concisely:\n\n${text}`,
      temperature: 0.3,
    });

    return summary;
  }

  async toolCall(messages: UIMessage[], tools: Record<string, any>): Promise<any> {
    if (!this.googleAi) throw new Error('GeminiProvider not initialized');

    const coreMessages = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.parts ? m.parts.map((p: any) => p.text).join('') : (m.content || ''),
    }));

    const { text, toolCalls } = await generateText({
      model: this.googleAi('gemini-3.6-flash'),
      messages: coreMessages,
      tools,
      temperature: 0.1,
    });

    return { text, toolCalls };
  }
}
