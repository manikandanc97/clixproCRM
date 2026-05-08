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

  const result = await client.query(
    'select migration_name, finished_at from "_prisma_migrations" order by started_at',
  );

  console.log(
    result.rows
      .map((row) => `${row.migration_name} ${row.finished_at ? "applied" : "pending"}`)
      .join("\n") || "(no migrations)",
  );

  await client.end();
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
