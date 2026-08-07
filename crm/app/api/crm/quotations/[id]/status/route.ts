import { NextResponse } from "next/server";
import { QuotationService } from "@/services/quotation/quotation.service";
import { QuotationStatus } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-utils";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getAuthSession();
    if (!session || !session.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tenantId = session.tenantId;

    const body = await req.json();
    const { status } = body;

    if (!status || !["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const quotation = await QuotationService.updateQuotationStatus(tenantId, id, status as QuotationStatus);

    return NextResponse.json({ success: true, data: quotation });
  } catch (error: ReturnType<typeof JSON.parse>) {
    console.error("Quotation Status Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update quotation status" }, { status: 400 });
  }
}
