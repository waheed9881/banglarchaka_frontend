import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchMe } from '@/lib/auth';
import { dp } from '@/app/components/dealerPortalTheme';
import {
  createChartAccount,
  createExpense,
  createJournalEntry,
  deleteChartAccount,
  deleteExpense,
  deleteJournalEntry,
  fetchChartAccounts,
  fetchExpenses,
  fetchJournalEntries,
  fetchJournalEntry,
  type ChartAccountDto,
  type ExpenseDto,
  type JournalEntryDto,
  type JournalLineDto,
} from '@/lib/finance';

export type FinanceSuiteVariant = 'admin' | 'dealer';

type Tab = 'chart' | 'journal' | 'expenses';

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const;

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

  const [tab, setTab] = useState<Tab>('chart');
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

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'chart') {
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
      } else {
        const data = await fetchExpenses({ page, per_page: 25 });
        setExpenses(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
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
  }, [tab, page]);

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

  const shellClass = variant === 'admin' ? `min-h-screen ${dp.shell}` : '';

  if (canAccess === false) {
    return (
      <div className={shellClass || 'rounded-2xl'}>
        <div className={`max-w-4xl mx-auto px-4 ${variant === 'admin' ? 'py-10' : 'py-6'}`}>
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

  return (
    <div className={shellClass}>
      <div className={`max-w-6xl mx-auto px-4 sm:px-0 ${variant === 'admin' ? 'py-8' : 'pb-8'}`}>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#233D7B]/80">Ledger & cashflow</p>
            <h2 className={dp.heroTitle}>Finance suite</h2>
            <p className={dp.heroSubtitle}>Chart of accounts, balanced journals, and operational expenses — tenant-safe for your showroom.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={portalHref} className={dp.btnSecondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {portalLabel}
            </Link>
            <button type="button" onClick={() => load().catch(() => undefined)} className={dp.btnPrimary}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh
            </button>
          </div>
        </div>

        <div className={`${dp.cardMuted} mb-6 flex flex-wrap gap-1 p-1.5`}>
          {(
            [
              ['chart', 'Chart of accounts'],
              ['journal', 'Journal'],
              ['expenses', 'Expenses'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={dp.tab(tab === key)}>
              {label}
            </button>
          ))}
        </div>

        {message ? <div className={`mb-6 ${dp.alert}`}>{message}</div> : null}

        {loading ? (
          <div className={`${dp.card} ${dp.cardPad} flex items-center gap-3 text-slate-600`}>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#233D7B] border-t-transparent" aria-hidden />
            Loading finance data…
          </div>
        ) : (
          <>
            {tab === 'chart' && (
              <div className="space-y-6">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-4 gap-4 items-end`}>
                  <input value={coCode} onChange={(e) => setCoCode(e.target.value)} placeholder="Account code" className={dp.input} />
                  <input value={coName} onChange={(e) => setCoName(e.target.value)} placeholder="Account name" className={`${dp.input} md:col-span-2`} />
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
                    className={`${dp.btnAccent} md:col-span-4 justify-self-start`}
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
                  <input value={exAmount} onChange={(e) => setExAmount(e.target.value)} placeholder="Amount" className={`${dp.input} tabular-nums`} />
                  <input value={exCat} onChange={(e) => setExCat(e.target.value)} placeholder="Category" className={dp.input} />
                  <input type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} className={dp.input} />
                  <button
                    type="button"
                    onClick={async () => {
                      const amt = Number(exAmount);
                      if (!exDate.trim() || !amt || amt <= 0) {
                        setMessage('Date and valid amount required');
                        return;
                      }
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
                    className={`${dp.btnPrimary} md:col-span-6 justify-self-start`}
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
