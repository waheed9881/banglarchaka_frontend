import { apiFetch } from './api';
import type { ListingDto } from './marketplace';

export type PendingReviewDto = {
  id: number;
  rating: number;
  title?: string | null;
  body?: string | null;
  reviewer?: { id: number; name: string; email: string };
  approved_at?: string | null;
  moderator_note?: string | null;
  created_at?: string;
};

export type ModerationQueueDto = {
  id: number;
  queue_type: string;
  status?: string;
  assigned_to_user_id?: number | null;
  queueable_type: string;
  queueable_id: number | string;
  created_at?: string;
};

export type AdminReportDto = {
  id: number;
  reportable_type: string;
  reportable_id: number;
  reason: string;
  details?: string | null;
  status: string;
  created_at?: string;
  reporter?: { id: number; name: string; email: string };
};

export type AdminDashboardStatsDto = {
  users_total: number;
  dealers_total: number;
  listings_total: number;
  listings_pending: number;
  reviews_pending: number;
  reports_pending: number;
  moderation_queue_pending: number;
  orders_total: number;
  chart_accounts_total?: number;
  journal_entries_total?: number;
  expenses_total?: number;
};

export type PaginatedResult<T> = {
  rows: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

/** Supports Laravel paginator JSON and paginated JsonResource collections ({ data: rows[], meta }). */
function parsePaginated<T>(payload: unknown): PaginatedResult<T> {
  if (!payload || typeof payload !== 'object') {
    return { rows: [], currentPage: 1, lastPage: 1, total: 0 };
  }

  const root = payload as {
    data?: T[] | { data?: T[]; current_page?: number; last_page?: number; total?: number };
    meta?: { current_page?: number; last_page?: number; total?: number };
  };

  if (Array.isArray(root.data)) {
    const m = root.meta;
    return {
      rows: root.data,
      currentPage: m?.current_page ?? 1,
      lastPage: m?.last_page ?? 1,
      total: m?.total ?? root.data.length,
    };
  }

  const inner = root.data;
  if (inner && typeof inner === 'object' && Array.isArray(inner.data)) {
    return {
      rows: inner.data,
      currentPage: inner.current_page ?? root.meta?.current_page ?? 1,
      lastPage: inner.last_page ?? root.meta?.last_page ?? 1,
      total: inner.total ?? root.meta?.total ?? 0,
    };
  }

  return { rows: [], currentPage: 1, lastPage: 1, total: 0 };
}

export async function fetchPendingListings(params: {
  page?: number;
  per_page?: number;
} = {}): Promise<PaginatedResult<ListingDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const payload = await apiFetch<unknown>(`/admin/listings/pending${suffix}`);
  return parsePaginated<ListingDto>(payload);
}

/** All listings for admin; pass `status` to filter (omit or `all` = every status). */
export async function fetchAdminListings(params: {
  page?: number;
  per_page?: number;
  status?: string;
} = {}): Promise<PaginatedResult<ListingDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.status && params.status !== 'all') query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const payload = await apiFetch<unknown>(`/admin/listings${suffix}`);
  return parsePaginated<ListingDto>(payload);
}

export async function approveListing(id: string): Promise<void> {
  await apiFetch(`/admin/listings/${id}/approve`, { method: 'POST' });
}

export async function rejectListing(id: string, reason: string): Promise<void> {
  await apiFetch(`/admin/listings/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function disableListing(id: string): Promise<void> {
  await apiFetch(`/admin/listings/${id}/disable`, { method: 'POST' });
}

export async function enableListing(id: string): Promise<void> {
  await apiFetch(`/admin/listings/${id}/enable`, { method: 'POST' });
}

export async function fetchPendingReviews(params: {
  page?: number;
  per_page?: number;
} = {}): Promise<PaginatedResult<PendingReviewDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const payload = await apiFetch<unknown>(`/admin/reviews/pending${suffix}`);
  return parsePaginated<PendingReviewDto>(payload);
}

export async function approveReview(id: number): Promise<void> {
  await apiFetch(`/admin/reviews/${id}/approve`, { method: 'POST' });
}

export async function rejectReview(id: number, note: string): Promise<void> {
  await apiFetch(`/admin/reviews/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function fetchModerationQueue(params: {
  page?: number;
  per_page?: number;
  /** Omit or empty: pending only. Use `all` for every status. */
  status?: string;
} = {}): Promise<PaginatedResult<ModerationQueueDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const payload = await apiFetch<unknown>(`/admin/moderation-queue${suffix}`);
  return parsePaginated<ModerationQueueDto>(payload);
}

export async function assignQueueItem(itemId: number, assignedToUserId: number | null): Promise<void> {
  await apiFetch(`/admin/moderation-queue/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to_user_id: assignedToUserId }),
  });
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStatsDto | null> {
  try {
    const payload = await apiFetch<{ data: AdminDashboardStatsDto }>('/admin/dashboard/stats');
    return payload.data;
  } catch {
    return null;
  }
}

export async function fetchAdminReports(params: {
  page?: number;
  per_page?: number;
  status?: string;
  reportable_type?: string;
} = {}): Promise<PaginatedResult<AdminReportDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.status) query.set('status', params.status);
  if (params.reportable_type) query.set('reportable_type', params.reportable_type);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const payload = await apiFetch<unknown>(`/admin/reports${suffix}`);
  return parsePaginated<AdminReportDto>(payload);
}

export async function updateAdminReportStatus(reportId: number, status: string): Promise<void> {
  await apiFetch(`/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
