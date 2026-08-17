import * as dns from 'dns/promises';
import * as net from 'net';
import * as tls from 'tls';
import * as https from 'https';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const directUrl = process.env.DIRECT_URL || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Parse safe metadata from DATABASE_URL and DIRECT_URL
function parseSafeDbInfo(urlStr: string) {
  try {
    const parsed = new URL(urlStr);
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.replace('/', ''),
      pgbouncer: parsed.searchParams.get('pgbouncer'),
      connection_limit: parsed.searchParams.get('connection_limit'),
      sslmode: parsed.searchParams.get('sslmode'),
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function measureDns(host: string) {
  const t0 = performance.now();
  const res = await dns.lookup(host);
  const t1 = performance.now();
  return { ip: res.address, duration: t1 - t0 };
}

async function measureTcp(host: string, port: number) {
  return new Promise<number>((resolve, reject) => {
    const t0 = performance.now();
    const socket = net.createConnection({ host, port, timeout: 5000 }, () => {
      const t1 = performance.now();
      socket.destroy();
      resolve(t1 - t0);
    });
    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TCP timeout'));
    });
  });
}

async function measureTls(host: string, port: number) {
  return new Promise<number>((resolve, reject) => {
    const t0 = performance.now();
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        rejectUnauthorized: false,
        timeout: 5000,
      },
      () => {
        const t1 = performance.now();
        socket.destroy();
        resolve(t1 - t0);
      },
    );
    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TLS timeout'));
    });
  });
}

async function getGeoIp(ip: string) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as`);
    const data = await res.json();
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('       SUPABASE & PRISMA COMPREHENSIVE CONNECTION AUDIT         ');
  console.log('================================================================\n');

  const poolerInfo = parseSafeDbInfo(dbUrl);
  const directInfo = parseSafeDbInfo(directUrl);
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : '';

  console.log('--- 1. CONFIGURATION & METADATA (NO SECRETS) ---');
  console.log('Pooler Configuration (DATABASE_URL):', poolerInfo);
  console.log('Direct Configuration (DIRECT_URL):', directInfo);
  console.log('Supabase API Host:', supabaseHost, '\n');

  console.log('--- 2. DNS & GEOGRAPHIC RESOLUTION ---');
  const poolerDns = await measureDns(poolerInfo.hostname!);
  console.log(`Pooler Host (${poolerInfo.hostname}): IP ${poolerDns.ip} (DNS: ${poolerDns.duration.toFixed(2)} ms)`);
  const poolerGeo = await getGeoIp(poolerDns.ip);
  console.log(`Pooler GeoIP: ${poolerGeo.city}, ${poolerGeo.regionName}, ${poolerGeo.country} (${poolerGeo.timezone}) - ISP/Org: ${poolerGeo.isp} / ${poolerGeo.org}`);

  const apiDns = await measureDns(supabaseHost);
  console.log(`Supabase API Host (${supabaseHost}): IP ${apiDns.ip} (DNS: ${apiDns.duration.toFixed(2)} ms)`);
  const apiGeo = await getGeoIp(apiDns.ip);
  console.log(`Supabase API GeoIP: ${apiGeo.city}, ${apiGeo.regionName}, ${apiGeo.country} (${apiGeo.timezone}) - ISP/Org: ${apiGeo.isp} / ${apiGeo.org}\n`);

  console.log('--- 3. RAW NETWORK HANDSHAKE TIMINGS (5 PASSES) ---');
  console.log('Measuring Raw TCP Connect to Pooler (Port 6543):');
  const poolerTcpTimings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    try {
      const dur = await measureTcp(poolerInfo.hostname!, parseInt(poolerInfo.port || '6543', 10));
      poolerTcpTimings.push(dur);
      console.log(`  Pass ${i}: ${dur.toFixed(2)} ms`);
    } catch (e: any) {
      console.log(`  Pass ${i} Error: ${e.message}`);
    }
  }

  console.log('\nMeasuring Raw TCP Connect to Direct DB (Port 5432):');
  const directTcpTimings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    try {
      const dur = await measureTcp(directInfo.hostname!, parseInt(directInfo.port || '5432', 10));
      directTcpTimings.push(dur);
      console.log(`  Pass ${i}: ${dur.toFixed(2)} ms`);
    } catch (e: any) {
      console.log(`  Pass ${i} Error: ${e.message}`);
    }
  }

  console.log('\nMeasuring TLS Handshake to Supabase HTTPS API (Port 443):');
  const httpsTlsTimings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    try {
      const dur = await measureTls(supabaseHost, 443);
      httpsTlsTimings.push(dur);
      console.log(`  Pass ${i}: ${dur.toFixed(2)} ms`);
    } catch (e: any) {
      console.log(`  Pass ${i} Error: ${e.message}`);
    }
  }

  console.log('\n--- 4. SUPABASE AUTH HTTPS API CALL TIMINGS ---');
  // Measure raw HTTP request to Supabase auth
  const authHttpTimings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`, // Dummy token to trigger auth validation
        },
      });
      const dur = performance.now() - t0;
      authHttpTimings.push(dur);
      console.log(`  Auth Request ${i}: ${dur.toFixed(2)} ms (Status: ${res.status})`);
    } catch (e: any) {
      console.log(`  Auth Request ${i} Error: ${e.message}`);
    }
  }

  console.log('\n--- 5. PRISMA OVER POOLER (DATABASE_URL, Port 6543) ---');
  const poolerPrismaQueryEvents: { query: string; duration: number }[] = [];
  const poolerPrisma = new PrismaClient({
    datasourceUrl: dbUrl,
    log: [{ emit: 'event', level: 'query' }],
  });
  (poolerPrisma as any).$on('query', (e: any) => {
    poolerPrismaQueryEvents.push({ query: e.query, duration: e.duration });
  });

  const tPoolConnect0 = performance.now();
  await poolerPrisma.$connect();
  const tPoolConnect1 = performance.now();
  console.log(`Prisma $connect() on Pooler: ${(tPoolConnect1 - tPoolConnect0).toFixed(2)} ms`);

  console.log('Testing SELECT 1 (10 iterations over warm persistent connection):');
  const poolerSelect1Timings: number[] = [];
  for (let i = 1; i <= 10; i++) {
    const t0 = performance.now();
    await poolerPrisma.$queryRaw`SELECT 1 as ping`;
    const t1 = performance.now();
    poolerSelect1Timings.push(t1 - t0);
    console.log(`  SELECT 1 Iteration ${i}: ${(t1 - t0).toFixed(2)} ms`);
  }

  console.log('Testing Simple Indexed Query (prisma.tenant.findFirst):');
  const poolerIndexedTimings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    await poolerPrisma.tenant.findFirst({ select: { id: true, currency: true } });
    const t1 = performance.now();
    poolerIndexedTimings.push(t1 - t0);
    console.log(`  Indexed Query Iteration ${i}: ${(t1 - t0).toFixed(2)} ms`);
  }

  console.log('Testing 8 Concurrent SELECT 1 queries (Promise.all):');
  const tParallel0 = performance.now();
  await Promise.all(Array.from({ length: 8 }).map(() => poolerPrisma.$queryRaw`SELECT 1 as ping`));
  const tParallel1 = performance.now();
  console.log(`  8 Parallel SELECT 1 duration: ${(tParallel1 - tParallel0).toFixed(2)} ms`);

  console.log('\n--- 6. PRISMA OVER DIRECT CONNECTION (DIRECT_URL, Port 5432) ---');
  const directPrisma = new PrismaClient({
    datasourceUrl: directUrl,
    log: [{ emit: 'event', level: 'query' }],
  });

  const tDirectConnect0 = performance.now();
  await directPrisma.$connect();
  const tDirectConnect1 = performance.now();
  console.log(`Prisma $connect() on Direct DB: ${(tDirectConnect1 - tDirectConnect0).toFixed(2)} ms`);

  console.log('Testing SELECT 1 (10 iterations over Direct Connection):');
  const directSelect1Timings: number[] = [];
  for (let i = 1; i <= 10; i++) {
    const t0 = performance.now();
    await directPrisma.$queryRaw`SELECT 1 as ping`;
    const t1 = performance.now();
    directSelect1Timings.push(t1 - t0);
    console.log(`  Direct SELECT 1 Iteration ${i}: ${(t1 - t0).toFixed(2)} ms`);
  }

  console.log('Testing Simple Indexed Query on Direct Connection:');
  const directIndexedTimings: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    await directPrisma.tenant.findFirst({ select: { id: true, currency: true } });
    const t1 = performance.now();
    directIndexedTimings.push(t1 - t0);
    console.log(`  Direct Indexed Query Iteration ${i}: ${(t1 - t0).toFixed(2)} ms`);
  }

  console.log('Testing 8 Concurrent SELECT 1 queries on Direct Connection (Promise.all):');
  const tDirectParallel0 = performance.now();
  await Promise.all(Array.from({ length: 8 }).map(() => directPrisma.$queryRaw`SELECT 1 as ping`));
  const tDirectParallel1 = performance.now();
  console.log(`  Direct 8 Parallel SELECT 1 duration: ${(tDirectParallel1 - tDirectParallel0).toFixed(2)} ms`);

  console.log('\n--- 7. TENANT GUARD QUERY & RELATION INVESTIGATION ---');
  const user = await poolerPrisma.user.findFirst();
  if (user) {
    console.log(`Analyzing TenantGuard query for user: ${user.email} (${user.id})`);
    
    // Clear query events
    poolerPrismaQueryEvents.length = 0;
    const tGuard0 = performance.now();
    const res = await poolerPrisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { role: { include: { permissions: true } } },
        },
      },
    });
    const tGuard1 = performance.now();
    console.log(`TenantGuard Prisma query elapsed: ${(tGuard1 - tGuard0).toFixed(2)} ms`);
    console.log(`Total underlying SQL queries generated by Prisma for this call: ${poolerPrismaQueryEvents.length}`);
    poolerPrismaQueryEvents.forEach((ev, idx) => {
      console.log(`  SQL [${idx + 1}] (DB execution: ${ev.duration} ms): ${ev.query.substring(0, 120)}...`);
    });
  }

  await poolerPrisma.$disconnect();
  await directPrisma.$disconnect();
  console.log('\n================ AUDIT COMPLETED ================');
}

runAudit().catch(console.error);
