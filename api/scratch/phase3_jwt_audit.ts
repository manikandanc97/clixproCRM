import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const anonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || '';

async function auditJwt() {
  console.log('================ JWT SIGNING ALGORITHM AUDIT ================');
  
  // 1. Decode Anon Key Header
  try {
    const [headerB64, payloadB64] = anonKey.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    
    console.log('Anon JWT Header:', header);
    console.log('Anon JWT Payload (safe fields):', {
      iss: payload.iss,
      ref: payload.ref,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    });
    console.log('Algorithm detected:', header.alg);
    console.log('Type detected:', header.typ);
  } catch (e: any) {
    console.error('Error decoding anon key:', e.message);
  }

  // 2. Check if JWKS endpoint exists at /.well-known/jwks.json or /auth/v1/.well-known/jwks.json
  console.log('\nChecking JWKS endpoints at Supabase project...');
  const jwksUrls = [
    `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    `${supabaseUrl}/.well-known/jwks.json`,
    `${supabaseUrl}/auth/v1/jwks`,
  ];

  for (const url of jwksUrls) {
    try {
      const res = await fetch(url);
      console.log(`Endpoint ${url} -> Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log('JWKS Keys found:', data);
      }
    } catch (e: any) {
      console.log(`Endpoint ${url} -> Fetch failed: ${e.message}`);
    }
  }
}

auditJwt().catch(console.error);
