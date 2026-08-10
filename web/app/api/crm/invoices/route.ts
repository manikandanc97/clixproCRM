import { NextResponse } from "next/server";
import { InvoiceService } from "@/services";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";
import { paginationSchema } from "@/shared/validations";
import * as z from "zod";

const invoiceCreateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  dealId: z.string().optional().nullable(),
  amount: z.union([z.string(), z.number()]),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).default("DRAFT"),
  dueDate: z.union([z.string(), z.date()]).optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const { page, limit } = paginationSchema.parse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });

    const invoices = await InvoiceService.getInvoices(session.tenantId, page, limit);
    return NextResponse.json({ success: true, data: invoices }, { status: 200 });
  } catch (error: unknown) { return handleApiError(error); }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "MANAGER", "SALES"]);

    const rawBody = await req.json();
    const body = invoiceCreateSchema.parse(rawBody);

    const invoice = await InvoiceService.createInvoice(session.tenantId, session.userId, {
      customerId: body.customerId,
      dealId: body.dealId,
      amount: body.amount,
      status: body.status,
      dueDate: body.dueDate,
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: unknown) { return handleApiError(error); }
}
