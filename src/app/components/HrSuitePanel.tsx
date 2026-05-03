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
  fetchHrDesignations,
  fetchHrSalaryAdvances,
  fetchHrAnnouncements,
  fetchHrRecruitmentOpenings,
  fetchHrInterviewSchedules,
  fetchHrLifecycleEvents,
  fetchHrPerformanceReviews,
  fetchHrTrainingRecords,
  fetchHrBenefits,
  generateHrPayslips,
  downloadHrPayslipPdf,
  createHrDesignation,
  deleteHrDesignation,
  createHrSalaryAdvance,
  updateHrSalaryAdvance,
  createHrAnnouncement,
  deleteHrAnnouncement,
  createHrRecruitmentOpening,
  deleteHrRecruitmentOpening,
  createHrInterviewSchedule,
  deleteHrInterviewSchedule,
  createHrLifecycleEvent,
  deleteHrLifecycleEvent,
  createHrPerformanceReview,
  deleteHrPerformanceReview,
  createHrTrainingRecord,
  deleteHrTrainingRecord,
  createHrBenefit,
  deleteHrBenefit,
  updateHrEmployee,
  updateHrLeaveStatus,
  updateHrPayrollRun,
  type HrAttendanceDto,
  type HrDepartmentDto,
  type HrEmployeeDto,
  type HrLeaveDto,
  type HrPayrollRunDto,
  type HrPayslipDto,
  type HrDesignationDto,
  type HrSalaryAdvanceDto,
  type HrAnnouncementDto,
  type HrRecruitmentOpeningDto,
  type HrInterviewScheduleDto,
  type HrLifecycleEventDto,
  type HrPerformanceReviewDto,
  type HrTrainingRecordDto,
  type HrBenefitDto,
} from '@/lib/hr';

export type HrSuiteVariant = 'admin' | 'dealer';

type Tab = 'departments' | 'employees' | 'attendance' | 'leave' | 'payroll' | 'operations';
type OpSubTab = 'designations' | 'advances' | 'announcements' | 'recruitment' | 'lifecycle' | 'performance' | 'training' | 'benefits';

function skLine(w: string, h = 'h-3.5') {
  return `animate-pulse rounded-md bg-slate-200/85 ${h} ${w}`;
}

function parsePositiveNumber(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseId(value: string): number | null {
  const n = Number(value.trim());
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
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
  const [opSubTab, setOpSubTab] = useState<OpSubTab>('designations');
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
  const [designations, setDesignations] = useState<HrDesignationDto[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<HrSalaryAdvanceDto[]>([]);
  const [announcements, setAnnouncements] = useState<HrAnnouncementDto[]>([]);
  const [designationName, setDesignationName] = useState('');
  const [advanceEmployeeId, setAdvanceEmployeeId] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [openings, setOpenings] = useState<HrRecruitmentOpeningDto[]>([]);
  const [interviews, setInterviews] = useState<HrInterviewScheduleDto[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<HrLifecycleEventDto[]>([]);
  const [reviews, setReviews] = useState<HrPerformanceReviewDto[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<HrTrainingRecordDto[]>([]);
  const [benefits, setBenefits] = useState<HrBenefitDto[]>([]);
  const [openingTitle, setOpeningTitle] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateAt, setCandidateAt] = useState('');
  const [lifecycleEmpId, setLifecycleEmpId] = useState('');
  const [lifecycleType, setLifecycleType] = useState<'onboarding' | 'offboarding'>('onboarding');
  const [reviewEmpId, setReviewEmpId] = useState('');
  const [reviewRating, setReviewRating] = useState('');
  const [trainingEmpId, setTrainingEmpId] = useState('');
  const [trainingTitle, setTrainingTitle] = useState('');
  const [benefitEmpId, setBenefitEmpId] = useState('');
  const [benefitType, setBenefitType] = useState('');
  const [benefitAmount, setBenefitAmount] = useState('');

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
      } else if (tab === 'payroll') {
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
      } else {
        const [d, s, a, o, i, l, r, t, b] = await Promise.all([
          fetchHrDesignations({ page, per_page: 30 }),
          fetchHrSalaryAdvances({ page, per_page: 25 }),
          fetchHrAnnouncements({ page, per_page: 20 }),
          fetchHrRecruitmentOpenings({ page, per_page: 20 }),
          fetchHrInterviewSchedules({ page, per_page: 20 }),
          fetchHrLifecycleEvents({ page, per_page: 20 }),
          fetchHrPerformanceReviews({ page, per_page: 20 }),
          fetchHrTrainingRecords({ page, per_page: 20 }),
          fetchHrBenefits({ page, per_page: 20 }),
        ]);
        setDesignations(d.rows);
        setSalaryAdvances(s.rows);
        setAnnouncements(a.rows);
        setOpenings(o.rows);
        setInterviews(i.rows);
        setLifecycleEvents(l.rows);
        setReviews(r.rows);
        setTrainingRecords(t.rows);
        setBenefits(b.rows);
        setLastPage(Math.max(d.lastPage, s.lastPage, a.lastPage, o.lastPage, i.lastPage, l.lastPage, r.lastPage, t.lastPage, b.lastPage));
        setTotal(d.total + s.total + a.total + o.total + i.total + l.total + r.total + t.total + b.total);
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
    const uid = parseId(empUserId);
    if (!uid) {
      setMessage('Enter valid user id');
      return;
    }
    const salary = empSalary.trim() ? parsePositiveNumber(empSalary) : null;
    if (empSalary.trim() && !salary) {
      setMessage('Base salary must be a positive number');
      return;
    }
    try {
      await createHrEmployee({
        user_id: uid,
        department_id: empDeptId ? Number(empDeptId) : undefined,
        designation: empDesignation.trim() || undefined,
        base_salary: salary ?? undefined,
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
    const eid = parseId(attEmpId);
    if (!eid) {
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
    if (!/^\d{4}-\d{2}$/.test(runPeriod.trim())) {
      setMessage('Period must be in YYYY-MM format');
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

  const onAddDesignation = async () => {
    if (!designationName.trim()) return;
    try {
      await createHrDesignation(designationName.trim());
      setDesignationName('');
      setMessage('Designation added');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddSalaryAdvance = async () => {
    const employeeId = parseId(advanceEmployeeId);
    const amount = parsePositiveNumber(advanceAmount);
    if (!employeeId || !amount) {
      setMessage('Enter valid employee and amount');
      return;
    }
    try {
      await createHrSalaryAdvance({ employee_id: employeeId, amount, notes: advanceNotes.trim() || undefined });
      setAdvanceEmployeeId('');
      setAdvanceAmount('');
      setAdvanceNotes('');
      setMessage('Salary advance requested');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAdvanceStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateHrSalaryAdvance(id, status);
      setMessage(`Advance ${status}`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) {
      setMessage('Announcement title and body required');
      return;
    }
    try {
      await createHrAnnouncement({ title: announcementTitle.trim(), body: announcementBody.trim() });
      setAnnouncementTitle('');
      setAnnouncementBody('');
      setMessage('Announcement posted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteDesignation = async (id: number) => {
    try {
      await deleteHrDesignation(id);
      setMessage('Designation deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteAnnouncement = async (id: number) => {
    try {
      await deleteHrAnnouncement(id);
      setMessage('Announcement deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddOpening = async () => {
    if (!openingTitle.trim()) return;
    try {
      await createHrRecruitmentOpening({ title: openingTitle.trim() });
      setOpeningTitle('');
      setMessage('Recruitment opening created');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddInterview = async () => {
    if (!candidateName.trim() || !candidateAt.trim()) {
      setMessage('Candidate and schedule required');
      return;
    }
    if (Number.isNaN(Date.parse(candidateAt))) {
      setMessage('Enter valid interview date/time');
      return;
    }
    try {
      await createHrInterviewSchedule({ candidate_name: candidateName.trim(), scheduled_at: candidateAt });
      setCandidateName('');
      setCandidateAt('');
      setMessage('Interview scheduled');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddLifecycle = async () => {
    const employeeId = parseId(lifecycleEmpId);
    if (!employeeId) {
      setMessage('Employee ID required');
      return;
    }
    try {
      await createHrLifecycleEvent({ employee_id: employeeId, event_type: lifecycleType, event_date: new Date().toISOString().slice(0, 10) });
      setLifecycleEmpId('');
      setMessage('Lifecycle event added');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddReview = async () => {
    const employeeId = parseId(reviewEmpId);
    if (!employeeId) {
      setMessage('Employee ID required');
      return;
    }
    const rating = reviewRating.trim() ? Number(reviewRating.trim()) : null;
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      setMessage('Rating must be between 0 and 5');
      return;
    }
    try {
      await createHrPerformanceReview({
        employee_id: employeeId,
        review_date: new Date().toISOString().slice(0, 10),
        rating: rating ?? undefined,
      });
      setReviewEmpId('');
      setReviewRating('');
      setMessage('Performance review added');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddTraining = async () => {
    const employeeId = parseId(trainingEmpId);
    if (!employeeId || !trainingTitle.trim()) {
      setMessage('Employee and training title required');
      return;
    }
    try {
      await createHrTrainingRecord({
        employee_id: employeeId,
        title: trainingTitle.trim(),
        completed_on: new Date().toISOString().slice(0, 10),
      });
      setTrainingEmpId('');
      setTrainingTitle('');
      setMessage('Training record added');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onAddBenefit = async () => {
    const employeeId = parseId(benefitEmpId);
    if (!employeeId || !benefitType.trim()) {
      setMessage('Employee and benefit type required');
      return;
    }
    const amount = benefitAmount.trim() ? parsePositiveNumber(benefitAmount) : null;
    if (benefitAmount.trim() && !amount) {
      setMessage('Benefit amount must be a positive number');
      return;
    }
    try {
      await createHrBenefit({
        employee_id: employeeId,
        benefit_type: benefitType.trim(),
        amount: amount ?? undefined,
        effective_from: new Date().toISOString().slice(0, 10),
      });
      setBenefitEmpId('');
      setBenefitType('');
      setBenefitAmount('');
      setMessage('Benefit assigned');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteRecruitmentOpening = async (id: number) => {
    try {
      await deleteHrRecruitmentOpening(id);
      setMessage('Opening deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteInterview = async (id: number) => {
    try {
      await deleteHrInterviewSchedule(id);
      setMessage('Interview deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteLifecycle = async (id: number) => {
    try {
      await deleteHrLifecycleEvent(id);
      setMessage('Lifecycle event deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteReview = async (id: number) => {
    try {
      await deleteHrPerformanceReview(id);
      setMessage('Review deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteTraining = async (id: number) => {
    try {
      await deleteHrTrainingRecord(id);
      setMessage('Training record deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onDeleteBenefit = async (id: number) => {
    try {
      await deleteHrBenefit(id);
      setMessage('Benefit deleted');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  };

  const isAdmin = variant === 'admin';
  /** Admin embeds inside AdminLayout (gray-50 + sidebar); avoid dealer full-viewport gradient. */
  const shellClass = isAdmin ? 'min-h-full bg-gray-50' : '';

  if (canHr === false) {
    return (
      <div className={shellClass || 'rounded-2xl'}>
        <div className={`max-w-4xl mx-auto px-4 ${isAdmin ? 'py-10' : 'py-6'}`}>
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
            : 'max-w-6xl mx-auto px-4 sm:px-0 pb-8'
        }
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {isAdmin ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Human resources</h1>
                <p className="mt-1 text-sm text-gray-600 max-w-2xl leading-relaxed">
                  Departments, employees, attendance, leave, payroll, and HR operations.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-[#233D7B]/80 mb-1">People operations</p>
                <h2 className={dp.heroTitle}>HR suite</h2>
                <p className={dp.heroSubtitle}>
                  Org structure, roster, time, leave, and payroll — scoped to your dealership.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={portalHref} className={isAdmin ? 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50' : dp.btnSecondary}>
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
              ['departments', 'Departments'],
              ['employees', 'Employees'],
              ['attendance', 'Attendance'],
              ['leave', 'Leave'],
              ['payroll', 'Payroll'],
              ['operations', 'Operations'],
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
              isAdmin
                ? 'mb-4 rounded border border-[#233D7B]/15 bg-slate-50 px-4 py-2 text-sm text-slate-900'
                : `mb-6 ${dp.alert}`
            }
          >
            {message}
          </div>
        ) : null}

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
                    <input type="number" min={1} value={empUserId} onChange={(e) => setEmpUserId(e.target.value)} className={dp.input} required />
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
                    <input type="number" min={1} step="0.01" value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} className={dp.input} />
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
                    <input type="number" min={1} value={attEmpId} onChange={(e) => setAttEmpId(e.target.value)} className={`${dp.input} max-w-[12rem]`} />
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
                    <input pattern="\d{4}-\d{2}" placeholder="YYYY-MM" value={runPeriod} onChange={(e) => setRunPeriod(e.target.value)} className={dp.input} />
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
                            <th className={`${dp.tableCellDense} text-right`}>Payslip</th>
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
                              <td className={`${dp.tableCellDense} text-right`}>
                                <button
                                  type="button"
                                  className={dp.btnSecondary}
                                  onClick={() =>
                                    selectedRunId
                                      ? downloadHrPayslipPdf(selectedRunId, p.id, p.employee_id).catch((err) =>
                                          setMessage(err instanceof Error ? err.message : 'Download failed'),
                                        )
                                      : undefined
                                  }
                                >
                                  PDF
                                </button>
                              </td>
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

            {tab === 'operations' && (
              <div className="space-y-6">
                <div className={`${dp.cardMuted} p-1.5 flex flex-wrap gap-1`}>
                  {(
                    [
                      ['designations', 'Designations'],
                      ['advances', 'Advances'],
                      ['announcements', 'Announcements'],
                      ['recruitment', 'Recruitment'],
                      ['lifecycle', 'Lifecycle'],
                      ['performance', 'Performance'],
                      ['training', 'Training'],
                      ['benefits', 'Benefits'],
                    ] as const
                  ).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setOpSubTab(key)} className={dp.tab(opSubTab === key)}>
                      {label}
                    </button>
                  ))}
                </div>

                {opSubTab === 'designations' && (
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Designation management</h3>
                  <div className="flex flex-wrap gap-2 items-end mb-3">
                    <input
                      placeholder="Designation name"
                      value={designationName}
                      onChange={(e) => setDesignationName(e.target.value)}
                      className={`${dp.input} max-w-xs`}
                    />
                    <button type="button" onClick={() => onAddDesignation()} className={dp.btnPrimary}>
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {designations.map((d) => (
                      <span key={d.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs">
                        {d.name}
                        <button type="button" className="text-red-600" onClick={() => onDeleteDesignation(d.id)}>
                          x
                        </button>
                      </span>
                    ))}
                    {!designations.length && <span className="text-xs text-slate-500">No designations yet.</span>}
                  </div>
                </div>
                )}

                {opSubTab === 'advances' && (
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Salary advance</h3>
                  <div className="grid md:grid-cols-4 gap-2 items-end">
                      <input
                        type="number"
                        min={1}
                      placeholder="Employee ID"
                      value={advanceEmployeeId}
                      onChange={(e) => setAdvanceEmployeeId(e.target.value)}
                      className={dp.input}
                    />
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                      placeholder="Amount"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      className={dp.input}
                    />
                    <input
                      placeholder="Notes (optional)"
                      value={advanceNotes}
                      onChange={(e) => setAdvanceNotes(e.target.value)}
                      className={dp.input}
                    />
                    <button type="button" onClick={() => onAddSalaryAdvance()} className={dp.btnAccent}>
                      Request
                    </button>
                  </div>
                  <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
                    {salaryAdvances.map((s) => (
                      <div key={s.id} className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between">
                        <div className="text-xs text-slate-700">
                          {s.employee_name || `Emp ${s.employee_id}`} - {s.amount} - <strong>{s.status}</strong>
                        </div>
                        {s.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button type="button" className={dp.btnPrimary} onClick={() => onAdvanceStatus(s.id, 'approved')}>
                              Approve
                            </button>
                            <button type="button" className={dp.btnDanger} onClick={() => onAdvanceStatus(s.id, 'rejected')}>
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {!salaryAdvances.length && <div className="p-4 text-xs text-slate-500">No salary advances yet.</div>}
                  </div>
                </div>
                )}

                {opSubTab === 'announcements' && (
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">HR announcements</h3>
                  <div className="grid gap-2 mb-3">
                    <input
                      placeholder="Title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className={dp.input}
                    />
                    <textarea
                      placeholder="Announcement body"
                      value={announcementBody}
                      onChange={(e) => setAnnouncementBody(e.target.value)}
                      className={`${dp.input} min-h-24`}
                    />
                    <button type="button" onClick={() => onAddAnnouncement()} className={dp.btnPrimary}>
                      Publish announcement
                    </button>
                  </div>
                  <div className="space-y-2">
                    {announcements.map((a) => (
                      <div key={a.id} className="rounded-xl border border-slate-100 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-sm text-slate-900">{a.title}</div>
                          <button type="button" className="text-xs text-red-600" onClick={() => onDeleteAnnouncement(a.id)}>
                            Delete
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{a.body}</p>
                      </div>
                    ))}
                    {!announcements.length && <div className="text-xs text-slate-500">No announcements yet.</div>}
                  </div>
                </div>
                )}

                {opSubTab === 'recruitment' && (
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Recruitment + interviews</h3>
                  <div className="grid md:grid-cols-2 gap-2 mb-3">
                    <div className="flex gap-2">
                      <input placeholder="Opening title" value={openingTitle} onChange={(e) => setOpeningTitle(e.target.value)} className={dp.input} required />
                      <button type="button" onClick={() => onAddOpening()} className={dp.btnPrimary}>
                        Add opening
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input placeholder="Candidate name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className={dp.input} required />
                      <input type="datetime-local" value={candidateAt} onChange={(e) => setCandidateAt(e.target.value)} className={dp.input} />
                      <button type="button" onClick={() => onAddInterview()} className={dp.btnAccent}>
                        Schedule
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-100 p-3">
                      <div className="text-xs font-semibold mb-2 text-slate-700">Openings</div>
                      <div className="space-y-1">
                        {openings.map((o) => (
                          <div key={o.id} className="text-xs text-slate-700 flex items-center justify-between gap-2">
                            <span>{o.title} - {o.status}</span>
                            <button type="button" className="text-red-600" onClick={() => onDeleteRecruitmentOpening(o.id)}>Delete</button>
                          </div>
                        ))}
                        {!openings.length && <div className="text-xs text-slate-500">No openings yet.</div>}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-3">
                      <div className="text-xs font-semibold mb-2 text-slate-700">Interviews</div>
                      <div className="space-y-1">
                        {interviews.map((i) => (
                          <div key={i.id} className="text-xs text-slate-700 flex items-center justify-between gap-2">
                            <span>{i.candidate_name} - {i.status}</span>
                            <button type="button" className="text-red-600" onClick={() => onDeleteInterview(i.id)}>Delete</button>
                          </div>
                        ))}
                        {!interviews.length && <div className="text-xs text-slate-500">No interviews yet.</div>}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {opSubTab === 'lifecycle' && (
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Onboarding / offboarding</h3>
                  <div className="flex flex-wrap gap-2 items-end mb-3">
                    <input type="number" min={1} placeholder="Employee ID" value={lifecycleEmpId} onChange={(e) => setLifecycleEmpId(e.target.value)} className={`${dp.input} max-w-[10rem]`} required />
                    <select value={lifecycleType} onChange={(e) => setLifecycleType(e.target.value as 'onboarding' | 'offboarding')} className={dp.select}>
                      <option value="onboarding">Onboarding</option>
                      <option value="offboarding">Offboarding</option>
                    </select>
                    <button type="button" onClick={() => onAddLifecycle()} className={dp.btnPrimary}>
                      Add event
                    </button>
                  </div>
                  <div className="space-y-1">
                    {lifecycleEvents.map((e) => (
                      <div key={e.id} className="text-xs text-slate-700 flex items-center justify-between gap-2">
                        <span>{e.employee_name || `Emp ${e.employee_id}`} - {e.event_type} - {e.event_date}</span>
                        <button type="button" className="text-red-600" onClick={() => onDeleteLifecycle(e.id)}>Delete</button>
                      </div>
                    ))}
                    {!lifecycleEvents.length && <div className="text-xs text-slate-500">No lifecycle events yet.</div>}
                  </div>
                </div>
                )}

                {(opSubTab === 'performance' || opSubTab === 'training' || opSubTab === 'benefits') && (
                <div className={`${dp.card} ${dp.cardPad}`}>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Performance + training + benefits</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {opSubTab === 'performance' && <div className="rounded-xl border border-slate-100 p-3 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">Performance review</div>
                      <input type="number" min={1} placeholder="Employee ID" value={reviewEmpId} onChange={(e) => setReviewEmpId(e.target.value)} className={dp.input} required />
                      <input type="number" min={0} max={5} step="0.1" placeholder="Rating (0-5)" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} className={dp.input} />
                      <button type="button" onClick={() => onAddReview()} className={dp.btnPrimary}>
                        Add review
                      </button>
                      {reviews.slice(0, 4).map((r) => (
                        <div key={r.id} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <span>{r.employee_name || `Emp ${r.employee_id}`} - {r.rating || 'n/a'}</span>
                          <button type="button" className="text-red-600" onClick={() => onDeleteReview(r.id)}>Delete</button>
                        </div>
                      ))}
                    </div>}
                    {opSubTab === 'training' && <div className="rounded-xl border border-slate-100 p-3 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">Training records</div>
                      <input type="number" min={1} placeholder="Employee ID" value={trainingEmpId} onChange={(e) => setTrainingEmpId(e.target.value)} className={dp.input} required />
                      <input placeholder="Training title" value={trainingTitle} onChange={(e) => setTrainingTitle(e.target.value)} className={dp.input} required />
                      <button type="button" onClick={() => onAddTraining()} className={dp.btnAccent}>
                        Add training
                      </button>
                      {trainingRecords.slice(0, 4).map((r) => (
                        <div key={r.id} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <span>{r.employee_name || `Emp ${r.employee_id}`} - {r.title}</span>
                          <button type="button" className="text-red-600" onClick={() => onDeleteTraining(r.id)}>Delete</button>
                        </div>
                      ))}
                    </div>}
                    {opSubTab === 'benefits' && <div className="rounded-xl border border-slate-100 p-3 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">Benefits</div>
                      <input type="number" min={1} placeholder="Employee ID" value={benefitEmpId} onChange={(e) => setBenefitEmpId(e.target.value)} className={dp.input} required />
                      <input placeholder="Benefit type" value={benefitType} onChange={(e) => setBenefitType(e.target.value)} className={dp.input} required />
                      <input type="number" min={1} step="0.01" placeholder="Amount" value={benefitAmount} onChange={(e) => setBenefitAmount(e.target.value)} className={dp.input} />
                      <button type="button" onClick={() => onAddBenefit()} className={dp.btnPrimary}>
                        Assign benefit
                      </button>
                      {benefits.slice(0, 4).map((b) => (
                        <div key={b.id} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <span>{b.employee_name || `Emp ${b.employee_id}`} - {b.benefit_type}</span>
                          <button type="button" className="text-red-600" onClick={() => onDeleteBenefit(b.id)}>Delete</button>
                        </div>
                      ))}
                    </div>}
                  </div>
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
