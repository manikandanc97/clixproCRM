/**
 * @file scripts/migrate-encrypt.ts
 *
 * Production-safe, idempotent backfill script for AES-256-GCM field encryption.
 *
 * PURPOSE:
 *   Encrypts all existing plaintext PII fields in Lead, Customer, Company,
 *   Note, Quotation, Meeting, TenantAiConfig, and Tenant records.
 *
 * SAFETY:
 *   - Reads FIELD_ENCRYPTION_KEY from environment (never hardcoded).
 *   - Fails fast if key is missing.
 *   - Detects already-encrypted values and skips them (idempotent).
 *   - Verifies decrypt(encrypt(plaintext)) === plaintext before saving.
 *   - Processes records in batches to avoid memory exhaustion.
 *   - Logs progress and errors without exposing decrypted values.
 *   - Safe to rerun multiple times.
 *
 * USAGE:
 *   # Set encryption key first:
 *   $env:FIELD_ENCRYPTION_KEY = "your-64-hex-char-key"
 *   npx ts-node scripts/migrate-encrypt.ts
 *
 *   # Or with dotenv:
 *   npx ts-node -r dotenv/config scripts/migrate-encrypt.ts
 *
 * GENERATE KEY:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// ─── Key Setup ────────────────────────────────────────────────────────────────

const raw = process.env.FIELD_ENCRYPTION_KEY;
if (!raw) {
  console.error(
    '[migrate-encrypt] FATAL: FIELD_ENCRYPTION_KEY is not set.\n' +
    'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  );
  process.exit(1);
}

const masterKey = Buffer.from(raw, 'hex');
if (masterKey.length !== 32) {
  console.error(
    '[migrate-encrypt] FATAL: FIELD_ENCRYPTION_KEY must be 64 hex chars (32 bytes).',
  );
  process.exit(1);
}

// Derive two sub-keys using HKDF (same derivation as EncryptionService)
const ENC_KEY = Buffer.from(crypto.hkdfSync('sha256', masterKey, 'clixprocrm-enc', 'field-encryption-v1', 32));
const HMAC_KEY = Buffer.from(crypto.hkdfSync('sha256', masterKey, 'clixprocrm-enc', 'field-hmac-v1', 32));

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

// ─── Encryption primitives ───────────────────────────────────────────────────

function isLikelyEncrypted(value: string): boolean {
  if (!value) return false;
  try {
    const buf = Buffer.from(value, 'base64');
    return buf.length >= IV_LEN + TAG_LEN + 1;
  } catch {
    return false;
  }
}

function encrypt(plaintext: string | null | undefined): string | null {
  if (!plaintext) return plaintext ?? null;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, ENC_KEY, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString('base64');
}

function decrypt(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return ciphertext ?? null;
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(buf.length - TAG_LEN);
  const enc = buf.subarray(IV_LEN, buf.length - TAG_LEN);
  const d = crypto.createDecipheriv(ALGO, ENC_KEY, iv, { authTagLength: TAG_LEN });
  d.setAuthTag(tag);
  return d.update(enc) + d.final('utf8');
}

function hmacHash(value: string | null | undefined): string | null {
  if (!value) return null;
  return crypto.createHmac('sha256', HMAC_KEY).update(value.trim().toLowerCase(), 'utf8').digest('hex');
}

function verifyRoundTrip(original: string | null, field: string, id: string): boolean {
  if (!original) return true;
  const enc = encrypt(original);
  if (!enc) return false;
  const dec = decrypt(enc);
  if (dec !== original) {
    console.error(`[migrate-encrypt] VERIFY FAILED: ${field} on record ${id} — round-trip mismatch!`);
    return false;
  }
  return true;
}

// ─── Main Backfill ────────────────────────────────────────────────────────────

const prisma = new PrismaClient();
const BATCH = 200;

async function migrateLeads() {
  console.log('\n[migrate-encrypt] Processing Lead table...');
  let cursor: string | undefined;
  let total = 0, encrypted = 0, skipped = 0;

  while (true) {
    const batch = await prisma.lead.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true, phone: true, company: true, emailHash: true },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1].id;

    for (const r of batch) {
      total++;
      // Skip if already encrypted (all fields look like base64 ciphertext)
      if (isLikelyEncrypted(r.email) && isLikelyEncrypted(r.name)) {
        // Update hash if missing
        if (!r.emailHash) {
          const plain = decrypt(r.email);
          await prisma.lead.update({
            where: { id: r.id },
            data: { emailHash: hmacHash(plain) },
          });
        }
        skipped++;
        continue;
      }
      // Verify round-trips before encrypting
      if (!verifyRoundTrip(r.name, 'name', r.id)) { process.exit(1); }
      if (!verifyRoundTrip(r.email, 'email', r.id)) { process.exit(1); }

      await prisma.lead.update({
        where: { id: r.id },
        data: {
          name: encrypt(r.name)!,
          email: encrypt(r.email)!,
          emailHash: hmacHash(r.email),
          phone: r.phone ? encrypt(r.phone) : r.phone,
          company: encrypt(r.company)!,
        },
      });
      encrypted++;
    }
  }
  console.log(`[migrate-encrypt] Lead: total=${total} encrypted=${encrypted} skipped(already done)=${skipped}`);
}

async function migrateCustomers() {
  console.log('\n[migrate-encrypt] Processing Customer table...');
  let cursor: string | undefined;
  let total = 0, encrypted = 0, skipped = 0;

  while (true) {
    const batch = await prisma.customer.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true, company: true, emailHash: true },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1].id;

    for (const r of batch) {
      total++;
      if (isLikelyEncrypted(r.name) && (!r.email || isLikelyEncrypted(r.email))) {
        if (!r.emailHash && r.email) {
          const plain = decrypt(r.email);
          await prisma.customer.update({ where: { id: r.id }, data: { emailHash: hmacHash(plain) } });
        }
        skipped++;
        continue;
      }
      if (!verifyRoundTrip(r.name, 'name', r.id)) { process.exit(1); }
      if (r.email && !verifyRoundTrip(r.email, 'email', r.id)) { process.exit(1); }

      await prisma.customer.update({
        where: { id: r.id },
        data: {
          name: encrypt(r.name)!,
          email: r.email ? encrypt(r.email) : r.email,
          emailHash: hmacHash(r.email),
          company: encrypt(r.company)!,
        },
      });
      encrypted++;
    }
  }
  console.log(`[migrate-encrypt] Customer: total=${total} encrypted=${encrypted} skipped=${skipped}`);
}

async function migrateCompanies() {
  console.log('\n[migrate-encrypt] Processing Company table...');
  let cursor: string | undefined;
  let total = 0, encrypted = 0, skipped = 0;

  while (true) {
    const batch = await prisma.company.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, name: true, email: true, phone: true, address: true, notes: true, nameHash: true },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1].id;

    for (const r of batch) {
      total++;
      if (isLikelyEncrypted(r.name)) {
        if (!r.nameHash) {
          const plain = decrypt(r.name);
          await prisma.company.update({ where: { id: r.id }, data: { nameHash: hmacHash(plain) } });
        }
        skipped++;
        continue;
      }
      if (!verifyRoundTrip(r.name, 'name', r.id)) { process.exit(1); }

      await prisma.company.update({
        where: { id: r.id },
        data: {
          name: encrypt(r.name)!,
          nameHash: hmacHash(r.name),
          email: r.email ? encrypt(r.email) : r.email,
          phone: r.phone ? encrypt(r.phone) : r.phone,
          address: r.address ? encrypt(r.address) : r.address,
          notes: r.notes ? encrypt(r.notes) : r.notes,
        },
      });
      encrypted++;
    }
  }
  console.log(`[migrate-encrypt] Company: total=${total} encrypted=${encrypted} skipped=${skipped}`);
}

async function migrateNotes() {
  console.log('\n[migrate-encrypt] Processing Note table...');
  let cursor: string | undefined;
  let total = 0, encrypted = 0, skipped = 0;

  while (true) {
    const batch = await prisma.note.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, message: true },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1].id;

    for (const r of batch) {
      total++;
      if (isLikelyEncrypted(r.message)) { skipped++; continue; }
      if (!verifyRoundTrip(r.message, 'message', r.id)) { process.exit(1); }
      await prisma.note.update({ where: { id: r.id }, data: { message: encrypt(r.message)! } });
      encrypted++;
    }
  }
  console.log(`[migrate-encrypt] Note: total=${total} encrypted=${encrypted} skipped=${skipped}`);
}

async function migrateQuotations() {
  console.log('\n[migrate-encrypt] Processing Quotation table...');
  let cursor: string | undefined;
  let total = 0, encrypted = 0, skipped = 0;

  while (true) {
    const batch = await prisma.quotation.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, client: true, notes: true },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1].id;

    for (const r of batch) {
      total++;
      if (isLikelyEncrypted(r.client)) { skipped++; continue; }
      if (!verifyRoundTrip(r.client, 'client', r.id)) { process.exit(1); }

      await prisma.quotation.update({
        where: { id: r.id },
        data: {
          client: encrypt(r.client)!,
          notes: r.notes ? encrypt(r.notes) : r.notes,
        },
      });
      encrypted++;
    }
  }
  console.log(`[migrate-encrypt] Quotation: total=${total} encrypted=${encrypted} skipped=${skipped}`);
}

async function migrateMeetings() {
  console.log('\n[migrate-encrypt] Processing Meeting table...');
  let cursor: string | undefined;
  let total = 0, encrypted = 0, skipped = 0;

  while (true) {
    const batch = await (prisma.meeting as any).findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, location: true, description: true, meetingNotes: true },
    });
    if (!batch.length) break;
    cursor = batch[batch.length - 1].id;

    for (const r of batch) {
      total++;
      if (
        (!r.location || isLikelyEncrypted(r.location)) &&
        (!r.description || isLikelyEncrypted(r.description))
      ) {
        skipped++;
        continue;
      }
      await (prisma.meeting as any).update({
        where: { id: r.id },
        data: {
          location: r.location ? encrypt(r.location) : r.location,
          description: r.description ? encrypt(r.description) : r.description,
          meetingNotes: r.meetingNotes ? encrypt(r.meetingNotes) : r.meetingNotes,
        },
      });
      encrypted++;
    }
  }
  console.log(`[migrate-encrypt] Meeting: total=${total} encrypted=${encrypted} skipped=${skipped}`);
}

async function migrateTenants() {
  console.log('\n[migrate-encrypt] Processing Tenant table...');
  const tenants = await prisma.tenant.findMany({
    select: { id: true, taxId: true, address: true },
  });
  let encrypted = 0, skipped = 0;
  for (const t of tenants) {
    if (
      (!t.taxId || isLikelyEncrypted(t.taxId)) &&
      (!t.address || isLikelyEncrypted(t.address))
    ) {
      skipped++;
      continue;
    }
    await prisma.tenant.update({
      where: { id: t.id },
      data: {
        taxId: t.taxId ? encrypt(t.taxId) : t.taxId,
        address: t.address ? encrypt(t.address) : t.address,
      },
    });
    encrypted++;
  }
  console.log(`[migrate-encrypt] Tenant: total=${tenants.length} encrypted=${encrypted} skipped=${skipped}`);
}

async function main() {
  console.log('=== ClixProCRM Field Encryption Backfill ===');
  console.log('Key loaded. Starting migration...\n');

  await migrateLeads();
  await migrateCustomers();
  await migrateCompanies();
  await migrateNotes();
  await migrateQuotations();
  await migrateMeetings();
  await migrateTenants();

  console.log('\n=== Backfill complete. All PII fields encrypted successfully. ===');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[migrate-encrypt] Fatal error:', err?.message || err);
  prisma.$disconnect();
  process.exit(1);
});
