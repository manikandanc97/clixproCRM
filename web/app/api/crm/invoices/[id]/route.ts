import { NextResponse } from "next/server";
import { InvoiceService } from "@/services";
import { requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import * as z from "zod";

const invoiceUpdateSchema = z.object({
  amount: z.union([z.string(), z.number()]).optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  dueDate: z.union([z.string(), z.date()]).optional().nullable(),
  dealId: z.string().optional().nullable(),
  customerId: z.string().optional(),
});

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]);
    const { id } = await context.params;
    const invoice = await InvoiceService.getInvoiceById(session.tenantId, id);
    if (!invoice) return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: invoice }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);
    const { id } = await context.params;

    const rawBody = await req.json();

    // Handle status-only update
    if (rawBody.status && Object.keys(rawBody).length === 1) {
      const updated = await InvoiceService.updateInvoiceStatus(session.tenantId, id, rawBody.status);
      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

    const body = invoiceUpdateSchema.parse(rawBody);
    const invoice = await InvoiceService.updateInvoice(session.tenantId, id, body);
    return NextResponse.json({ success: true, data: invoice }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const ip = getClientIp(req);
    const identifier = `delete_${ip}`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.DELETE);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.DELETE);

    const session = await requireRole(["ADMIN", "MANAGER"]);
    const { id } = await context.params;

    await InvoiceService.deleteInvoice(session.tenantId, id, session.userId);
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}
