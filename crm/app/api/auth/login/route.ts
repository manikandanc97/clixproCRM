import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();


    // Regular DB Login
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }

    // Fetch memberships to determine role and tenant
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      include: { memberships: true },
    });
    
    const firstMembership = userWithRole?.memberships?.[0];
    const role = firstMembership?.role || "EMPLOYEE";
    const tenantId = firstMembership?.tenantId;

    const token = jwt.sign(
      { 
        id: user.id,
        role: role,
        tenantId: tenantId
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("orbit_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          role,
          tenantId
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
