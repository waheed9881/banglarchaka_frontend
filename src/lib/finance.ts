import { apiDownload, apiFetch, apiFetchText } from './api';

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

export type FinanceRecordType =
  | 'subscription_billing'
  | 'invoice'
  | 'commission'
  | 'ad_revenue'
  | 'refund'
  | 'bank_reconciliation'
  | 'tax'
  | 'budget'
  | 'accounts_payable'
  | 'accounts_receivable';

export type FinanceRecordDto = {
  id: number;
  record_type: FinanceRecordType;
  title: string;
  reference?: string | null;
  counterparty?: string | null;
  status?: string | null;
  amount: string;
  tax_amount?: string;
  recorded_on: string;
  due_on?: string | null;
  notes?: string | null;
};

export type FinanceDashboardDto = {
  from_date: string;
  to_date: string;
  revenue_dashboard: {
    total_revenue: number;
    ad_revenue: number;
    commission: number;
    refunds: number;
  };
  subscription_metrics: {
    mrr: number;
    arr: number;
  };
  operations: Record<string, number>;
  reports: {
    pnl: { revenue: number; expenses: number; net_profit: number };
    cash_flow: { cash_in: number; cash_out: number; net_cash_flow: number };
  };
  feature_coverage: string[];
};

export type FinanceReportDto = {
  from_date: string;
  to_date: string;
  by_type: Array<{ record_type: string; rows: number; total_amount: string | number }>;
  monthly_trend: Array<{ month: string; inflow: number; outflow: number; net: number }>;
};

export type LedgerRowDto = {
  chart_of_account_id: number;
  code: string;
  name: string;
  type: string;
  total_debit: string | number;
  total_credit: string | number;
  balance: string | number;
};

export type ReconciliationMatchDto = {
  bank_record: { id: number; title: string; amount: string | number; recorded_on: string };
  candidates: Array<{ id: number; record_type: string; title: string; amount: string | number; recorded_on: string; status?: string }>;
};

export type ReconciliationHistoryDto = {
  id: number;
  bank_record_id: number;
  matched_record_id: number;
  status: string;
  applied_at: string;
  applied_by_name?: string | null;
  bank_record_title?: string | null;
  bank_record_amount?: string | number | null;
  matched_record_title?: string | null;
  matched_record_amount?: string | number | null;
  matched_record_type?: string | null;
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

export async function fetchFinanceRecords(params: {
  page?: number;
  per_page?: number;
  record_type?: FinanceRecordType;
  status?: string;
} = {}): Promise<PaginatedResult<FinanceRecordDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  if (params.record_type) q.set('record_type', params.record_type);
  if (params.status) q.set('status', params.status);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<FinanceRecordDto>>(`/admin/finance/records${suffix}`);
  return parsePaginated(payload);
}

export async function createFinanceRecord(body: {
  record_type: FinanceRecordType;
  title: string;
  amount: number;
  recorded_on: string;
  reference?: string;
  counterparty?: string;
  status?: string;
  due_on?: string;
  tax_amount?: number;
  notes?: string;
}): Promise<void> {
  await apiFetch('/admin/finance/records', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteFinanceRecord(id: number): Promise<void> {
  await apiFetch(`/admin/finance/records/${id}`, { method: 'DELETE' });
}

export async function fetchFinanceDashboard(params: { from_date?: string; to_date?: string } = {}): Promise<FinanceDashboardDto | null> {
  const q = new URLSearchParams();
  if (params.from_date) q.set('from_date', params.from_date);
  if (params.to_date) q.set('to_date', params.to_date);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    const payload = await apiFetch<{ data: FinanceDashboardDto }>(`/admin/finance/dashboard${suffix}`);
    return payload.data;
  } catch {
    return null;
  }
}

export async function fetchFinanceReports(params: { from_date?: string; to_date?: string } = {}): Promise<FinanceReportDto | null> {
  const q = new URLSearchParams();
  if (params.from_date) q.set('from_date', params.from_date);
  if (params.to_date) q.set('to_date', params.to_date);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    const payload = await apiFetch<{ data: FinanceReportDto }>(`/admin/finance/reports${suffix}`);
    return payload.data;
  } catch {
    return null;
  }
}

export async function fetchGeneralLedger(params: { from_date?: string; to_date?: string } = {}): Promise<LedgerRowDto[]> {
  const q = new URLSearchParams();
  if (params.from_date) q.set('from_date', params.from_date);
  if (params.to_date) q.set('to_date', params.to_date);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    const payload = await apiFetch<{ data?: { rows?: LedgerRowDto[] } }>(`/admin/finance/general-ledger${suffix}`);
    return payload.data?.rows || [];
  } catch {
    return [];
  }
}

export async function downloadFinanceReportsCsv(params: { from_date?: string; to_date?: string } = {}): Promise<void> {
  const q = new URLSearchParams();
  if (params.from_date) q.set('from_date', params.from_date);
  if (params.to_date) q.set('to_date', params.to_date);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  await apiDownload(`/admin/finance/reports/export.csv${suffix}`, 'financial-reports.csv');
}

export async function downloadGeneralLedgerCsv(params: { from_date?: string; to_date?: string } = {}): Promise<void> {
  const q = new URLSearchParams();
  if (params.from_date) q.set('from_date', params.from_date);
  if (params.to_date) q.set('to_date', params.to_date);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  await apiDownload(`/admin/finance/general-ledger/export.csv${suffix}`, 'general-ledger.csv');
}

export async function fetchReconciliationAutoMatch(params: {
  from_date?: string;
  to_date?: string;
  days_tolerance?: number;
} = {}): Promise<ReconciliationMatchDto[]> {
  const q = new URLSearchParams();
  if (params.from_date) q.set('from_date', params.from_date);
  if (params.to_date) q.set('to_date', params.to_date);
  if (params.days_tolerance) q.set('days_tolerance', String(params.days_tolerance));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    const payload = await apiFetch<{ data?: { matches?: ReconciliationMatchDto[] } }>(`/admin/finance/reconciliation/auto-match${suffix}`);
    return payload.data?.matches || [];
  } catch {
    return [];
  }
}

export async function fetchInvoicePreviewHtml(id: number): Promise<string> {
  return apiFetchText(`/admin/finance/records/${id}/invoice-preview`);
}

export async function applyReconciliationMatch(bank_record_id: number, matched_record_id: number): Promise<void> {
  await apiFetch('/admin/finance/reconciliation/apply-match', {
    method: 'POST',
    body: JSON.stringify({ bank_record_id, matched_record_id }),
  });
}

export async function fetchReconciliationHistory(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<ReconciliationHistoryDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<ReconciliationHistoryDto>>(`/admin/finance/reconciliation/history${suffix}`);
  return parsePaginated(payload);
}

export async function undoReconciliationMatch(reconciliation_log_id: number): Promise<void> {
  await apiFetch('/admin/finance/reconciliation/undo-match', {
    method: 'POST',
    body: JSON.stringify({ reconciliation_log_id }),
  });
}
