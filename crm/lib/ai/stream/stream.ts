import { ModelMessage, streamText } from 'ai';

/**
 * Standardized streaming configuration and handlers.
 * Kept separate from Providers to ensure we can swap underlying streaming logic easily.
 */
export class AIStreamManager {
  static createHeaders() {
    return {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };
  }

  /**
   * Prepares standard error payloads that match the Vercel AI SDK protocol,
   * so the frontend parses them beautifully instead of crashing.
   */
  static formatStreamError(error: any) {
    return {
      error: 'AI Platform Error',
      message: error.message || 'An unexpected error occurred in the AI backend.',
      code: error.code || 'INTERNAL_ERROR'
    };
  }
}
