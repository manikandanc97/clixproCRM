import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { resetPasswordSchema } from "@/shared/validations";
import { checkRateLimit, incrementRateLimit, getClientIp } from "@/lib/rate-limit";

const RESET_PASSWORD_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes per IP
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    const ip = getClientIp(req);
    const identifier = `reset_pwd_${ip}`;

    const rateLimit = await checkRateLimit(identifier, RESET_PASSWORD_RATE_LIMIT);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }

    await incrementRateLimit(identifier, RESET_PASSWORD_RATE_LIMIT);

    // 1. Hash the token to compare with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Find user with this token and ensure it's not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the user password and invalidate the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password has been successfully reset.",
      },
      { status: 200 }
    );
  } catch (error: unknown) { return handleApiError(error); }
}
