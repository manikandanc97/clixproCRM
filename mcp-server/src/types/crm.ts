/**
 * Sanitized CRM domain data transfer types for MCP tools.
 *
 * Security Guarantee:
 * These types define the exact public shape returned to AI agents.
 * No internal database secrets, password hashes, auth tokens, or raw traces
 * are included in these models.
 */

export interface SafeUserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  status?: string;
  tenant?: {
    id: string;
    name: string;
    slug?: string;
  };
  permissions?: string[];
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SafeLead {
  id: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  stage?: string;
  value?: number;
  source?: string;
  notes?: string;
  assignedToId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SafeCustomer {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  status?: string;
  revenue?: number;
  revenueValue?: number;
  dealsCount?: number;
  lastContactAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
