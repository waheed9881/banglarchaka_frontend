import { apiFetch } from './api';

type ApiPaginated<T> = {
  data?: {
    data?: T[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

export type PaginatedResult<T> = {
  rows: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

function parsePaginated<T>(payload: ApiPaginated<T>): PaginatedResult<T> {
  const inner = payload.data;
  if (!inner || Array.isArray(inner)) {
    return { rows: [], currentPage: 1, lastPage: 1, total: 0 };
  }
  return {
    rows: inner.data || [],
    currentPage: inner.current_page || 1,
    lastPage: inner.last_page || 1,
    total: inner.total || 0,
  };
}

export type ChartAccountDto = {
  id: number;
  code: string;
  name: string;
  type: string;
};

export type JournalLineDto = {
  id?: number;
  chart_of_account_id: number;
  debit: string | number;
  credit: string | number;
  description?: string | null;
  chart_of_account?: ChartAccountDto;
};

export type JournalEntryDto = {
  id: number;
  reference?: string | null;
  entry_date: string;
  memo?: string | null;
  created_by_user_id?: number | null;
  created_by?: { id: number; name: string };
  lines?: JournalLineDto[];
};

export type ExpenseDto = {
  id: number;
  vendor?: string | null;
  amount: string;
  category?: string | null;
  incurred_on: string;
  notes?: string | null;
  recorded_by?: { id: number; name: string };
};

export async function fetchChartAccounts(params: { page?: number; per_page?: number; type?: string } = {}): Promise<PaginatedResult<ChartAccountDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  if (params.type) q.set('type', params.type);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<ChartAccountDto>>(`/admin/finance/chart-of-accounts${suffix}`);
  return parsePaginated(payload);
}

export async function createChartAccount(body: { code: string; name: string; type: string }): Promise<void> {
  await apiFetch('/admin/finance/chart-of-accounts', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteChartAccount(id: number): Promise<void> {
  await apiFetch(`/admin/finance/chart-of-accounts/${id}`, { method: 'DELETE' });
}

export async function fetchJournalEntries(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<JournalEntryDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<JournalEntryDto>>(`/admin/finance/journal-entries${suffix}`);
  return parsePaginated(payload);
}

export async function fetchJournalEntry(id: number): Promise<JournalEntryDto | null> {
  try {
    const payload = await apiFetch<{ data: JournalEntryDto }>(`/admin/finance/journal-entries/${id}`);
    return payload.data;
  } catch {
    return null;
  }
}

export async function createJournalEntry(body: {
  reference?: string;
  entry_date: string;
  memo?: string;
  lines: Array<{ chart_of_account_id: number; debit: number; credit: number; description?: string }>;
}): Promise<void> {
  await apiFetch('/admin/finance/journal-entries', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteJournalEntry(id: number): Promise<void> {
  await apiFetch(`/admin/finance/journal-entries/${id}`, { method: 'DELETE' });
}

export async function fetchExpenses(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<ExpenseDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<ExpenseDto>>(`/admin/finance/expenses${suffix}`);
  return parsePaginated(payload);
}

export async function createExpense(body: {
  vendor?: string;
  amount: number;
  category?: string;
  incurred_on: string;
  notes?: string;
}): Promise<void> {
  await apiFetch('/admin/finance/expenses', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteExpense(id: number): Promise<void> {
  await apiFetch(`/admin/finance/expenses/${id}`, { method: 'DELETE' });
}
