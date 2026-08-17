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

  console.log('================ AUTH BENCHMARK & SECURITY TEST ================');

  // Let's create a test JWT using WebCrypto or inspect getClaims
  console.log('\n--- 1. Testing getClaims on malformed and tampered tokens ---');
  
  // Test A: Missing token
  const tA = await (supabase.auth as any).getClaims('');
  console.log('Test A (Empty token):', tA.error?.message || 'Accepted');

  // Test B: Malformed token
  const tB = await (supabase.auth as any).getClaims('not.a.valid.jwt');
  console.log('Test B (Malformed token):', tB.error?.message || 'Accepted');

  // Test C: Expired token structure (crafted payload with exp in past)
  const expiredPayload = Buffer.from(JSON.stringify({
    sub: '12345',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    iss: `${supabaseUrl}/auth/v1`,
  })).toString('base64url');
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: '4aac30dd-e4d7-424b-8c43-7e7de3c68d84' })).toString('base64url');
  const dummySig = Buffer.from('dummy-signature').toString('base64url');
  const expiredToken = `${header}.${expiredPayload}.${dummySig}`;

  const tC = await (supabase.auth as any).getClaims(expiredToken);
  console.log('Test C (Expired token):', tC.error?.message || 'Accepted');

  // Test D: Tampered signature with valid unexpired payload
  const validTimePayload = Buffer.from(JSON.stringify({
    sub: '12345',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour future
    iss: `${supabaseUrl}/auth/v1`,
  })).toString('base64url');
  const tamperedToken = `${header}.${validTimePayload}.${dummySig}`;

  const tD = await (supabase.auth as any).getClaims(tamperedToken);
  console.log('Test D (Invalid Signature / Tampered):', tD.error?.message || 'Accepted');

  console.log('\n--- 2. Benchmarking getUser vs getClaims on JWKS retrieval ---');
  // Measure cold JWKS fetch
  const tJwk0 = performance.now();
  const jwk = await (supabase.auth as any).fetchJwk('4aac30dd-e4d7-424b-8c43-7e7de3c68d84');
  const tJwk1 = performance.now();
  console.log(`fetchJwk() cold: ${(tJwk1 - tJwk0).toFixed(2)} ms (key found: ${!!jwk})`);

  // Measure warm JWKS fetch (in-memory cached)
  const tJwk2 = performance.now();
  const jwkCached = await (supabase.auth as any).fetchJwk('4aac30dd-e4d7-424b-8c43-7e7de3c68d84');
  const tJwk3 = performance.now();
  console.log(`fetchJwk() warm cached: ${(tJwk3 - tJwk2).toFixed(2)} ms (key found: ${!!jwkCached})`);
}

main().catch(console.error);
