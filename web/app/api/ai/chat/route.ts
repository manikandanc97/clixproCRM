import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  isStepCount,
} from 'ai';
import { getMcpTools } from '@/lib/mcp/mcp-client';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getApiKey(): string | undefined {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

function sanitizeMessages(messages: any[]): any[] {
  return (messages || []).map((m) => {
    if (typeof m === 'string') {
      return { role: 'user', parts: [{ type: 'text', text: m }] };
    }
    if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
      return m;
    }
    if (typeof m.content === 'string') {
      return { ...m, role: m.role || 'user', parts: [{ type: 'text', text: m.content }] };
    }
    if (Array.isArray(m.content)) {
      return { ...m, role: m.role || 'user', parts: m.content };
    }
    return { ...m, role: m.role || 'user', parts: [{ type: 'text', text: '' }] };
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Session & Token Authentication Validation
    let authToken: string | undefined;

    // Check Bearer Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7).trim();
    }

    // Fallback to Supabase Server Cookie Session
    if (!authToken) {
      try {
        const supabase = await createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          authToken = session.access_token;
        }
      } catch {
        // Cookie resolution fallback
      }
    }

    if (!authToken) {
      return NextResponse.json(
        {
          error:
            'Unauthorized: Valid Supabase authentication session is required to access ClixPro AI.',
        },
        { status: 401 }
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'AI Service Configuration Error: GOOGLE_API_KEY is not configured on the server.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const rawMessages = body.messages || [];
    const correlationId =
      req.headers.get('x-correlation-id') ||
      req.headers.get('x-request-id') ||
      `req_${crypto.randomUUID()}`;

    // 2. Instantiate Google AI Provider
    const google = createGoogleGenerativeAI({ apiKey });

    // 3. Build Authorized MCP Tools Bound to User Context
    const mcpContext = {
      authToken,
      correlationId,
    };
    const tools = getMcpTools(mcpContext);

    // 4. Token-Optimized System Prompt Enforcement
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = `You are ClixPro AI, the CRM assistant for ClixProCRM.
Current Date: ${today}.
Default Currency: INR (₹).

RESPONSE & TOKEN RULES:
1. Answer ONLY the user's exact question. Keep responses ultra-concise, direct, and token-efficient.
2. No conversational filler, no greetings (except when user greets), no background, and do not repeat the user's question.
3. For simple questions, answer in 1-3 short sentences. For data queries, return only the requested data.
4. If information is not found in the CRM, say: "I couldn't find that information." Never hallucinate data.
5. For read operations, invoke the appropriate tool to fetch live CRM data.
6. For write operations (create/update), ask for explicit confirmation with proposed values before executing with confirmed=true.
7. Never expose sensitive tokens, passwords, secrets, internal IDs, or database internals.
8. Avoid complex markdown unless it enhances readability.`;

    const sanitized = sanitizeMessages(rawMessages);
    const modelMessages = await convertToModelMessages(sanitized, { tools });

    const modelName = process.env.AI_MODEL || 'gemini-3.6-flash';

    // 5. Orchestrate AI Stream
    const result = await streamText({
      model: google(modelName),
      messages: modelMessages,
      system: systemPrompt,
      tools,
      stopWhen: isStepCount(5),
      temperature: 0.7,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        tools,
        onError: (streamError: any) => {
          const message = streamError?.message || String(streamError) || 'AI stream error occurred';
          console.error('[AI Stream Error]:', message);
          return message;
        },
      }),
    });
  } catch (error: any) {
    console.error('[AI Chat Route Error]:', error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          'An unexpected error occurred while communicating with the AI service.',
      },
      { status: 500 }
    );
  }
}
