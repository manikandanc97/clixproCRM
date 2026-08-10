import { NextRequest } from 'next/server';
import { AIGateway } from '../../../../lib/ai/gateway/gateway';
import { UIMessage } from '@ai-sdk/react';
import { getAuthSession } from "@/lib/auth-utils";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(_req: NextRequest) {
  return new Response(JSON.stringify({ status: 'AI Gateway is online. Use POST to chat.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const ip = getClientIp(req);
    const identifier = `ai_${session.tenantId}_${session.userId}_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.AI);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests', message: 'AI limit exceeded.' }), { status: 429 });
    }
    await incrementRateLimit(identifier, RATE_LIMITS.AI);

    const body = await req.json();
    const messages = body.messages;
    const tenantId = session.tenantId;
    const userId = session.userId;

    // Execute through the Gateway. The Gateway handles streaming internally.
    const streamResponse = await AIGateway.execute({
      tenantId,
      userId,
      messages: messages as UIMessage[],
      stream: true
    });

    return streamResponse;
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Top-level fallback for catastrophic request parsing errors
    console.error('[API Route Catastrophic Error]:', error);
    return new Response(JSON.stringify({ 
      error: 'Invalid Request',
      message: 'Failed to process the AI request payload.',
      code: 'BAD_REQUEST'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
