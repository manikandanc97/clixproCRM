import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { extractClientIp } from "@/shared/lib/auth/utils";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: { message: "User already completed onboarding" } }, { status: 400 });
    }

    const body = await req.json();
    const { companyName } = body;
    
    if (!companyName) {
      return NextResponse.json({ success: false, error: { message: "Company Name is required" } }, { status: 400 });
    }

    const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const email = user.email!;

    const ip = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const data = await AuthService.register({ name, companyName, email, userId: user.id }, { ip, userAgent });

    return NextResponse.json({ success: true, data, message: "Onboarding successful" }, { status: 201 });
  } catch (error: any) {
    console.error("[ONBOARDING ERROR]", error);
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
