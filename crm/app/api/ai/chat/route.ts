import { NextRequest } from 'next/server';
import { AIGateway } from '../../../../lib/ai/gateway/gateway';
import { UIMessage } from '@ai-sdk/react';

/**
 * ULTRA-THIN API ROUTE
 * This route purely parses the incoming request and passes it to the AI Gateway.
 * All logic, validation, security, and provider routing is handled by the Gateway.
 */
export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ status: 'AI Gateway is online. Use POST to chat.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[DEBUG API Route] Received body:', JSON.stringify(body));
    const messages = body.messages;
    const tenantId = body.tenantId || 'dev-tenant-1';
    const userId = body.userId || 'dev-user-1';

    // Execute through the Gateway. The Gateway handles streaming internally.
    const streamResponse = await AIGateway.execute({
      tenantId,
      userId,
      messages: messages as UIMessage[],
      stream: true
    });

    return streamResponse;
    
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

// trigger rebuild

console.log('REBUILT ROUTE.TS');

console.log('API_KEY_PREFIX:', process.env.GOOGLE_API_KEY?.substring(0, 10));
