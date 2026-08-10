import { UIMessage } from '@ai-sdk/react';

export interface AIStreamResult {
  /**
   * The streaming response payload that can be returned directly to Next.js
   * (e.g. standard Vercel AI SDK DataStreamResponse)
   */
  streamResponse: Response;
}

export interface GenerateOptions {
  model?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Record<string, unknown>;
}

export interface StreamOptions extends GenerateOptions {
  /**
   * Callback fired when the stream finishes. Useful for saving history.
   */
  onFinish?: (completion: string, metadata: Record<string, unknown>) => Promise<void> | void;
}

export interface AIProvider {
  /**
   * Initialize the provider with required credentials
   */
  init(apiKey: string): void;

  /**
   * Standard text generation (blocking)
   */
  chat(messages: UIMessage[], options?: GenerateOptions): Promise<string>;

  /**
   * Streaming text generation
   */
  stream(messages: UIMessage[], options?: StreamOptions): Promise<AIStreamResult>;

  generateEmbeddings?(chunks: string[]): Promise<number[][]>;

  /**
   * Embeddings generation
   */
  embed(texts: string[], model?: string): Promise<number[][]>;

  /**
   * High-level summarization abstraction
   */
  summarize(text: string): Promise<string>;
  
  /**
   * High-level tool calling abstraction
   */
  toolCall(messages: UIMessage[], tools: Record<string, unknown>): Promise<{ text: string; toolCalls: unknown[] }>;
}
