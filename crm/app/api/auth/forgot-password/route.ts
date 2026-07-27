import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { handleApiError } from "@/lib/api-error";
import { forgotPasswordSchema } from "@/shared/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user (never reveal if exists to the client)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && user.status === "ACTIVE") {
      // 2. Generate secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // 3. Hash the token for DB storage (SHA-256 allows querying later)
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // 4. Set token expiry (e.g., 1 hour from now)
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // 5. Update user in the database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: tokenExpiry,
        },
      });

      // 6. Send the email (Mocked as no email infrastructure exists in this repo)
      const resetUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`;
      
      console.log(
        `[EMAIL MOCK] Sending password reset link to ${user.email}:\n${resetUrl}`
      );
    } else if (user) {
        console.log(`[EMAIL MOCK] Reset password requested for inactive user: ${user.email}`);
    }

    // 7. Return generic success regardless of whether the email exists
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with that email exists, we have sent a password reset link.",
      },
      { status: 200 }
    );
  } catch (error: unknown) { return handleApiError(error); }
}
