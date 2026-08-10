import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ success: false, message: "Invitation token is required" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { role: true, tenant: true },
    });

    if (!invitation) {
      return NextResponse.json({ success: false, message: "Invalid or expired invitation" }, { status: 404 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: "Invitation has expired" }, { status: 400 });
    }
    
    // Ensure the email matches the invitation email (case insensitive)
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
       return NextResponse.json({ success: false, message: "The logged in account email does not match the invitation email" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      // Upsert the User record to map Supabase auth.users.id
      const dbUser = await tx.user.upsert({
        where: { email: user.email },
        update: {
          id: user.id, // Explicitly map to Supabase user ID if they already exist
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        },
        create: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        },
      });

      // Link User to Tenant
      const existingMembership = await tx.tenantUser.findFirst({
        where: { tenantId: invitation.tenantId, userId: dbUser.id }
      });

      if (!existingMembership) {
        await tx.tenantUser.create({
          data: {
            tenantId: invitation.tenantId,
            userId: dbUser.id,
            roleId: invitation.roleId,
          }
        });
      } else {
        await tx.tenantUser.update({
          where: { id: existingMembership.id },
          data: { roleId: invitation.roleId, status: "ACTIVE" }
        });
      }

      // Delete the consumed invitation
      await tx.invitation.delete({
        where: { id: invitation.id }
      });
      
      // Log it
      await tx.auditLog.create({
        data: {
          tenantId: invitation.tenantId,
          userId: dbUser.id,
          action: "JOINED_TENANT",
          module: "Authentication",
          details: { method: "invitation_accepted", role: invitation.role.name }
        }
      });
    });

    return NextResponse.json({ success: true, message: "Invitation accepted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
