import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Tenant, User and TenantUser in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const tenantName = `${name}'s Workspace`;
      const tenantSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

      const newTenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
          plan: "premium", // default to premium for this SaaS
        },
      });

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

      const newUser = await tx.user.create({
        data: {
          name,
          firstName,
          lastName,
          displayName: name,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });

      await tx.tenantUser.create({
        data: {
          tenantId: newTenant.id,
          userId: newUser.id,
          role: "ADMIN",
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
