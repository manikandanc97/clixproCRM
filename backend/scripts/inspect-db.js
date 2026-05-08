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
    "select table_name from information_schema.tables where table_schema = $1 order by table_name",
    ["public"],
  );

  console.log(result.rows.map((row) => row.table_name).join("\n") || "(no public tables)");

  await client.end();
}

main().catch((error) => {
  console.error(error.code || error.name, error.message);
  process.exit(1);
});
