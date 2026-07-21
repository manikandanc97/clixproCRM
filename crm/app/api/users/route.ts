import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getAuthUser(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("orbit_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { memberships: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.memberships.length) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const tenantId = authUser.memberships[0].tenantId;

    const users = await prisma.user.findMany({
      where: { memberships: { some: { tenantId } } },
      include: {
        memberships: {
          where: { tenantId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      role: u.memberships[0]?.role || "EMPLOYEE",
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: formattedUsers }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/users Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.memberships.length) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const adminRole = authUser.memberships[0].role;
    if (adminRole !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const tenantId = authUser.memberships[0].tenantId;
    const { name, email, password, role, status } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    
    let newUser;
    try {
      newUser = await prisma.$transaction(async (tx) => {
        let u = await tx.user.findUnique({ where: { email: normalizedEmail } });
        
        if (u) {
          const existingTenantUser = await tx.tenantUser.findUnique({
            where: { tenantId_userId: { tenantId, userId: u.id } }
          });
          if (existingTenantUser) {
            throw new Error("USER_EXISTS_IN_TENANT");
          }
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          u = await tx.user.create({
            data: {
              name,
              email: normalizedEmail,
              password: hashedPassword,
              status: status || "ACTIVE",
            },
          });
        }

        await tx.tenantUser.create({
          data: {
            tenantId,
            userId: u.id,
            role: role,
          },
        });

        return u;
      });
    } catch (txError: any) {
      if (txError.message === "USER_EXISTS_IN_TENANT") {
        return NextResponse.json({ success: false, message: "User is already an employee in this workspace" }, { status: 400 });
      }
      throw txError;
    }

    return NextResponse.json({ success: true, message: "User created successfully", user: { id: newUser.id } }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users Error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
