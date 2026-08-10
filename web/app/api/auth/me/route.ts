import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      // Check if user is authenticated in Supabase but missing in Prisma
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return NextResponse.json({ success: false, error: "NEEDS_ONBOARDING" }, { status: 403 });
      }

      return NextResponse.json({ success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        memberships: {
          where: { tenantId: session.tenantId },
          include: { role: { include: { permissions: true } } },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ success: false, error: "NEEDS_ONBOARDING" }, { status: 403 });
    }

    const membership = user.memberships[0];
    const roleName = membership.role.name;
    const permissions = membership.role.permissions
      .filter((rp) => rp.hasAccess)
      .map((rp) => rp.module);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          tenantId: membership.tenantId,
          role: roleName,
          permissions,
        },
      },
    });
  } catch (error) {
    console.error("[ME ERROR]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const body = await req.json();
    const { name, phone } = body;

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      },
    });

    return NextResponse.json({ success: true, data: { user: updated } });
  } catch (error) {
    console.error("[ME PATCH ERROR]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
