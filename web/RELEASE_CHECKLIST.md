# Release Checklist (Pre-Flight)

Before deploying ClixProCRM to a production environment (Vercel, AWS, etc.), follow this checklist to ensure stability and security.

## 1. Environment Variables
- [ ] `.env` is fully populated based on `.env.example`.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are valid.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept strictly secret and NOT prefixed with `NEXT_PUBLIC_`.
- [ ] `DATABASE_URL` is pointing to the production pooler (e.g. Supabase port `6543` with `?pgbouncer=true`).
- [ ] `DIRECT_URL` is pointing to the production direct connection (e.g. Supabase port `5432`).
- [ ] `UPSTASH_REDIS_REST_URL` and `TOKEN` are populated for rate-limiting.

## 2. Database & Migrations
- [ ] Verified that NO developer uses `npx prisma db push` on the production database.
- [ ] The deployment pipeline executes `npx prisma migrate deploy` successfully.
- [ ] Point-in-time recovery and database backups are enabled in Supabase.

## 3. Storage & Buckets
- [ ] Appropriate buckets exist in Supabase Storage (e.g. for user avatars, lead attachments).
- [ ] Row Level Security (RLS) policies are active on those buckets preventing cross-tenant access.

## 4. Build & Smoke Test
- [ ] Run `npx tsc --noEmit` and confirm 0 errors.
- [ ] Run `npm run build` and ensure Next.js generated the static/dynamic routing matrix without failures.
- [ ] Verify you can log in, create a Lead, convert it to a Deal, and issue a Quotation successfully.

## 5. Security & Domain
- [ ] Custom domain is configured with HTTPS strictly enforced.
- [ ] OAuth providers (Google, GitHub) are updated to accept the new production callback URLs.
