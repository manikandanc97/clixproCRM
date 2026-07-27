import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { getRolePermissions } from "@/shared/lib/auth/rbac/permissions";
import { checkRateLimit, incrementRateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-error";
import { loginSchema } from "@/shared/validations";

const LOGIN_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 failures allowed
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);
    const identifier = `login_${ip}_${normalizedEmail}`;

    const rateLimit = await checkRateLimit(identifier, LOGIN_RATE_LIMIT);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          }
        }
      );
    }

    // Regular DB Login
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      await incrementRateLimit(identifier, LOGIN_RATE_LIMIT);
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      await incrementRateLimit(identifier, LOGIN_RATE_LIMIT);
      return NextResponse.json(
        { success: false, message: "Account is inactive or suspended" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await incrementRateLimit(identifier, LOGIN_RATE_LIMIT);
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    resetRateLimit(identifier);

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
      env.JWT_SECRET,
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
          tenantId,
          permissions: getRolePermissions(role)
        },
      },
      { status: 200 }
    );
  } catch (error) { return handleApiError(error); }
}
