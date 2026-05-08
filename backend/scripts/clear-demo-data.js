const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

async function deleteDemoRows(client, tableName) {
  const result = await client.query(`delete from "${tableName}" where "id" like $1`, ["demo-%"]);
  return result.rowCount;
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

    const deleted = {
      quotations: await deleteDemoRows(client, "Quotation"),
      tasks: await deleteDemoRows(client, "Task"),
      leads: await deleteDemoRows(client, "Lead"),
      customers: await deleteDemoRows(client, "Customer"),
    };

    await client.query("commit");

    console.log(
      `Demo data cleared. Customers: ${deleted.customers}, Leads: ${deleted.leads}, Tasks: ${deleted.tasks}, Quotations: ${deleted.quotations}`,
    );
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
