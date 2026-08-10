import { PrismaClient } from "@prisma/client";
import { InvoiceService } from "../services/invoice/invoice.service";
import { TaskService } from "../services/task/task.service";
import { LeadService } from "../services/lead/lead.service";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== STARTING SECURITY IDOR TESTS ===");

  // Setup: Create 2 tenants and 2 users
  const tenantA = await prisma.tenant.create({ data: { name: "Security Tenant A", slug: `tenant-a-${Date.now()}` } });
  const tenantB = await prisma.tenant.create({ data: { name: "Security Tenant B", slug: `tenant-b-${Date.now()}` } });

  const userA = await prisma.user.create({ data: { email: `a_${Date.now()}@test.com`, name: "User A", status: "ACTIVE" } });
  const userB = await prisma.user.create({ data: { email: `b_${Date.now()}@test.com`, name: "User B", status: "ACTIVE" } });

  // Assign User A to Tenant A, User B to Tenant B
  const roleA = await prisma.role.findFirst({ where: { name: "ADMIN", isSystem: true } });
  await prisma.tenantUser.create({ data: { tenantId: tenantA.id, userId: userA.id, roleId: roleA!.id, status: "ACTIVE" } });
  await prisma.tenantUser.create({ data: { tenantId: tenantB.id, userId: userB.id, roleId: roleA!.id, status: "ACTIVE" } });

  const customerB = await prisma.customer.create({
    data: { tenantId: tenantB.id, name: "Customer B", email: "cb@test.com", status: "ACTIVE", company: "Test Co" }
  });

  const invoiceB = await prisma.invoice.create({
    data: {
      tenantId: tenantB.id,
      customerId: customerB.id,
      amount: 100,
      dueDate: new Date(),
      status: "DRAFT",
    }
  });

  // TEST 1: Cross-Tenant Invoice IDOR Update
  try {
    console.log("Test 1: User A updates Tenant B's invoice");
    await InvoiceService.updateInvoiceStatus(tenantA.id, invoiceB.id, "SENT");
    console.error("FAIL: User A was able to update Tenant B's invoice!");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log("PASS: Blocked Invoice IDOR Update ->", e.message);
  }

  // TEST 2: Cross-Tenant Invoice IDOR Delete
  try {
    console.log("Test 2: User A deletes Tenant B's invoice");
    await InvoiceService.deleteInvoice(tenantA.id, invoiceB.id, userA.id);
    console.error("FAIL: User A was able to delete Tenant B's invoice!");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log("PASS: Blocked Invoice IDOR Delete ->", e.message);
  }

  // TEST 3: Invalid assignedToId on Task Creation
  try {
    console.log("Test 3: User A assigns Task to User B (different tenant)");
    await TaskService.createTask(tenantA.id, userA.id, {
      title: "Hacked Task",
      dueDate: new Date(),
      assignedToId: userB.id
    });
    console.error("FAIL: Task created with cross-tenant assignee!");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log("PASS: Blocked Cross-Tenant Task Assignment ->", e.message);
  }

  // TEST 4: Invalid assignedToId on Lead Creation
  try {
    console.log("Test 4: User A assigns Lead to User B (different tenant)");
    await LeadService.createLead(tenantA.id, userA.id, {
      name: "Hacked Lead",
      assignedToId: userB.id
    });
    console.error("FAIL: Lead created with cross-tenant assignee!");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log("PASS: Blocked Cross-Tenant Lead Assignment ->", e.message);
  }

  console.log("=== TESTS COMPLETE ===");
  process.exit(0);
}

runTests().catch(e => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
