import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

/**
 * SECURITY: tenantId is ALWAYS derived from the authenticated Supabase session.
 * No x-tenant-id header, no client-controlled tenant identification.
 * Unauthenticated requests → 401.
 * Cross-tenant access → impossible (tenantId scoped to authenticated user).
 */
async function getSessionTenantId(): Promise<{ userId: string; tenantId: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        status: true,
        memberships: {
          select: { tenantId: true },
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (
      !userRecord ||
      userRecord.status !== 'ACTIVE' ||
      userRecord.memberships.length === 0
    ) {
      return null;
    }

    return {
      userId: userRecord.id,
      tenantId: userRecord.memberships[0].tenantId,
    };
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getSessionTenantId();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let config = await prisma.tenantAiConfig.findUnique({
      where: { tenantId: session.tenantId },
    });

    if (!config) {
      config = await prisma.tenantAiConfig.create({
        data: {
          tenantId: session.tenantId,
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          isAiEnabled: true,
        },
      });
    }

    // Never expose the raw apiKey to the client — return a masked version
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? '***' : null,
    };

    return NextResponse.json({ config: safeConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionTenantId();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Build the update payload — never allow tenantId from body
    const updateData: any = {};
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.apiKey !== undefined) updateData.apiKey = body.apiKey; // TODO: encrypt before storing
    if (body.temperature !== undefined) updateData.temperature = body.temperature;
    if (body.isAiEnabled !== undefined) updateData.isAiEnabled = body.isAiEnabled;
    if (body.useRag !== undefined) updateData.useRag = body.useRag;
    if (body.useTools !== undefined) updateData.useTools = body.useTools;

    const config = await prisma.tenantAiConfig.upsert({
      where: { tenantId: session.tenantId },
      update: updateData,
      create: {
        tenantId: session.tenantId,
        provider: body.provider || 'gemini',
        model: body.model || 'gemini-1.5-flash',
        apiKey: body.apiKey,
        temperature: body.temperature ?? 0.7,
        isAiEnabled: body.isAiEnabled ?? true,
        useRag: body.useRag ?? true,
        useTools: body.useTools ?? true,
      },
    });

    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? '***' : null,
    };

    return NextResponse.json({ config: safeConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
