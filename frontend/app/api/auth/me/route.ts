import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("orbit_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { id: string; role?: string };


    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        memberships: {
          include: {
            tenant: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          displayName: user.displayName || user.name,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          role: user.memberships?.[0]?.role || "EMPLOYEE",
          memberships: user.memberships,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Auth /me Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 401 }
    );
  }
}
