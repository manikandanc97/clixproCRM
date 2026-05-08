const { Client } = require("pg");
const dotenv = require("dotenv");
const {
  demoCustomers,
  demoLeads,
  demoTasks,
  demoQuotations,
} = require("../src/data/demo-crm-data");

dotenv.config();

function withUpdatedAt(row) {
  return {
    ...row,
    updatedAt: row.updatedAt || row.createdAt || new Date(),
  };
}

async function upsertRows(client, tableName, rows, columns) {
  for (const row of rows.map(withUpdatedAt)) {
    const values = columns.map((column) => row[column] ?? null);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const updates = columns
      .filter((column) => column !== "id")
      .map((column) => `"${column}" = excluded."${column}"`)
      .join(", ");

    await client.query(
      `insert into "${tableName}" (${columns.map((column) => `"${column}"`).join(", ")})
       values (${placeholders})
       on conflict ("id") do update set ${updates}`,
      values,
    );
  }
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  try {
    await client.query("begin");

    await upsertRows(client, "Customer", demoCustomers, [
      "id",
      "name",
      "company",
      "email",
      "status",
      "revenue",
      "lastContactAt",
      "manager",
      "createdAt",
      "updatedAt",
    ]);

    await upsertRows(client, "Lead", demoLeads, [
      "id",
      "name",
      "company",
      "email",
      "status",
      "value",
      "followUpAt",
      "assignedTo",
      "createdAt",
      "updatedAt",
    ]);

    await upsertRows(client, "Task", demoTasks, [
      "id",
      "title",
      "description",
      "dueDate",
      "priority",
      "assignedTo",
      "status",
      "createdAt",
      "updatedAt",
    ]);

    await upsertRows(client, "Quotation", demoQuotations, [
      "id",
      "quoteNumber",
      "client",
      "amount",
      "status",
      "validTill",
      "createdBy",
      "createdAt",
      "updatedAt",
    ]);

    await client.query("commit");
    console.log("Demo CRM data seeded.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
