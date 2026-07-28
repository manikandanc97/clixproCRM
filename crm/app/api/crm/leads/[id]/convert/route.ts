import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    const resolvedParams = await params;
    const leadId = resolvedParams.id;
    const tenantId = session.tenantId;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, tenantId, deletedAt: null }
    });

    if (!lead) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    const customer = await prisma.$transaction(async (tx) => {
      if (lead.status !== "WON") {
        await tx.lead.update({
          where: { id: leadId },
          data: { status: "WON" }
        });
      }

      if (lead.email) {
        const existingCustomer = await tx.customer.findFirst({
          where: { tenantId, email: lead.email, deletedAt: null }
        });
        if (existingCustomer) return existingCustomer;
      }

      return tx.customer.create({
        data: {
          tenantId,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          revenue: lead.value,
          status: "ACTIVE",
          assignedToId: lead.assignedToId
        }
      });
    });

    return NextResponse.json({ success: true, message: "Lead converted to customer", data: customer }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
