const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.oscksafwlfkpqvifcvae:clientRisecrm@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT id, email, encrypted_password, email_confirmed_at, confirmed_at FROM auth.users WHERE email = 'emp2@gmail.com'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
