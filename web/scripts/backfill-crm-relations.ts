import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting CRM backfill script...");

  // Fetch all leads that have a company name but no companyId
  const leads = await prisma.lead.findMany({
    where: {
      companyId: null,
      company: { not: "" },
      deletedAt: null
    }
  });

  console.log(`Found ${leads.length} leads to backfill.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const lead of leads) {
    if (!lead.company || lead.company === "Unknown Company") {
      skippedCount++;
      continue;
    }

    const companyName = lead.company.trim();
    if (!companyName) {
      skippedCount++;
      continue;
    }

    try {
      // Find matching company in the same tenant
      let company = await prisma.company.findFirst({
        where: {
          tenantId: lead.tenantId,
          name: { equals: companyName, mode: "insensitive" }
        }
      });

      // Create company if it doesn't exist
      if (!company) {
        company = await prisma.company.create({
          data: {
            tenantId: lead.tenantId,
            name: companyName,
            status: "ACTIVE"
          }
        });
      }

      // Link lead to company
      await prisma.lead.update({
        where: { id: lead.id },
        data: { companyId: company.id }
      });

      updatedCount++;
      console.log(`Updated lead ${lead.name} -> company: ${company.name}`);
    } catch (error) {
      console.error(`Failed to backfill lead ${lead.id}:`, error);
    }
  }

  console.log(`Backfill complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
