import { PaginationMetadata, SafeLead } from "../types/crm.js";

/**
 * Sanitizes a single raw lead record into a safe public structure.
 */
export function sanitizeLead(raw: unknown): SafeLead {
  if (!raw || typeof raw !== "object") {
    return { id: "" };
  }

  const l = raw as Record<string, unknown>;
  return {
    id: String(l.id || ""),
    title: l.title ? String(l.title) : undefined,
    firstName: l.firstName ? String(l.firstName) : undefined,
    lastName: l.lastName ? String(l.lastName) : undefined,
    name:
      l.name ? String(l.name) : [l.firstName, l.lastName].filter(Boolean).join(" ") || undefined,
    email: l.email ? String(l.email) : undefined,
    phone: l.phone ? String(l.phone) : undefined,
    company: l.company ? String(l.company) : undefined,
    status: l.status ? String(l.status) : undefined,
    stage: l.stage ? String(l.stage) : undefined,
    value: typeof l.value === "number" ? l.value : l.value ? Number(l.value) : undefined,
    source: l.source ? String(l.source) : undefined,
    notes: l.notes ? String(l.notes) : undefined,
    assignedToId: l.assignedToId ? String(l.assignedToId) : undefined,
    createdAt: l.createdAt ? String(l.createdAt) : undefined,
    updatedAt: l.updatedAt ? String(l.updatedAt) : undefined,
  };
}

/**
 * Sanitizes the raw lead listing payload and extracts clean pagination metadata.
 */
export function sanitizeLeadsList(raw: unknown): {
  leads: SafeLead[];
  pagination: PaginationMetadata;
} {
  if (!raw || typeof raw !== "object") {
    return {
      leads: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }

  const root = raw as Record<string, unknown>;
  const payload = (root.data || root) as Record<string, unknown>;

  const rawLeads = Array.isArray(payload.leads)
    ? payload.leads
    : Array.isArray(payload)
    ? payload
    : Array.isArray(root.leads)
    ? root.leads
    : [];

  const rawPagination = (payload.pagination || root.pagination || {}) as Record<string, unknown>;

  const page = Number(rawPagination.page) || 1;
  const limit = Number(rawPagination.limit) || rawLeads.length || 10;
  const total = Number(rawPagination.total) ?? rawLeads.length;
  const totalPages = Number(rawPagination.totalPages) || (limit > 0 ? Math.ceil(total / limit) : 1);

  return {
    leads: rawLeads.map(sanitizeLead),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
