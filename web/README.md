# ClixProCRM

ClixProCRM is an enterprise-grade Customer Relationship Management (CRM) platform built with a modern Next.js stack. It supports multi-tenancy, Role-Based Access Control (RBAC), advanced pipeline management, task delegation, and AI-driven insights.

## Core Features
- **Multi-Tenant Architecture**: Strict row-level logic ensuring data isolation per workspace/tenant.
- **Robust RBAC**: Role-Based Access Control down to the database mutation level.
- **Lead & Pipeline Management**: KanBan drag-and-drop interfaces for tracking deal progression.
- **Financial Documents**: Seamless Quotation to Invoice workflows with dynamic item calculations.
- **AI Integration**: RAG-ready AI insights and intelligent conversational agents.
- **Advanced Global Search**: Tenant-aware, debounced, database-driven global search.
- **Enterprise Grade Security**: Sliding window rate-limiting, secure headers, and Supabase SSR integration.

## Tech Stack
- **Framework**: Next.js 16.2 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 
- **Authentication**: Supabase Auth (SSR)
- **Styling**: Tailwind CSS & Shadcn UI
- **State Management**: Zustand & React Query

## Requirements
- Node.js 20+
- PostgreSQL Database (Local or Supabase)

## Local Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/your-org/clixprocrm.git
cd clixprocrm/crm
npm install
```

### 2. Environment Setup
Copy the example environment variables and populate the placeholders:
```bash
cp .env.example .env
```
Ensure you provide your Supabase instance URLs, Anon Keys, and Service Role keys.

### 3. Database Initialization
This project uses Prisma. In development, you can generate your client and run standard migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

> [!WARNING]
> Do NOT use `npx prisma db push` against the production database. Always use `npx prisma migrate deploy` in CI/CD environments.

### 4. Run Development Server
```bash
npm run dev
```

## Production Deployment
The application is pre-configured for deployment on Vercel or any standard Node.js environment.
1. Populate production `.env` variables in your hosting provider.
2. Ensure build command is `npm run build` (which includes `prisma generate`).
3. Deploy your database migrations using `npx prisma migrate deploy`.

## Documentation
For security architectures and release preparation, see:
- [SECURITY.md](./SECURITY.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)
- [FEATURE_MATRIX.md](./FEATURE_MATRIX.md)
