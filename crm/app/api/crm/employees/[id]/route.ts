import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
      include: { user: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const userData: any = { name, email };
      
      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      await tx.user.update({
        where: { id: id },
        data: userData,
      });

      if (role) {
        await tx.tenantUser.update({
          where: { id: existingUser.id },
          data: { role },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update employee:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update employee status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.tenantUser.findFirst({
      where: { userId: id, tenantId: session.tenantId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.tenantUser.delete({
        where: { id: existingUser.id },
      }),
      prisma.user.delete({
        where: { id: id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
