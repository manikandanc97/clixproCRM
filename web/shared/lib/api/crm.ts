/**
 * @file shared/lib/api/crm.ts
 * Backward-compatibility barrel re-export.
 *
 * All domain API implementations now live in domain-specific files:
 *   - dashboard.api.ts  — dashboard, notifications, meetings, hot-leads
 *   - leads.api.ts      — leads CRUD + notes/timeline/attachments
 *   - tasks.api.ts      — tasks CRUD + board/calendar/timeline
 *   - deals.api.ts      — deals + pipeline
 *   - customers.api.ts  — customers CRUD
 *   - quotations.api.ts — quotations + invoices
 *   - employees.api.ts  — employees CRUD
 *   - reports.api.ts    — reports + analytics
 *   - companies.api.ts  — companies CRUD
 *   - settings.api.ts   — workspace + settings + revenue targets
 *
 * Existing imports from this file continue to work with no changes required.
 * New code should import directly from the specific domain API file.
 */
export * from "./dashboard.api";
export * from "./leads.api";
export * from "./tasks.api";
export * from "./deals.api";
export * from "./customers.api";
export * from "./quotations.api";
export * from "./employees.api";
export * from "./reports.api";
export * from "./companies.api";
export * from "./settings.api";
