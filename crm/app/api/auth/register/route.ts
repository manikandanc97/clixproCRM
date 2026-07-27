import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { checkRateLimit, incrementRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-error";
import { registerSchema } from "@/shared/validations";

const REGISTER_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 attempts per hour
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);
    // Rate limit by IP for registration
    const identifier = `register_${ip}`;

    const rateLimit = await checkRateLimit(identifier, REGISTER_RATE_LIMIT);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, message: "Too many registration attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          }
        }
      );
    }

    // Increment rate limit for each registration attempt
    await incrementRateLimit(identifier, REGISTER_RATE_LIMIT);

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

      const newUser = await tx.user.create({
        data: {
          name,
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
  } catch (error) { return handleApiError(error); }
}
