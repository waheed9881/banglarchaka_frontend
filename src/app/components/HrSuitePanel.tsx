import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchMe } from '@/lib/auth';
import { dp } from '@/app/components/dealerPortalTheme';
import {
  clockOutHrAttendance,
  createHrAttendance,
  createHrDepartment,
  createHrEmployee,
  createHrPayrollRun,
  deleteHrDepartment,
  fetchHrAttendance,
  fetchHrDepartments,
  fetchHrEmployees,
  fetchHrLeaves,
  fetchHrPayrollRuns,
  fetchHrPayslips,
  generateHrPayslips,
  updateHrEmployee,
  updateHrLeaveStatus,
  updateHrPayrollRun,
  type HrAttendanceDto,
  type HrDepartmentDto,
  type HrEmployeeDto,
  type HrLeaveDto,
  type HrPayrollRunDto,
  type HrPayslipDto,
} from '@/lib/hr';

export type HrSuiteVariant = 'admin' | 'dealer';

type Tab = 'departments' | 'employees' | 'attendance' | 'leave' | 'payroll';

function skLine(w: string, h = 'h-3.5') {
  return `animate-pulse rounded-md bg-slate-200/85 ${h} ${w}`;
}

function HrSuiteLoadingSkeleton({ tab }: { tab: Tab }) {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-busy="true"
      aria-label="Loading HR data"
    >
      <div className={`${dp.card} ${dp.cardPad}`}>
        <div className="flex flex-wrap gap-3 items-end">
          <div className={`flex-1 min-w-[12rem] max-w-md ${skLine('w-full', 'h-10')}`} />
          <div className={skLine('w-28', 'h-10')} />
          <div className={skLine('w-36', 'h-10')} />
        </div>
      </div>
      <div className={`${dp.card} overflow-hidden divide-y divide-slate-100`}>
        {Array.from({ length: tab === 'payroll' ? 5 : 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5">
            <div className={`shrink-0 rounded-full ${skLine('w-8', 'h-8')}`} />
            <div className="flex-1 min-w-0 space-y-2 pt-0.5">
              <div className={skLine('max-w-[220px] w-[42%]', 'h-3')} />
              <div className={skLine('max-w-[320px] w-[62%]', 'h-2.5')} />
            </div>
            <div className={`shrink-0 rounded-lg ${skLine('w-16', 'h-7')}`} />
          </div>
        ))}
      </div>
      {tab === 'payroll' ? (
        <div className={`${dp.tableWrap} overflow-hidden`}>
          <table className={`${dp.tableDense} w-full`}>
            <thead>
              <tr className={dp.tableHeadDense}>
                {['Employee', 'Gross', 'Deductions', 'Net'].map((label) => (
                  <th key={label} className={dp.tableCellDense}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, r) => (
                <tr key={r} className="border-b border-slate-100">
                  {Array.from({ length: 4 }).map((__, c) => (
                    <td key={c} className={dp.tableCellDense}>
                      <div className={skLine(c === 0 ? 'max-w-[140px]' : 'max-w-[72px]', 'h-3')} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function HrSuitePanel({ variant }: { variant: HrSuiteVariant }) {
  const allowedRoleSet = useMemo(
    () =>
      new Set(
        variant === 'dealer' ? ['dealer', 'super_admin', 'admin', 'hr_manager'] : ['super_admin', 'admin', 'hr_manager'],
      ),
    [variant],
  );
  const portalHref = variant === 'dealer' ? '/dealer/portal' : '/admin';
  const portalLabel = variant === 'dealer' ? 'Dealer dashboard' : 'Admin portal';

  const [tab, setTab] = useState<Tab>('departments');
  const [canHr, setCanHr] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [departments, setDepartments] = useState<HrDepartmentDto[]>([]);
  const [deptName, setDeptName] = useState('');

  const [employees, setEmployees] = useState<HrEmployeeDto[]>([]);
  const [empUserId, setEmpUserId] = useState('');
  const [empDeptId, setEmpDeptId] = useState('');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empSalary, setEmpSalary] = useState('');

  const [attRows, setAttRows] = useState<HrAttendanceDto[]>([]);
  const [attEmpId, setAttEmpId] = useState('');

  const [leaveRows, setLeaveRows] = useState<HrLeaveDto[]>([]);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('');

  const [runs, setRuns] = useState<HrPayrollRunDto[]>([]);
  const [runPeriod, setRunPeriod] = useState('');
  const [runPayDate, setRunPayDate] = useState('');
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [payslips, setPayslips] = useState<HrPayslipDto[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'departments') {
        const data = await fetchHrDepartments({ page, per_page: 30 });
        setDepartments(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'employees') {
        const [emps, depts] = await Promise.all([
          fetchHrEmployees({ page, per_page: 25 }),
          fetchHrDepartments({ page: 1, per_page: 100 }),
        ]);
        setEmployees(emps.rows);
        setLastPage(emps.lastPage);
        setTotal(emps.total);
        setDepartments(depts.rows);
      } else if (tab === 'attendance') {
        const data = await fetchHrAttendance({
          page,
          per_page: 30,
          employee_id: attEmpId.trim() ? Number(attEmpId.trim()) : undefined,
        });
        setAttRows(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'leave') {
        const data = await fetchHrLeaves({
          page,
          per_page: 25,
          status: leaveStatusFilter || undefined,
        });
        setLeaveRows(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else {
        const data = await fetchHrPayrollRuns({ page, per_page: 20 });
        setRuns(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
        if (selectedRunId) {
          const ps = await fetchHrPayslips(selectedRunId, { per_page: 100 });
          setPayslips(ps.rows);
        } else {
          setPayslips([]);
        }
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe()
      .then((me) => setCanHr(!!me?.roles?.some((r) => allowedRoleSet.has(r.name))))
      .catch(() => setCanHr(false));
  }, [allowedRoleSet]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [tab, page, leaveStatusFilter, selectedRunId]);

  useEffect(() => {
    setPage(1);
  }, [tab, leaveStatusFilter]);

  const onAddDept = async () => {
    if (!deptName.trim()) return;
    try {
      await createHrDepartment(deptName.trim());
      setDeptName('');
      setMessage('Department added');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteDept = async (id: number) => {
    if (!window.confirm('Delete department?')) return;
    try {
      await deleteHrDepartment(id);
      setMessage('Department deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddEmployee = async () => {
    const uid = Number(empUserId.trim());
    if (!uid || Number.isNaN(uid)) {
      setMessage('Enter valid user id');
      return;
    }
    try {
      await createHrEmployee({
        user_id: uid,
        department_id: empDeptId ? Number(empDeptId) : undefined,
        designation: empDesignation.trim() || undefined,
        base_salary: empSalary.trim() ? Number(empSalary) : undefined,
      });
      setEmpUserId('');
      setEmpDesignation('');
      setEmpSalary('');
      setMessage('Employee created');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onSaveEmployee = async (row: HrEmployeeDto) => {
    const salary = window.prompt('Base salary', row.base_salary ? String(row.base_salary) : '');
    if (salary === null) return;
    try {
      await updateHrEmployee(row.id, {
        department_id: row.department_id ?? undefined,
        designation: row.designation ?? undefined,
        base_salary: salary.trim() === '' ? undefined : Number(salary),
      });
      setMessage('Employee updated');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onClockIn = async () => {
    const eid = Number(attEmpId.trim());
    if (!eid || Number.isNaN(eid)) {
      setMessage('Enter employee id for clock-in');
      return;
    }
    try {
      await createHrAttendance({ employee_id: eid });
      setMessage('Clock-in recorded');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onClockOut = async (id: number) => {
    try {
      await clockOutHrAttendance(id);
      setMessage('Clock-out recorded');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onLeaveDecision = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateHrLeaveStatus(id, status);
      setMessage('Leave updated');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onCreateRun = async () => {
    if (!runPeriod.trim() || !runPayDate.trim()) {
      setMessage('Period and pay date required');
      return;
    }
    try {
      await createHrPayrollRun({ period: runPeriod.trim(), pay_date: runPayDate.trim() });
      setRunPeriod('');
      setRunPayDate('');
      setMessage('Payroll run created');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onGenerate = async (runId: number) => {
    try {
      await generateHrPayslips(runId);
      setSelectedRunId(runId);
      setMessage('Payslips generated');
      const [runData, slipData] = await Promise.all([
        fetchHrPayrollRuns({ page, per_page: 20 }),
        fetchHrPayslips(runId, { per_page: 100 }),
      ]);
      setRuns(runData.rows);
      setPayslips(slipData.rows);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onFinalizeRun = async (row: HrPayrollRunDto) => {
    try {
      await updateHrPayrollRun(row.id, { status: 'finalized' });
      setMessage('Payroll run finalized');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const shellClass = variant === 'admin' ? `min-h-screen ${dp.shell}` : '';

  if (canHr === false) {
    return (
      <div className={shellClass || 'rounded-2xl'}>
        <div className={`max-w-4xl mx-auto px-4 ${variant === 'admin' ? 'py-10' : 'py-6'}`}>
          <div className={`${dp.card} ${dp.cardPad} text-center`}>
            <h2 className={dp.heroTitle}>HR access required</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {variant === 'dealer'
                ? 'HR tools require a dealer or admin role.'
                : 'HR tools require super admin, admin, or HR manager role.'}
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

  return (
    <div className={shellClass}>
      <div className={`max-w-6xl mx-auto px-4 sm:px-0 ${variant === 'admin' ? 'py-8' : 'pb-8'}`}>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#233D7B]/80 mb-1">People operations</p>
            <h2 className={dp.heroTitle}>HR suite</h2>
            <p className={dp.heroSubtitle}>Org structure, roster, time, leave, and payroll — scoped to your dealership.</p>
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
              ['departments', 'Departments'],
              ['employees', 'Employees'],
              ['attendance', 'Attendance'],
              ['leave', 'Leave'],
              ['payroll', 'Payroll'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={dp.tab(tab === key)}>
              {label}
            </button>
          ))}
        </div>

        {message ? <div className={`mb-6 ${dp.alert}`}>{message}</div> : null}

        {loading ? (
          <HrSuiteLoadingSkeleton tab={tab} />
        ) : (
          <>
            {tab === 'departments' && (
              <div className="space-y-4">
                <div className={`${dp.card} ${dp.cardPad} flex flex-wrap gap-3 items-end`}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">New department name</label>
                    <input value={deptName} onChange={(e) => setDeptName(e.target.value)} className={`${dp.input} max-w-xs`} />
                  </div>
                  <button type="button" onClick={() => onAddDept()} className={dp.btnAccent}>
                    Add department
                  </button>
                </div>
                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {departments.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-slate-50/80 transition-colors">
                      <span className="text-sm font-medium text-slate-900">{d.name}</span>
                      <button type="button" onClick={() => onDeleteDept(d.id)} className={dp.btnDanger}>
                        Delete
                      </button>
                    </div>
                  ))}
                  {!departments.length && <div className="p-6 text-center text-xs text-slate-500">No departments yet.</div>}
                </div>
              </div>
            )}

            {tab === 'employees' && (
              <div className="space-y-4">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-5 gap-3 items-end`}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">User ID</label>
                    <input value={empUserId} onChange={(e) => setEmpUserId(e.target.value)} className={dp.input} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</label>
                    <select value={empDeptId} onChange={(e) => setEmpDeptId(e.target.value)} className={dp.select}>
                      <option value="">—</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Designation</label>
                    <input value={empDesignation} onChange={(e) => setEmpDesignation(e.target.value)} className={dp.input} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base salary</label>
                    <input value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} className={dp.input} />
                  </div>
                  <button type="button" onClick={() => onAddEmployee()} className={dp.btnPrimary}>
                    Create employee
                  </button>
                </div>
                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {employees.map((e) => (
                    <div key={e.id} className="flex flex-col gap-2 px-4 py-2.5 md:flex-row md:justify-between md:items-center hover:bg-slate-50/80">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{e.user?.name || `Employee #${e.id}`}</div>
                        <div className="text-xs text-slate-600 leading-snug mt-0.5">
                          {e.user?.email} • {e.department?.name || 'No dept'} • salary {e.base_salary ?? '—'}
                        </div>
                      </div>
                      <button type="button" onClick={() => onSaveEmployee(e)} className={`${dp.btnSecondary} self-start text-[11px] py-2 px-3`}>
                        Edit salary / sync
                      </button>
                    </div>
                  ))}
                  {!employees.length && <div className="p-6 text-center text-xs text-slate-500">No employees yet.</div>}
                </div>
              </div>
            )}

            {tab === 'attendance' && (
              <div className="space-y-4">
                <div className={`${dp.card} ${dp.cardPad} flex flex-wrap gap-3 items-end`}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filter / clock-in employee ID</label>
                    <input value={attEmpId} onChange={(e) => setAttEmpId(e.target.value)} className={`${dp.input} max-w-[12rem]`} />
                  </div>
                  <button type="button" onClick={() => load().catch(() => undefined)} className={dp.btnSecondary}>
                    Apply filter
                  </button>
                  <button type="button" onClick={() => onClockIn()} className={dp.btnAccent}>
                    Clock in now
                  </button>
                </div>
                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {attRows.map((a) => (
                    <div key={a.id} className="flex flex-col gap-2 px-4 py-2.5 md:flex-row md:justify-between md:items-center hover:bg-slate-50/80">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900">{a.employee?.user?.name || `Emp ${a.employee_id}`}</div>
                        <div className="text-xs text-slate-600 leading-snug mt-0.5 tabular-nums">
                          In: {a.clock_in || '—'} • Out: {a.clock_out || '—'}
                        </div>
                      </div>
                      {!a.clock_out && (
                        <button type="button" onClick={() => onClockOut(a.id)} className={`${dp.btnPrimary} text-xs py-2 self-start`}>
                          Clock out
                        </button>
                      )}
                    </div>
                  ))}
                  {!attRows.length && <div className="p-6 text-center text-xs text-slate-500">No attendance rows.</div>}
                </div>
              </div>
            )}

            {tab === 'leave' && (
              <div className="space-y-4">
                <div className={`${dp.card} ${dp.cardPad} flex flex-wrap gap-3 items-center`}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                  <select value={leaveStatusFilter} onChange={(e) => setLeaveStatusFilter(e.target.value)} className={`${dp.select} max-w-xs`}>
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>
                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {leaveRows.map((l) => (
                    <div key={l.id} className="flex flex-col gap-2 px-4 py-2.5 md:flex-row md:justify-between md:items-center hover:bg-slate-50/80">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900">{l.employee?.user?.name || `Emp ${l.employee_id}`}</div>
                        <div className="text-xs text-slate-600 leading-snug mt-0.5">
                          {l.start_date} → {l.end_date} • {l.leave_type} •{' '}
                          <span className="font-semibold text-slate-800">{l.status}</span>
                        </div>
                      </div>
                      {l.status === 'pending' && (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => onLeaveDecision(l.id, 'approved')} className="px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold">
                            Approve
                          </button>
                          <button type="button" onClick={() => onLeaveDecision(l.id, 'rejected')} className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {!leaveRows.length && <div className="p-6 text-center text-xs text-slate-500">No leave requests.</div>}
                </div>
              </div>
            )}

            {tab === 'payroll' && (
              <div className="space-y-4">
                <div className={`${dp.card} ${dp.cardPad} grid md:grid-cols-4 gap-3 items-end`}>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Period (e.g. 2026-05)</label>
                    <input value={runPeriod} onChange={(e) => setRunPeriod(e.target.value)} className={dp.input} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pay date</label>
                    <input type="date" value={runPayDate} onChange={(e) => setRunPayDate(e.target.value)} className={dp.input} />
                  </div>
                  <button type="button" onClick={() => onCreateRun()} className={`${dp.btnPrimary} md:col-span-2`}>
                    Create draft run
                  </button>
                </div>
                <div className={`${dp.card} divide-y divide-slate-100 overflow-hidden`}>
                  {runs.map((r) => (
                    <div key={r.id} className="flex flex-col gap-3 px-4 py-2.5 md:flex-row md:justify-between md:items-start hover:bg-slate-50/80">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 tabular-nums">
                          {r.period} • pay {r.pay_date} • {r.status}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedRunId(r.id === selectedRunId ? null : r.id)}
                          className="text-xs text-[#233D7B] mt-0.5 hover:underline font-semibold"
                        >
                          {selectedRunId === r.id ? 'Hide payslips' : 'View payslips'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={r.status !== 'draft'}
                          onClick={() => onGenerate(r.id)}
                          className={`${dp.btnSecondary} text-xs py-2 disabled:opacity-40`}
                        >
                          Generate payslips
                        </button>
                        <button
                          type="button"
                          disabled={r.status !== 'draft'}
                          onClick={() => onFinalizeRun(r)}
                          className="rounded-xl px-3 py-2 text-xs font-semibold bg-amber-500 text-white shadow-sm hover:bg-amber-600 disabled:opacity-40"
                        >
                          Finalize
                        </button>
                      </div>
                    </div>
                  ))}
                  {!runs.length && <div className="p-6 text-center text-xs text-slate-500">No payroll runs.</div>}
                </div>
                {selectedRunId !== null && (
                  <div className={`${dp.tableWrap}`}>
                    {payslips.length > 0 ? (
                      <table className={`${dp.tableDense} w-full`}>
                        <thead>
                          <tr className={dp.tableHeadDense}>
                            <th className={`${dp.tableCellDense} text-left`}>Employee</th>
                            <th className={`${dp.tableCellDenseMono} text-right`}>Gross</th>
                            <th className={`${dp.tableCellDenseMono} text-right`}>Deductions</th>
                            <th className={`${dp.tableCellDenseMono} text-right`}>Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payslips.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/70">
                              <td className={`${dp.tableCellDense} max-w-[14rem] truncate`}>
                                {p.employee?.user?.name || p.employee_id}
                              </td>
                              <td className={`${dp.tableCellDenseMono} text-right`}>{p.gross}</td>
                              <td className={`${dp.tableCellDenseMono} text-right`}>{p.deductions}</td>
                              <td className={`${dp.tableCellDenseMono} text-right font-medium text-slate-900`}>{p.net}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">No payslips for this run yet — use Generate payslips on a draft run.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className={`mt-8 ${dp.pager} ${loading ? 'opacity-55 pointer-events-none' : ''}`}>
          <div className="text-xs font-medium text-slate-600">
            Total records: <span className="tabular-nums text-slate-900 text-sm">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`${dp.btnSecondary} py-2 text-xs disabled:opacity-40`}
            >
              Prev
            </button>
            <span className="min-w-[4.5rem] text-center text-xs font-semibold text-slate-800 tabular-nums">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className={`${dp.btnSecondary} py-2 text-xs disabled:opacity-40`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
