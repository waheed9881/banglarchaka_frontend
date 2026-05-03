import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchMe } from '@/lib/auth';
import { dp } from '@/app/components/dealerPortalTheme';
import {
  createChartAccount,
  createExpense,
  createFinanceRecord,
  createJournalEntry,
  applyReconciliationMatch,
  undoReconciliationMatch,
  downloadFinanceReportsCsv,
  downloadGeneralLedgerCsv,
  deleteChartAccount,
  deleteExpense,
  deleteFinanceRecord,
  deleteJournalEntry,
  fetchChartAccounts,
  fetchFinanceDashboard,
  fetchFinanceReports,
  fetchFinanceRecords,
  fetchExpenses,
  fetchInvoicePreviewHtml,
  fetchReconciliationHistory,
  fetchReconciliationAutoMatch,
  fetchGeneralLedger,
  fetchJournalEntries,
  fetchJournalEntry,
  type ChartAccountDto,
  type ExpenseDto,
  type FinanceDashboardDto,
  type FinanceReportDto,
  type FinanceRecordDto,
  type FinanceRecordType,
  type JournalEntryDto,
  type JournalLineDto,
  type LedgerRowDto,
  type ReconciliationMatchDto,
  type ReconciliationHistoryDto,
} from '@/lib/finance';

export type FinanceSuiteVariant = 'admin' | 'dealer';

type Tab = 'dashboard' | 'chart' | 'journal' | 'expenses' | 'records' | 'reports';

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const;
const RECORD_TYPES: FinanceRecordType[] = [
  'subscription_billing',
  'invoice',
  'commission',
  'ad_revenue',
  'refund',
  'bank_reconciliation',
  'tax',
  'budget',
  'accounts_payable',
  'accounts_receivable',
];

export function FinanceSuitePanel({ variant }: { variant: FinanceSuiteVariant }) {
  const allowedRoleSet = useMemo(
    () =>
      new Set(
        variant === 'dealer'
          ? ['dealer', 'super_admin', 'admin', 'finance_officer', 'account_manager']
          : ['super_admin', 'admin', 'finance_officer', 'account_manager'],
      ),
    [variant],
  );
  const portalHref = variant === 'dealer' ? '/dealer/portal' : '/admin';
  const portalLabel = variant === 'dealer' ? 'Dealer dashboard' : 'Admin portal';

  const [tab, setTab] = useState<Tab>('dashboard');
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [accounts, setAccounts] = useState<ChartAccountDto[]>([]);
  const [coCode, setCoCode] = useState('');
  const [coName, setCoName] = useState('');
  const [coType, setCoType] = useState<string>('asset');

  const [journals, setJournals] = useState<JournalEntryDto[]>([]);
  const [journalDetail, setJournalDetail] = useState<JournalEntryDto | null>(null);
  const [jeDate, setJeDate] = useState('');
  const [jeRef, setJeRef] = useState('');
  const [jeMemo, setJeMemo] = useState('');
  const [jeLines, setJeLines] = useState<Array<{ accountId: string; debit: string; credit: string; description: string }>>([
    { accountId: '', debit: '', credit: '', description: '' },
    { accountId: '', debit: '', credit: '', description: '' },
  ]);

  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [exVendor, setExVendor] = useState('');
  const [exAmount, setExAmount] = useState('');
  const [exCat, setExCat] = useState('');
  const [exDate, setExDate] = useState('');
  const [exNotes, setExNotes] = useState('');
  const [dashboard, setDashboard] = useState<FinanceDashboardDto | null>(null);
  const [records, setRecords] = useState<FinanceRecordDto[]>([]);
  const [frType, setFrType] = useState<FinanceRecordType>('invoice');
  const [frTitle, setFrTitle] = useState('');
  const [frAmount, setFrAmount] = useState('');
  const [frDate, setFrDate] = useState('');
  const [frDueDate, setFrDueDate] = useState('');
  const [frStatus, setFrStatus] = useState('draft');
  const [frReference, setFrReference] = useState('');
  const [frCounterparty, setFrCounterparty] = useState('');
  const [frTaxAmount, setFrTaxAmount] = useState('');
  const [frNotes, setFrNotes] = useState('');
  const [recordsFilterType, setRecordsFilterType] = useState<FinanceRecordType | ''>('');
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reports, setReports] = useState<FinanceReportDto | null>(null);
  const [ledgerRows, setLedgerRows] = useState<LedgerRowDto[]>([]);
  const [recoMatches, setRecoMatches] = useState<ReconciliationMatchDto[]>([]);
  const [recoHistory, setRecoHistory] = useState<ReconciliationHistoryDto[]>([]);

  const chartFormErrors = {
    code: !coCode.trim() ? 'Account code is required.' : '',
    name: !coName.trim() ? 'Account name is required.' : '',
  };
  const chartFormInvalid = !!(chartFormErrors.code || chartFormErrors.name);

  const expenseAmountNum = Number(exAmount);
  const expenseFormErrors = {
    amount: !Number.isFinite(expenseAmountNum) || expenseAmountNum <= 0 ? 'Amount must be greater than zero.' : '',
    date: !exDate.trim() ? 'Expense date is required.' : '',
  };
  const expenseFormInvalid = !!(expenseFormErrors.amount || expenseFormErrors.date);

  const financeAmountNum = Number(frAmount);
  const financeTaxNum = Number(frTaxAmount || 0);
  const financeRecordErrors = {
    title: !frTitle.trim() ? 'Record title is required.' : '',
    recorded_on: !frDate.trim() ? 'Recorded date is required.' : '',
    amount: !Number.isFinite(financeAmountNum) || financeAmountNum < 0 ? 'Amount must be zero or positive.' : '',
    tax: frTaxAmount.trim() && (!Number.isFinite(financeTaxNum) || financeTaxNum < 0) ? 'Tax must be zero or positive.' : '',
    due_on: frDueDate && frDate && frDueDate < frDate ? 'Due date cannot be before recorded date.' : '',
  };
  const financeRecordInvalid = !!(
    financeRecordErrors.title ||
    financeRecordErrors.recorded_on ||
    financeRecordErrors.amount ||
    financeRecordErrors.tax ||
    financeRecordErrors.due_on
  );

  const validateChartAccountForm = (): boolean => {
    const firstError = chartFormErrors.code || chartFormErrors.name;
    if (firstError) {
      setMessage(firstError);
      return false;
    }
    return true;
  };

  const validateExpenseForm = (): boolean => {
    const firstError = expenseFormErrors.amount || expenseFormErrors.date;
    if (firstError) {
      setMessage(firstError);
      return false;
    }
    return true;
  };

  const validateFinanceRecordForm = (): boolean => {
    const firstError =
      financeRecordErrors.title ||
      financeRecordErrors.recorded_on ||
      financeRecordErrors.amount ||
      financeRecordErrors.tax ||
      financeRecordErrors.due_on;
    if (firstError) {
      setMessage(firstError);
      return false;
    }
    return true;
  };

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const data = await fetchFinanceDashboard();
        setDashboard(data);
        setTotal(data?.feature_coverage?.length || 0);
        setLastPage(1);
      } else if (tab === 'chart') {
        const data = await fetchChartAccounts({ page, per_page: 50 });
        setAccounts(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'journal') {
        const [coData, jData] = await Promise.all([
          fetchChartAccounts({ page: 1, per_page: 500 }),
          fetchJournalEntries({ page, per_page: 20 }),
        ]);
        setAccounts(coData.rows);
        setJournals(jData.rows);
        setLastPage(jData.lastPage);
        setTotal(jData.total);
      } else if (tab === 'expenses') {
        const data = await fetchExpenses({ page, per_page: 25 });
        setExpenses(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'records') {
        const data = await fetchFinanceRecords({
          page,
          per_page: 20,
          record_type: recordsFilterType || undefined,
        });
        setRecords(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else {
        const [reportData, ledgerData, autoMatch, historyData] = await Promise.all([
          fetchFinanceReports({
            from_date: reportFrom || undefined,
            to_date: reportTo || undefined,
          }),
          fetchGeneralLedger({
            from_date: reportFrom || undefined,
            to_date: reportTo || undefined,
          }),
          fetchReconciliationAutoMatch({
            from_date: reportFrom || undefined,
            to_date: reportTo || undefined,
          }),
          fetchReconciliationHistory({ page: 1, per_page: 20 }),
        ]);
        setReports(reportData);
        setLedgerRows(ledgerData);
        setRecoMatches(autoMatch);
        setRecoHistory(historyData.rows);
        setLastPage(1);
        setTotal((reportData?.by_type.length || 0) + ledgerData.length + autoMatch.length + historyData.rows.length);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe()
      .then((me) => setCanAccess(!!me?.roles?.some((r) => allowedRoleSet.has(r.name))))
      .catch(() => setCanAccess(false));
  }, [allowedRoleSet]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [tab, page, recordsFilterType, reportFrom, reportTo]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const openJournal = async (id: number) => {
    const d = await fetchJournalEntry(id);
    setJournalDetail(d);
  };

  const addJeLine = () => {
    setJeLines((rows) => [...rows, { accountId: '', debit: '', credit: '', description: '' }]);
  };

  const submitJournal = async () => {
    const lines = jeLines
      .map((row) => ({
        chart_of_account_id: Number(row.accountId),
        debit: Number(row.debit) || 0,
        credit: Number(row.credit) || 0,
        description: row.description.trim() || undefined,
      }))
      .filter((row) => row.chart_of_account_id > 0);

    if (lines.length < 2) {
      setMessage('Need at least two lines with valid accounts.');
      return;
    }

    const td = lines.reduce((s, l) => s + l.debit, 0);
    const tc = lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(td - tc) > 0.01) {
      setMessage(`Debits (${td}) must equal credits (${tc}).`);
      return;
    }

    if (!jeDate.trim()) {
      setMessage('Entry date required');
      return;
    }

    try {
      await createJournalEntry({
        entry_date: jeDate.trim(),
        reference: jeRef.trim() || undefined,
        memo: jeMemo.trim() || undefined,
        lines,
      });
      setMessage('Journal posted');
      setJeRef('');
      setJeMemo('');
      setJeLines([
        { accountId: '', debit: '', credit: '', description: '' },
        { accountId: '', debit: '', credit: '', description: '' },
      ]);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Journal failed');
    }
  };

  const isAdmin = variant === 'admin';
  const shellClass = isAdmin ? 'min-h-full bg-gray-50' : '';

  if (canAccess === false) {
    return (
      <div className={shellClass || 'rounded-2xl'}>
        <div className={`max-w-4xl mx-auto px-4 ${isAdmin ? 'py-10' : 'py-6'}`}>
          <div className={`${dp.card} ${dp.cardPad} text-center`}>
            <h2 className={dp.heroTitle}>Finance access required</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {variant === 'dealer'
                ? 'Finance tools require a dealer or finance admin role.'
                : 'Finance requires super admin, admin, finance officer, or account manager.'}
            </p>
            <Link to={portalHref} className={`mt-6 inline-flex ${dp.btnSecondary}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {portalLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lineAccountLabel = (line: JournalLineDto) =>
    line.chart_of_account ? `${line.chart_of_account.code} — ${line.chart_of_account.name}` : `#${line.chart_of_account_id}`;

  const tabBtn = (active: boolean) =>
    isAdmin
      ? `px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
          active ? 'bg-[#233D7B] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`
      : dp.tab(active);

  return (
    <div className={shellClass}>
      <div
        className={
          isAdmin
            ? 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'
            : 'max-w-6xl mx-auto px-4 sm:px-4 pb-8'
        }
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {isAdmin ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
                <p className="mt-1 text-sm text-gray-600 max-w-2xl leading-relaxed">
                  Chart of accounts, journals, expenses, billing, and financial reports.
                </p>
              </>
            ) : (
              <>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#233D7B]/80">Ledger & cashflow</p>
                <h2 className={dp.heroTitle}>Finance suite</h2>
                <p className={dp.heroSubtitle}>
                  Chart of accounts, balanced journals, and operational expenses — tenant-safe for your showroom.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={portalHref}
              className={
                isAdmin
                  ? 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                  : dp.btnSecondary
              }
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {portalLabel}
            </Link>
            <button
              type="button"
              onClick={() => load().catch(() => undefined)}
              className={
                isAdmin
                  ? 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#233D7B] hover:bg-[#1a2d5a]'
                  : dp.btnPrimary
              }
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh
            </button>
          </div>
        </div>

        <div
          className={
            isAdmin
              ? 'mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex flex-wrap gap-2'
              : `${dp.cardMuted} mb-6 flex flex-wrap gap-1 p-1.5`
          }
        >
          {(
            [
              ['dashboard', 'Revenue Dashboard'],
              ['chart', 'Chart of accounts'],
              ['journal', 'Journal'],
              ['expenses', 'Expenses'],
              ['records', 'Billing / AP-AR'],
              ['reports', 'Financial Reports'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={tabBtn(tab === key)}>
              {label}
            </button>
          ))}
        </div>

        {message ? (
          <div
            className={
              isAdmin ? 'mb-4 px-4 py-2 rounded border border-blue-100 bg-blue-50 text-blue-900 text-sm' : `mb-6 ${dp.alert}`
            }
          >
            {message}
          </div>
        ) : null}

        {loading ? (
          <div
            className={
              isAdmin
                ? 'bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-6 flex items-center gap-3 text-gray-600 text-sm'
                : `${dp.card} ${dp.cardPad} flex items-center gap-3 text-slate-600`
            }
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#233D7B] border-t-transparent" aria-hidden />
            Loading finance data…
          </div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>Revenue Dashboard</h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <div>Total revenue: <strong className="tabular-nums">৳ {dashboard?.revenue_dashboard.total_revenue ?? 0}</strong></div>
                    <div>Ad revenue: <strong className="tabular-nums">৳ {dashboard?.revenue_dashboard.ad_revenue ?? 0}</strong></div>
                    <div>Commission: <strong className="tabular-nums">৳ {dashboard?.revenue_dashboard.commission ?? 0}</strong></div>
                    <div>Refunds: <strong className="tabular-nums">৳ {dashboard?.revenue_dashboard.refunds ?? 0}</strong></div>
                  </div>
                </div>
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>MRR / ARR Tracking</h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <div>MRR: <strong className="tabular-nums">৳ {dashboard?.subscription_metrics.mrr ?? 0}</strong></div>
                    <div>ARR: <strong className="tabular-nums">৳ {dashboard?.subscription_metrics.arr ?? 0}</strong></div>
                  </div>
                </div>
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>Financial Reports</h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <div>P&L Revenue: <strong className="tabular-nums">৳ {dashboard?.reports.pnl.revenue ?? 0}</strong></div>
                    <div>P&L Expenses: <strong className="tabular-nums">৳ {dashboard?.reports.pnl.expenses ?? 0}</strong></div>
                    <div>Net Profit: <strong className="tabular-nums">৳ {dashboard?.reports.pnl.net_profit ?? 0}</strong></div>
                  </div>
                </div>
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>Cash Flow Reports</h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <div>Cash In: <strong className="tabular-nums">৳ {dashboard?.reports.cash_flow.cash_in ?? 0}</strong></div>
                    <div>Cash Out: <strong className="tabular-nums">৳ {dashboard?.reports.cash_flow.cash_out ?? 0}</strong></div>
                    <div>Net Cash Flow: <strong className="tabular-nums">৳ {dashboard?.reports.cash_flow.net_cash_flow ?? 0}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'chart' && (
              <div className="space-y-6">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-4 gap-4 items-end`}>
                  <div>
                    <input value={coCode} onChange={(e) => setCoCode(e.target.value)} placeholder="Account code" className={dp.input} />
                    {chartFormErrors.code ? <p className="mt-1 text-xs text-rose-600">{chartFormErrors.code}</p> : null}
                  </div>
                  <div className="md:col-span-2">
                    <input value={coName} onChange={(e) => setCoName(e.target.value)} placeholder="Account name" className={dp.input} />
                    {chartFormErrors.name ? <p className="mt-1 text-xs text-rose-600">{chartFormErrors.name}</p> : null}
                  </div>
                  <select value={coType} onChange={(e) => setCoType(e.target.value)} className={dp.select}>
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!validateChartAccountForm()) {
                        return;
                      }
                      try {
                        await createChartAccount({ code: coCode.trim(), name: coName.trim(), type: coType });
                        setCoCode('');
                        setCoName('');
                        setMessage('Account added');
                        await load();
                      } catch (err) {
                        setMessage(err instanceof Error ? err.message : 'Failed');
                      }
                    }}
                    disabled={chartFormInvalid}
                    className={`${dp.btnAccent} md:col-span-4 justify-self-start disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Add account
                  </button>
                </div>
                <div className={dp.tableWrap}>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className={dp.tableHead}>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 w-24" />
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-mono text-slate-800">{a.code}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
                          <td className="px-4 py-3 capitalize text-slate-600">{a.type}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm('Delete this account?')) return;
                                try {
                                  await deleteChartAccount(a.id);
                                  setMessage('Deleted');
                                  await load();
                                } catch (err) {
                                  setMessage(err instanceof Error ? err.message : 'Failed');
                                }
                              }}
                              className={dp.btnDanger}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!accounts.length && <div className="p-8 text-center text-sm text-slate-500">No accounts in this workspace.</div>}
                </div>
              </div>
            )}

            {tab === 'journal' && (
              <div className="space-y-8">
                <div className={`${dp.card} ${dp.cardPad} space-y-5`}>
                  <div>
                    <h3 className={dp.sectionTitle}>New journal entry</h3>
                    <p className={dp.sectionHint}>Debits must equal credits before posting.</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input type="date" value={jeDate} onChange={(e) => setJeDate(e.target.value)} className={dp.input} />
                    <input value={jeRef} onChange={(e) => setJeRef(e.target.value)} placeholder="Reference" className={dp.input} />
                    <input value={jeMemo} onChange={(e) => setJeMemo(e.target.value)} placeholder="Memo" className={`${dp.input} md:col-span-3`} />
                  </div>
                  <div className="space-y-3">
                    {jeLines.map((row, idx) => (
                      <div key={idx} className="grid md:grid-cols-12 gap-2 items-center rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                        <select
                          value={row.accountId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setJeLines((lines) => lines.map((l, i) => (i === idx ? { ...l, accountId: v } : l)));
                          }}
                          className={`md:col-span-5 ${dp.select} text-sm py-2`}
                        >
                          <option value="">Account…</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} — {a.name}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Debit"
                          value={row.debit}
                          onChange={(e) =>
                            setJeLines((lines) => lines.map((l, i) => (i === idx ? { ...l, debit: e.target.value } : l)))
                          }
                          className={`md:col-span-2 ${dp.input} text-sm tabular-nums`}
                        />
                        <input
                          placeholder="Credit"
                          value={row.credit}
                          onChange={(e) =>
                            setJeLines((lines) => lines.map((l, i) => (i === idx ? { ...l, credit: e.target.value } : l)))
                          }
                          className={`md:col-span-2 ${dp.input} text-sm tabular-nums`}
                        />
                        <input
                          placeholder="Line memo"
                          value={row.description}
                          onChange={(e) =>
                            setJeLines((lines) => lines.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)))
                          }
                          className={`md:col-span-3 ${dp.input} text-sm`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="button" onClick={addJeLine} className={`${dp.btnSecondary} text-sm`}>
                      Add line
                    </button>
                    <button type="button" onClick={() => submitJournal()} className={`${dp.btnPrimary} text-sm`}>
                      Post balanced entry
                    </button>
                  </div>
                </div>

                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  <div className={`${dp.cardPad} border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-900`}>Recent entries</div>
                  {journals.map((j) => (
                    <div key={j.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:justify-between md:items-start hover:bg-slate-50/80">
                      <div className="text-sm">
                        <div className="font-semibold text-slate-900">
                          #{j.id} • {j.entry_date} {j.reference ? `• ${j.reference}` : ''}
                        </div>
                        {j.memo && <div className="mt-1 text-slate-600">{j.memo}</div>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openJournal(j.id)} className={`${dp.btnSecondary} text-sm`}>
                          Lines
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Delete this journal entry?')) return;
                            try {
                              await deleteJournalEntry(j.id);
                              setMessage('Journal deleted');
                              setJournalDetail(null);
                              await load();
                            } catch (err) {
                              setMessage(err instanceof Error ? err.message : 'Failed');
                            }
                          }}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {!journals.length && <div className="p-8 text-center text-sm text-slate-500">No journal entries yet.</div>}
                </div>

                {journalDetail?.lines && journalDetail.lines.length > 0 && (
                  <div className={`${dp.card} ${dp.cardPad}`}>
                    <div className="mb-4 font-semibold text-slate-900">Entry #{journalDetail.id} — line detail</div>
                    <div className={dp.tableWrap}>
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className={dp.tableHead}>
                            <th className="px-4 py-3">Account</th>
                            <th className="px-4 py-3">Debit</th>
                            <th className="px-4 py-3">Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {journalDetail.lines.map((line) => (
                            <tr key={line.id ?? `${line.chart_of_account_id}-${line.debit}-${line.credit}`} className="border-b border-slate-100">
                              <td className="px-4 py-3">{lineAccountLabel(line)}</td>
                              <td className="px-4 py-3 tabular-nums">{line.debit}</td>
                              <td className="px-4 py-3 tabular-nums">{line.credit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'expenses' && (
              <div className="space-y-6">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-6 gap-4 items-end`}>
                  <input value={exVendor} onChange={(e) => setExVendor(e.target.value)} placeholder="Vendor" className={`${dp.input} md:col-span-2`} />
                  <div>
                    <input value={exAmount} onChange={(e) => setExAmount(e.target.value)} placeholder="Amount" className={`${dp.input} tabular-nums`} />
                    {expenseFormErrors.amount ? <p className="mt-1 text-xs text-rose-600">{expenseFormErrors.amount}</p> : null}
                  </div>
                  <input value={exCat} onChange={(e) => setExCat(e.target.value)} placeholder="Category" className={dp.input} />
                  <div>
                    <input type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} className={dp.input} />
                    {expenseFormErrors.date ? <p className="mt-1 text-xs text-rose-600">{expenseFormErrors.date}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!validateExpenseForm()) {
                        return;
                      }
                      const amt = Number(exAmount);
                      try {
                        await createExpense({
                          vendor: exVendor.trim() || undefined,
                          amount: amt,
                          category: exCat.trim() || undefined,
                          incurred_on: exDate.trim(),
                          notes: exNotes.trim() || undefined,
                        });
                        setExVendor('');
                        setExAmount('');
                        setExCat('');
                        setExNotes('');
                        setMessage('Expense saved');
                        await load();
                      } catch (err) {
                        setMessage(err instanceof Error ? err.message : 'Failed');
                      }
                    }}
                    disabled={expenseFormInvalid}
                    className={`${dp.btnPrimary} md:col-span-6 justify-self-start disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Record expense
                  </button>
                  <textarea value={exNotes} onChange={(e) => setExNotes(e.target.value)} placeholder="Notes" className={`md:col-span-6 ${dp.textarea} min-h-[88px]`} />
                </div>
                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {expenses.map((x) => (
                    <div key={x.id} className="flex flex-col gap-3 px-5 py-4 text-sm md:flex-row md:justify-between md:items-start hover:bg-slate-50/80">
                      <div>
                        <div className="font-semibold text-slate-900">{x.vendor || 'Vendor N/A'}</div>
                        <div className="text-slate-600">
                          {x.incurred_on} • {x.category || 'uncategorized'} •{' '}
                          <span className="font-semibold tabular-nums text-slate-800">৳ {x.amount}</span>
                        </div>
                        {x.notes && <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">{x.notes}</div>}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete expense?')) return;
                          try {
                            await deleteExpense(x.id);
                            setMessage('Expense deleted');
                            await load();
                          } catch (err) {
                            setMessage(err instanceof Error ? err.message : 'Failed');
                          }
                        }}
                        className={`${dp.btnDanger} self-start`}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {!expenses.length && <div className="p-8 text-center text-sm text-slate-500">No expenses recorded.</div>}
                </div>
              </div>
            )}

            {tab === 'records' && (
              <div className="space-y-6">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-8 gap-3 items-end`}>
                  <select value={frType} onChange={(e) => setFrType(e.target.value as FinanceRecordType)} className={dp.select}>
                    {RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                  <input value={frTitle} onChange={(e) => setFrTitle(e.target.value)} placeholder="Title" className={`${dp.input} md:col-span-2`} />
                  {financeRecordErrors.title ? <p className="md:col-span-2 mt-1 text-xs text-rose-600">{financeRecordErrors.title}</p> : <div className="md:col-span-2" />}
                  <input value={frReference} onChange={(e) => setFrReference(e.target.value)} placeholder="Reference" className={dp.input} />
                  <input value={frAmount} onChange={(e) => setFrAmount(e.target.value)} placeholder="Amount" className={dp.input} />
                  {financeRecordErrors.amount ? <p className="mt-1 text-xs text-rose-600">{financeRecordErrors.amount}</p> : null}
                  <input value={frTaxAmount} onChange={(e) => setFrTaxAmount(e.target.value)} placeholder="Tax amount" className={dp.input} />
                  {financeRecordErrors.tax ? <p className="mt-1 text-xs text-rose-600">{financeRecordErrors.tax}</p> : null}
                  <input type="date" value={frDate} onChange={(e) => setFrDate(e.target.value)} className={dp.input} />
                  {financeRecordErrors.recorded_on ? <p className="mt-1 text-xs text-rose-600">{financeRecordErrors.recorded_on}</p> : null}
                  <input type="date" value={frDueDate} onChange={(e) => setFrDueDate(e.target.value)} className={dp.input} />
                  {financeRecordErrors.due_on ? <p className="mt-1 text-xs text-rose-600">{financeRecordErrors.due_on}</p> : null}
                  <input value={frCounterparty} onChange={(e) => setFrCounterparty(e.target.value)} placeholder="Counterparty" className={`${dp.input} md:col-span-2`} />
                  <input value={frStatus} onChange={(e) => setFrStatus(e.target.value)} placeholder="Status" className={dp.input} />
                  <textarea value={frNotes} onChange={(e) => setFrNotes(e.target.value)} placeholder="Notes" className={`md:col-span-8 ${dp.textarea} min-h-[72px]`} />
                  <button
                    type="button"
                    disabled={financeRecordInvalid}
                    className={`${dp.btnPrimary} md:col-span-8 justify-self-start disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={async () => {
                      if (!validateFinanceRecordForm()) {
                        return;
                      }
                      const amt = Number(frAmount);
                      try {
                        await createFinanceRecord({
                          record_type: frType,
                          title: frTitle.trim(),
                          amount: amt,
                          recorded_on: frDate,
                          due_on: frDueDate || undefined,
                          reference: frReference.trim() || undefined,
                          counterparty: frCounterparty.trim() || undefined,
                          status: frStatus.trim() || 'draft',
                          tax_amount: Number(frTaxAmount) || undefined,
                          notes: frNotes.trim() || undefined,
                        });
                        setFrTitle('');
                        setFrAmount('');
                        setFrReference('');
                        setFrCounterparty('');
                        setFrDueDate('');
                        setFrTaxAmount('');
                        setFrNotes('');
                        setMessage('Finance record created');
                        await load();
                      } catch (err) {
                        setMessage(err instanceof Error ? err.message : 'Failed');
                      }
                    }}
                  >
                    Save record
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select value={recordsFilterType} onChange={(e) => setRecordsFilterType((e.target.value || '') as FinanceRecordType | '')} className={dp.select}>
                    <option value="">All modules</option>
                    {RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {records.map((r) => (
                    <div key={r.id} className="flex flex-col gap-3 px-5 py-4 text-sm md:flex-row md:justify-between md:items-start hover:bg-slate-50/80">
                      <div>
                        <div className="font-semibold text-slate-900">{r.title}</div>
                        <div className="text-slate-600">
                          {r.record_type.replaceAll('_', ' ')} • {r.recorded_on} •{' '}
                          <span className="font-semibold tabular-nums text-slate-800">৳ {r.amount}</span> • {r.status || 'draft'}
                        </div>
                        <div className="text-slate-500">
                          {r.reference ? `Ref: ${r.reference} • ` : ''}{r.counterparty || 'No counterparty'}{r.due_on ? ` • Due: ${r.due_on}` : ''}
                          {(Number(r.tax_amount || 0) > 0) ? ` • Tax: ৳ ${r.tax_amount}` : ''}
                        </div>
                        {r.notes ? <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">{r.notes}</div> : null}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete finance record?')) return;
                          try {
                            await deleteFinanceRecord(r.id);
                            setMessage('Record deleted');
                            await load();
                          } catch (err) {
                            setMessage(err instanceof Error ? err.message : 'Failed');
                          }
                        }}
                        className={`${dp.btnDanger} self-start`}
                      >
                        Delete
                      </button>
                      {r.record_type === 'invoice' ? (
                        <button
                          type="button"
                          className={`${dp.btnSecondary} self-start`}
                          onClick={async () => {
                            try {
                              const html = await fetchInvoicePreviewHtml(r.id);
                              const w = window.open('', '_blank');
                              if (!w) {
                                setMessage('Popup blocked by browser.');
                                return;
                              }
                              w.document.write(html);
                              w.document.close();
                            } catch (err) {
                              setMessage(err instanceof Error ? err.message : 'Invoice preview failed');
                            }
                          }}
                        >
                          Invoice Preview
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {!records.length && <div className="p-8 text-center text-sm text-slate-500">No finance records yet.</div>}
                </div>
              </div>
            )}

            {tab === 'reports' && (
              <div className="space-y-6">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-6 gap-3 items-end`}>
                  <input type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} className={dp.input} />
                  <input type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} className={dp.input} />
                  <div className="md:col-span-4 text-sm text-slate-600">
                    Financial Reports, P&L, Cash Flow, and General Ledger with date filters.
                  </div>
                  <button
                    type="button"
                    className={dp.btnSecondary}
                    onClick={() =>
                      downloadFinanceReportsCsv({ from_date: reportFrom || undefined, to_date: reportTo || undefined }).catch(() =>
                        setMessage('CSV export failed'),
                      )
                    }
                  >
                    Export Reports CSV
                  </button>
                  <button
                    type="button"
                    className={dp.btnSecondary}
                    onClick={() =>
                      downloadGeneralLedgerCsv({ from_date: reportFrom || undefined, to_date: reportTo || undefined }).catch(() =>
                        setMessage('Ledger CSV export failed'),
                      )
                    }
                  >
                    Export Ledger CSV
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className={`${dp.card} ${dp.cardPad}`}>
                    <h3 className={dp.sectionTitle}>P&L Report</h3>
                    <div className="mt-3 space-y-1 text-sm text-slate-700">
                      <div>Revenue: <strong className="tabular-nums">৳ {dashboard?.reports.pnl.revenue ?? 0}</strong></div>
                      <div>Expenses: <strong className="tabular-nums">৳ {dashboard?.reports.pnl.expenses ?? 0}</strong></div>
                      <div>Net Profit: <strong className="tabular-nums">৳ {dashboard?.reports.pnl.net_profit ?? 0}</strong></div>
                    </div>
                  </div>
                  <div className={`${dp.card} ${dp.cardPad}`}>
                    <h3 className={dp.sectionTitle}>Cash Flow Report</h3>
                    <div className="mt-3 space-y-1 text-sm text-slate-700">
                      <div>Cash In: <strong className="tabular-nums">৳ {dashboard?.reports.cash_flow.cash_in ?? 0}</strong></div>
                      <div>Cash Out: <strong className="tabular-nums">৳ {dashboard?.reports.cash_flow.cash_out ?? 0}</strong></div>
                      <div>Net Cash Flow: <strong className="tabular-nums">৳ {dashboard?.reports.cash_flow.net_cash_flow ?? 0}</strong></div>
                    </div>
                  </div>
                </div>

                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>Financial Report Breakdown</h3>
                  <div className={dp.tableWrap}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={dp.tableHead}>
                          <th className="px-4 py-3">Module</th>
                          <th className="px-4 py-3">Rows</th>
                          <th className="px-4 py-3">Total amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reports?.by_type || []).map((row) => (
                          <tr key={row.record_type} className="border-b border-slate-100">
                            <td className="px-4 py-3 capitalize">{row.record_type.replaceAll('_', ' ')}</td>
                            <td className="px-4 py-3 tabular-nums">{row.rows}</td>
                            <td className="px-4 py-3 tabular-nums">৳ {row.total_amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>General Ledger</h3>
                  <div className={dp.tableWrap}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={dp.tableHead}>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Account</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Debit</th>
                          <th className="px-4 py-3">Credit</th>
                          <th className="px-4 py-3">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerRows.map((row) => (
                          <tr key={row.chart_of_account_id} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-mono">{row.code}</td>
                            <td className="px-4 py-3">{row.name}</td>
                            <td className="px-4 py-3 capitalize">{row.type}</td>
                            <td className="px-4 py-3 tabular-nums">{row.total_debit}</td>
                            <td className="px-4 py-3 tabular-nums">{row.total_credit}</td>
                            <td className="px-4 py-3 tabular-nums">{row.balance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>Bank Reconciliation Auto-Match</h3>
                  <p className={dp.sectionHint}>Matching suggestions between bank reconciliation and AP/AR entries.</p>
                  <div className={`${dp.cardMuted} mt-4 divide-y divide-slate-200`}>
                    {recoMatches.map((m) => (
                      <div key={m.bank_record.id} className="px-4 py-3 text-sm">
                        <div className="font-semibold text-slate-900">
                          Bank #{m.bank_record.id} — {m.bank_record.title} — ৳ {m.bank_record.amount}
                        </div>
                        <div className="text-slate-600">Date: {m.bank_record.recorded_on}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.candidates.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className={`${dp.btnSecondary} text-xs`}
                              onClick={async () => {
                                try {
                                  await applyReconciliationMatch(m.bank_record.id, c.id);
                                  setMessage(`Matched bank #${m.bank_record.id} with #${c.id}`);
                                  await load();
                                } catch (err) {
                                  setMessage(err instanceof Error ? err.message : 'Apply match failed');
                                }
                              }}
                            >
                              Match #{c.id} ({c.record_type}, ৳ {c.amount})
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!recoMatches.length && <div className="px-4 py-3 text-sm text-slate-500">No auto-match suggestions found.</div>}
                  </div>
                </div>

                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className={dp.sectionTitle}>Reconciliation Audit Log</h3>
                  <div className={dp.tableWrap}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={dp.tableHead}>
                          <th className="px-4 py-3">When</th>
                          <th className="px-4 py-3">By</th>
                          <th className="px-4 py-3">Bank Record</th>
                          <th className="px-4 py-3">Matched Item</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recoHistory.map((row) => (
                          <tr key={row.id} className="border-b border-slate-100">
                            <td className="px-4 py-3">{row.applied_at}</td>
                            <td className="px-4 py-3">{row.applied_by_name || 'System'}</td>
                            <td className="px-4 py-3">#{row.bank_record_id} {row.bank_record_title || ''} (৳ {row.bank_record_amount || 0})</td>
                            <td className="px-4 py-3">
                              #{row.matched_record_id} {row.matched_record_title || ''} ({row.matched_record_type || 'n/a'}) (৳ {row.matched_record_amount || 0})
                            </td>
                            <td className="px-4 py-3 capitalize">{row.status}</td>
                            <td className="px-4 py-3">
                              {row.status === 'reconciled' ? (
                                <button
                                  type="button"
                                  className={`${dp.btnSecondary} text-xs`}
                                  onClick={async () => {
                                    if (!window.confirm('Undo this reconciliation match?')) return;
                                    try {
                                      await undoReconciliationMatch(row.id);
                                      setMessage(`Reconciliation #${row.id} undone.`);
                                      await load();
                                    } catch (err) {
                                      setMessage(err instanceof Error ? err.message : 'Undo failed');
                                    }
                                  }}
                                >
                                  Undo
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!recoHistory.length ? <div className="p-4 text-sm text-slate-500">No reconciliation history yet.</div> : null}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className={`mt-8 ${dp.pager}`}>
          <div className="text-sm font-medium text-slate-600">
            Total records: <span className="tabular-nums text-slate-900">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`${dp.btnSecondary} py-2 text-sm disabled:opacity-40`}
            >
              Prev
            </button>
            <span className="min-w-[5rem] text-center text-sm font-semibold text-slate-800 tabular-nums">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className={`${dp.btnSecondary} py-2 text-sm disabled:opacity-40`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
