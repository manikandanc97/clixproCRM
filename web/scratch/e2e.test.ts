import { PrismaClient } from "@prisma/client";
import { LeadService } from "../services/lead/lead.service";
import { DealService } from "../services/deal/deal.service";
import { TaskService } from "../services/task/task.service";
import { QuotationService } from "../services/quotation/quotation.service";
import { InvoiceService } from "../services/invoice/invoice.service";
import assert from "assert";

const prisma = new PrismaClient();

async function runE2ERegression() {
  console.log("=== STARTING PHASE 16 E2E REGRESSION ===");

  const ts = Date.now();
  
  // 1. Setup Tenant and User
  const tenant = await prisma.tenant.create({ data: { name: "E2E Tenant", slug: `e2e-${ts}` } });
  const user = await prisma.user.create({ data: { email: `e2e_${ts}@test.com`, name: "E2E User", status: "ACTIVE" } });
  const role = await prisma.role.findFirst({ where: { name: "ADMIN", isSystem: true } });
  await prisma.tenantUser.create({ data: { tenantId: tenant.id, userId: user.id, roleId: role!.id, status: "ACTIVE" } });

  console.log("[PASS] Tenant & User Provisioned");

  // 2. LEAD WORKFLOW
  const leadData = {
    name: "Kavitha E2E",
    email: "kavitha@bluesky.com",
    company: "Blue Sky Travels E2E",
    stage: "NEW",
    valueAmount: 50000,
    source: "Direct",
    assignedToId: user.id
  };
  
  const lead = await LeadService.createLead(tenant.id, user.id, leadData);
  assert(lead.id, "Lead was not created");
  assert(lead.isConverted === false, "Lead should not be converted initially");
  console.log("[PASS] Lead Workflow: Created");

  // Update Lead to WON (Conversion)
  const wonLead = await LeadService.updateLead(tenant.id, user.id, lead.id, { stage: "WON" });
  assert(wonLead.isConverted === true, "Lead must be converted on WON stage");
  assert(wonLead.companyId, "Company must be created/linked upon conversion");
  console.log("[PASS] Lead Workflow: Converted to Customer/Company");

  // 3. COMPANY & CUSTOMER WORKFLOW
  const company = await prisma.company.findUnique({ where: { id: wonLead.companyId! } });
  assert(company, "Company record must exist");
  assert(company.name === "Blue Sky Travels E2E", "Company name mismatch");

  // 4. DEAL PIPELINE WORKFLOW
  const deal = await DealService.createDeal(tenant.id, {
    name: "Blue Sky Website Project",
    value: 50000,
    stage: "NEW",
    companyId: company.id,
    leadId: lead.id,
    ownerId: user.id,
  }, user.id);
  assert(deal.id, "Deal was not created");
  
  const updatedDeal = await DealService.updateDeal(tenant.id, deal.id, { stage: "WON", actualRevenue: 50000, wonReason: "E2E Testing" }, user.id);
  assert(updatedDeal.stage === "WON", "Deal stage did not update");
  console.log("[PASS] Deal Pipeline Workflow: Deal Created and WON");

  // 5. TASK WORKFLOW
  const task = await TaskService.createTask(tenant.id, user.id, {
    title: "Follow up with Kavitha",
    dueDate: new Date(),
    assignedToId: user.id,
    relatedDealId: deal.id,
  });
  assert(task.id, "Task not created");

  const completedTask = await TaskService.updateTask(tenant.id, user.id, task.id, { status: "COMPLETED" });
  assert(completedTask.status === "COMPLETED", "Task status did not update");
  console.log("[PASS] Task Workflow: Task attached to Deal & Completed");

  // 6. QUOTATION WORKFLOW
  const quotation = await QuotationService.createQuotation(tenant.id, {
    client: company.name,
    leadId: lead.id,
    amount: 50000,
    status: "DRAFT",
    validTill: new Date(),
    items: [{
      description: "Website Development",
      quantity: 1,
      unitPrice: 50000,
      amount: 50000
    }],
    notes: "E2E Test Quotation",
    discount: 0,
    tax: 0,
  });
  
  assert(quotation.id, "Quotation not created");
  const acceptedQuote = await QuotationService.updateQuotationStatus(tenant.id, quotation.id, "APPROVED");
  assert(acceptedQuote.status === "APPROVED", "Quotation status did not update");
  console.log("[PASS] Quotation Workflow: Created & Approved");

  // 7. INVOICE WORKFLOW
  const invoice = await InvoiceService.createInvoice(tenant.id, user.id, {
    customerId: wonLead.customerId!,
    dealId: deal.id,
    amount: 50000,
    status: "DRAFT",
    dueDate: new Date(),
  });

  assert(invoice.id, "Invoice not created");
  const paidInvoice = await InvoiceService.updateInvoiceStatus(tenant.id, invoice.id, "PAID");
  assert(paidInvoice.status === "PAID", "Invoice status did not update");
  console.log("[PASS] Invoice Workflow: Created & Paid");

  // 8. TEARDOWN (Soft delete Deal)
  await DealService.deleteDeal(tenant.id, deal.id, user.id);
  const deletedDeal = await prisma.deal.findUnique({ where: { id: deal.id } });
  assert(deletedDeal?.deletedAt !== null, "Deal was not soft-deleted");
  console.log("[PASS] Data Integrity: Soft Delete Functional");

  console.log("=== PHASE 16 E2E REGRESSION SUCCESS ===");
  process.exit(0);
}

runE2ERegression().catch(e => {
  console.error("=== E2E REGRESSION FAILED ===");
  console.error(e);
  process.exit(1);
});
