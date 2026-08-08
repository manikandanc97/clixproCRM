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

    const body = await req.json();
    const { 
      customerId, customerName, customerEmail, 
      companyId, companyName, 
      dealName, dealValue, dealStage, expectedCloseDate, ownerId 
    } = body;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, tenantId, deletedAt: null }
    });

    if (!lead) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }
    
    if (lead.isConverted) {
      return NextResponse.json({ success: false, message: "Lead is already converted" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve Company
      let finalCompanyId = companyId;
      if (!finalCompanyId && companyName) {
        const newCompany = await tx.company.create({
          data: {
            tenantId,
            name: companyName,
            ownerId: ownerId || session.userId,
            status: "ACTIVE"
          }
        });
        finalCompanyId = newCompany.id;
      }

      // 2. Resolve Customer
      let finalCustomerId = customerId;
      if (!finalCustomerId && customerName) {
        // Try to find by email first if email is provided
        if (customerEmail) {
          const existing = await tx.customer.findFirst({
             where: { tenantId, email: customerEmail, deletedAt: null }
          });
          if (existing) {
             finalCustomerId = existing.id;
          }
        }
        
        if (!finalCustomerId) {
          const newCustomer = await tx.customer.create({
            data: {
              tenantId,
              name: customerName,
              email: customerEmail || lead.email,
              companyId: finalCompanyId, // Link to company
              company: companyName || lead.company || "", // Legacy field
              revenue: dealValue || lead.value,
              status: "ACTIVE",
              assignedToId: ownerId || session.userId
            }
          });
          finalCustomerId = newCustomer.id;
        }
      }

      // 3. Create Deal
      const deal = await tx.deal.create({
        data: {
          tenantId,
          name: dealName || `${lead.name} Deal`,
          companyId: finalCompanyId,
          customerId: finalCustomerId,
          value: dealValue || lead.value,
          stage: dealStage || "NEW",
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
          ownerId: ownerId || session.userId,
          leadId: lead.id,
          source: lead.source,
          status: "OPEN"
        }
      });

      // 4. Update Lead
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          isConverted: true,
          convertedAt: new Date(),
          customerId: finalCustomerId,
          companyId: finalCompanyId,
          stage: "WON" // Keep legacy stage in sync
        }
      });

      // 5. Timeline Event
      await tx.timelineEvent.create({
        data: {
          tenantId,
          action: "LEAD_CONVERTED",
          description: `Lead converted to Deal: ${deal.name}`,
          userId: session.userId,
          leadId: lead.id,
          dealId: deal.id,
          companyId: finalCompanyId,
          customerId: finalCustomerId
        }
      });

      return { deal, customerId: finalCustomerId, companyId: finalCompanyId };
    });

    return NextResponse.json({ success: true, message: "Lead converted successfully", data: result }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
