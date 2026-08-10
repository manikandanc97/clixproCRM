
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
  static formatStreamError(error: unknown) {
    const err = error as { message?: string; code?: string };
    return {
      error: 'AI Platform Error',
      message: err.message || 'An unexpected error occurred in the AI backend.',
      code: err.code || 'INTERNAL_ERROR'
    };
  }
}
