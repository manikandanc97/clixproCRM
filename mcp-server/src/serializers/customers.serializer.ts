import { PaginationMetadata, SafeCustomer } from "../types/crm.js";

/**
 * Sanitizes a single raw customer record into a safe public structure.
 */
export function sanitizeCustomer(raw: unknown): SafeCustomer {
  if (!raw || typeof raw !== "object") {
    return { id: "" };
  }

  const c = raw as Record<string, unknown>;
  const data = (c.data || c) as Record<string, unknown>;

  return {
    id: String(data.id || ""),
    name: data.name ? String(data.name) : undefined,
    email: data.email ? String(data.email) : undefined,
    company: data.company ? String(data.company) : undefined,
    status: data.status ? String(data.status) : undefined,
    revenue: typeof data.revenue === "number" ? data.revenue : data.revenue ? Number(data.revenue) : undefined,
    revenueValue:
      typeof data.revenueValue === "number"
        ? data.revenueValue
        : data.revenueValue
        ? Number(data.revenueValue)
        : undefined,
    dealsCount: typeof data.dealsCount === "number" ? data.dealsCount : undefined,
    lastContactAt: data.lastContactAt ? String(data.lastContactAt) : undefined,
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
  };
}

/**
 * Sanitizes the raw customer listing payload and extracts clean pagination metadata.
 */
export function sanitizeCustomersList(raw: unknown): {
  customers: SafeCustomer[];
  pagination: PaginationMetadata;
} {
  if (!raw || typeof raw !== "object") {
    return {
      customers: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }

  const root = raw as Record<string, unknown>;
  const payload = (root.data || root) as Record<string, unknown>;

  const rawCustomers = Array.isArray(payload.customers)
    ? payload.customers
    : Array.isArray(payload)
    ? payload
    : Array.isArray(root.customers)
    ? root.customers
    : [];

  const rawPagination = (payload.pagination || root.pagination || {}) as Record<string, unknown>;

  const page = Number(rawPagination.page) || 1;
  const limit = Number(rawPagination.limit) || rawCustomers.length || 10;
  const total = Number(rawPagination.total) ?? rawCustomers.length;
  const totalPages = Number(rawPagination.totalPages) || (limit > 0 ? Math.ceil(total / limit) : 1);

  return {
    customers: rawCustomers.map(sanitizeCustomer),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
