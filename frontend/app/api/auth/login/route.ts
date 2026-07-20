import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { getDemoAccountByEmail } from "@/shared/lib/demo-accounts";

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

    // Check for demo account
    const demoAccount = getDemoAccountByEmail(normalizedEmail);
    if (demoAccount) {
      if (password !== demoAccount.password) {
        return NextResponse.json(
          { success: false, message: "Invalid demo credentials" },
          { status: 400 }
        );
      }

      const token = jwt.sign(
        { id: `demo-${demoAccount.role}`, role: demoAccount.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      const cookieStore = await cookies();
      cookieStore.set("orbit_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json(
        {
          success: true,
          message: "Demo login successful",
          user: {
            id: `demo-${demoAccount.role}`,
            name: demoAccount.name,
            email: demoAccount.email,
            role: demoAccount.role,
          },
        },
        { status: 200 }
      );
    }

    // Regular DB Login
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { id: user.id },
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
