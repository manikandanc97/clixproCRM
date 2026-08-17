import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Testing supabase.auth.getClaims...');
  try {
    // Check getClaims method
    console.log('typeof supabase.auth.getClaims:', typeof (supabase.auth as any).getClaims);

    // Let's test with dummy or malformed token
    const res1 = await (supabase.auth as any).getClaims('invalid.jwt.token');
    console.log('Result for invalid token:', res1);
  } catch (e: any) {
    console.log('getClaims error for invalid token:', e.message);
  }
}

main().catch(console.error);
