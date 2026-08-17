import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch a user from supabase auth
  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !usersData.users.length) {
    console.error('Error fetching users:', userError);
    return;
  }

  const testUser = usersData.users[0];
  console.log(`Using Supabase user: ${testUser.email} (${testUser.id})`);

  // Generate a valid custom or magiclink token or access token for this user
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: testUser.email!,
  });

  if (linkErr) {
    console.error('Error generating link:', linkErr);
    return;
  }

  const tokenHash = linkData.properties.hashed_token;
  const { data: sessionData, error: sessionErr } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  });

  let token = sessionData.session?.access_token;
  if (!token) {
    console.log('Could not get session via verifyOtp:', sessionErr);
    return;
  }
  console.log('Successfully acquired Supabase JWT session access token!');

  console.log('\n================ RUNNING 5 HTTP REQUESTS ================');
  const endpoint = 'http://localhost:4000/api/crm/dashboard?timeframe=month';

  const timings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const t1 = performance.now();
      const dur = t1 - t0;
      timings.push(dur);
      const json = (await res.json()) as any;
      console.log(`Request ${i}: ${dur.toFixed(2)} ms (Status: ${res.status}, Success: ${json.success})`);
    } catch (err: any) {
      console.error(`Request ${i} failed:`, err.message);
    }
  }

  console.log(`\nSummary of 5 requests:`);
  timings.forEach((t, i) => console.log(`Request ${i + 1}: ${t.toFixed(2)} ms`));
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  console.log(`Average HTTP Request Duration: ${avg.toFixed(2)} ms`);
}

main().catch(console.error);
