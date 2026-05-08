const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  const tables = ["Customer", "Lead", "Task", "Quotation"];

  for (const table of tables) {
    const result = await client.query(`select count(*)::int as count from "${table}"`);
    console.log(`${table}: ${result.rows[0].count}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
