import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
// import { verifyAuth } from '../../../../lib/auth-utils'; // Assuming this exists or we mock it

export async function GET(req: NextRequest) {
  try {
    // Basic auth check placeholder
    const tenantId = req.headers.get('x-tenant-id') || 'dev-tenant-1'; // Mock for development

    let config = await prisma.tenantAiConfig.findUnique({
      where: { tenantId }
    });

    if (!config) {
      config = await prisma.tenantAiConfig.create({
        data: {
          tenantId,
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          isAiEnabled: true
        }
      });
    }

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tenantId = req.headers.get('x-tenant-id') || 'dev-tenant-1';
    const body = await req.json();

    const config = await prisma.tenantAiConfig.upsert({
      where: { tenantId },
      update: {
        provider: body.provider,
        model: body.model,
        apiKey: body.apiKey, // In prod, encrypt this before saving
        temperature: body.temperature,
        isAiEnabled: body.isAiEnabled,
        useRag: body.useRag,
        useTools: body.useTools,
      },
      create: {
        tenantId,
        provider: body.provider || 'gemini',
        model: body.model || 'gemini-1.5-flash',
        apiKey: body.apiKey,
        temperature: body.temperature || 0.7,
        isAiEnabled: body.isAiEnabled ?? true,
        useRag: body.useRag ?? true,
        useTools: body.useTools ?? true,
      }
    });

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
