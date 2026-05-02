import { apiDownload, apiFetch } from './api';

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

export type HrDepartmentDto = {
  id: number;
  name: string;
};

export type HrEmployeeDto = {
  id: number;
  user_id: number;
  department_id?: number | null;
  designation?: string | null;
  hired_at?: string | null;
  base_salary?: string | null;
  user?: { id: number; name: string; email: string };
  department?: { id: number; name: string };
};

export type HrAttendanceDto = {
  id: number;
  employee_id: number;
  clock_in?: string | null;
  clock_out?: string | null;
  employee?: { user?: { id: number; name: string; email: string } };
};

export type HrLeaveDto = {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
  employee?: { user?: { id: number; name: string; email: string } };
  approved_by_user_id?: number | null;
};

export type HrPayrollRunDto = {
  id: number;
  period: string;
  pay_date: string;
  status: string;
};

export type HrPayslipDto = {
  id: number;
  payroll_run_id: number;
  employee_id: number;
  gross: string;
  deductions: string;
  net: string;
  employee?: { user?: { id: number; name: string; email: string } };
};

export type HrDesignationDto = {
  id: number;
  name: string;
  description?: string | null;
};

export type HrSalaryAdvanceDto = {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  amount: string;
  requested_on?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
};

export type HrAnnouncementDto = {
  id: number;
  title: string;
  body: string;
  published_at?: string | null;
};

export type HrRecruitmentOpeningDto = {
  id: number;
  title: string;
  status: 'open' | 'paused' | 'closed';
  deadline?: string | null;
};

export type HrInterviewScheduleDto = {
  id: number;
  candidate_name: string;
  candidate_email?: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};

export type HrLifecycleEventDto = {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  event_type: 'onboarding' | 'offboarding';
  event_date: string;
  notes?: string | null;
};

export type HrPerformanceReviewDto = {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  review_date: string;
  rating?: string | null;
  summary?: string | null;
};

export type HrTrainingRecordDto = {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  title: string;
  provider?: string | null;
  completed_on?: string | null;
};

export type HrBenefitDto = {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  benefit_type: string;
  amount?: string | null;
  effective_from?: string | null;
};

export async function fetchHrDepartments(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrDepartmentDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrDepartmentDto>>(`/admin/hr/departments${suffix}`);
  return parsePaginated(payload);
}

export async function createHrDepartment(name: string): Promise<void> {
  await apiFetch('/admin/hr/departments', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function deleteHrDepartment(id: number): Promise<void> {
  await apiFetch(`/admin/hr/departments/${id}`, { method: 'DELETE' });
}

export async function fetchHrEmployees(params: { page?: number; per_page?: number; department_id?: number } = {}): Promise<PaginatedResult<HrEmployeeDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  if (params.department_id) q.set('department_id', String(params.department_id));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrEmployeeDto>>(`/admin/hr/employees${suffix}`);
  return parsePaginated(payload);
}

export async function createHrEmployee(body: {
  user_id: number;
  department_id?: number | null;
  designation?: string;
  hired_at?: string;
  base_salary?: number;
}): Promise<void> {
  await apiFetch('/admin/hr/employees', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateHrEmployee(
  id: number,
  body: Partial<{ department_id: number | null; designation: string; hired_at: string; base_salary: number }>,
): Promise<void> {
  await apiFetch(`/admin/hr/employees/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function fetchHrAttendance(params: { page?: number; per_page?: number; employee_id?: number } = {}): Promise<PaginatedResult<HrAttendanceDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  if (params.employee_id) q.set('employee_id', String(params.employee_id));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrAttendanceDto>>(`/admin/hr/attendance${suffix}`);
  return parsePaginated(payload);
}

export async function createHrAttendance(body: { employee_id: number }): Promise<void> {
  await apiFetch('/admin/hr/attendance', { method: 'POST', body: JSON.stringify(body) });
}

export async function clockOutHrAttendance(id: number): Promise<void> {
  await apiFetch(`/admin/hr/attendance/${id}`, { method: 'PATCH', body: JSON.stringify({}) });
}

export async function fetchHrLeaves(params: { page?: number; per_page?: number; status?: string } = {}): Promise<PaginatedResult<HrLeaveDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  if (params.status) q.set('status', params.status);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrLeaveDto>>(`/admin/hr/leave-requests${suffix}`);
  return parsePaginated(payload);
}

export async function updateHrLeaveStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
  await apiFetch(`/admin/hr/leave-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function fetchHrPayrollRuns(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrPayrollRunDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrPayrollRunDto>>(`/admin/hr/payroll-runs${suffix}`);
  return parsePaginated(payload);
}

export async function createHrPayrollRun(body: { period: string; pay_date: string }): Promise<void> {
  await apiFetch('/admin/hr/payroll-runs', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateHrPayrollRun(id: number, body: Partial<{ period: string; pay_date: string; status: string }>): Promise<void> {
  await apiFetch(`/admin/hr/payroll-runs/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function fetchHrPayslips(runId: number, params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrPayslipDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrPayslipDto>>(`/admin/hr/payroll-runs/${runId}/payslips${suffix}`);
  return parsePaginated(payload);
}

export async function generateHrPayslips(runId: number, defaultDeductions?: number): Promise<void> {
  await apiFetch(`/admin/hr/payroll-runs/${runId}/payslips/generate`, {
    method: 'POST',
    body: JSON.stringify(defaultDeductions != null ? { default_deductions: defaultDeductions } : {}),
  });
}

export async function downloadHrPayslipPdf(runId: number, payslipId: number, employeeId: number): Promise<void> {
  await apiDownload(
    `/admin/hr/payroll-runs/${runId}/payslips/${payslipId}/download`,
    `payslip-employee-${employeeId}.pdf`,
  );
}

export async function fetchHrDesignations(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrDesignationDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrDesignationDto>>(`/admin/hr/designations${suffix}`);
  return parsePaginated(payload);
}

export async function createHrDesignation(name: string, description?: string): Promise<void> {
  await apiFetch('/admin/hr/designations', {
    method: 'POST',
    body: JSON.stringify({ name, description: description || undefined }),
  });
}

export async function deleteHrDesignation(id: number): Promise<void> {
  await apiFetch(`/admin/hr/designations/${id}`, { method: 'DELETE' });
}

export async function fetchHrSalaryAdvances(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrSalaryAdvanceDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrSalaryAdvanceDto>>(`/admin/hr/salary-advances${suffix}`);
  return parsePaginated(payload);
}

export async function createHrSalaryAdvance(body: { employee_id: number; amount: number; notes?: string }): Promise<void> {
  await apiFetch('/admin/hr/salary-advances', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateHrSalaryAdvance(id: number, status: 'pending' | 'approved' | 'rejected', notes?: string): Promise<void> {
  await apiFetch(`/admin/hr/salary-advances/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes: notes || undefined }),
  });
}

export async function fetchHrAnnouncements(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrAnnouncementDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrAnnouncementDto>>(`/admin/hr/announcements${suffix}`);
  return parsePaginated(payload);
}

export async function createHrAnnouncement(body: { title: string; body: string }): Promise<void> {
  await apiFetch('/admin/hr/announcements', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrAnnouncement(id: number): Promise<void> {
  await apiFetch(`/admin/hr/announcements/${id}`, { method: 'DELETE' });
}

export async function fetchHrRecruitmentOpenings(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrRecruitmentOpeningDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrRecruitmentOpeningDto>>(`/admin/hr/recruitment-openings${suffix}`);
  return parsePaginated(payload);
}

export async function createHrRecruitmentOpening(body: {
  title: string;
  department_id?: number;
  designation_id?: number;
  description?: string;
  deadline?: string;
}): Promise<void> {
  await apiFetch('/admin/hr/recruitment-openings', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrRecruitmentOpening(id: number): Promise<void> {
  await apiFetch(`/admin/hr/recruitment-openings/${id}`, { method: 'DELETE' });
}

export async function fetchHrInterviewSchedules(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrInterviewScheduleDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrInterviewScheduleDto>>(`/admin/hr/interview-schedules${suffix}`);
  return parsePaginated(payload);
}

export async function createHrInterviewSchedule(body: {
  recruitment_opening_id?: number;
  candidate_name: string;
  candidate_email?: string;
  scheduled_at: string;
  notes?: string;
}): Promise<void> {
  await apiFetch('/admin/hr/interview-schedules', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrInterviewSchedule(id: number): Promise<void> {
  await apiFetch(`/admin/hr/interview-schedules/${id}`, { method: 'DELETE' });
}

export async function fetchHrLifecycleEvents(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrLifecycleEventDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrLifecycleEventDto>>(`/admin/hr/lifecycle-events${suffix}`);
  return parsePaginated(payload);
}

export async function createHrLifecycleEvent(body: {
  employee_id: number;
  event_type: 'onboarding' | 'offboarding';
  event_date: string;
  notes?: string;
}): Promise<void> {
  await apiFetch('/admin/hr/lifecycle-events', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrLifecycleEvent(id: number): Promise<void> {
  await apiFetch(`/admin/hr/lifecycle-events/${id}`, { method: 'DELETE' });
}

export async function fetchHrPerformanceReviews(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrPerformanceReviewDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrPerformanceReviewDto>>(`/admin/hr/performance-reviews${suffix}`);
  return parsePaginated(payload);
}

export async function createHrPerformanceReview(body: {
  employee_id: number;
  review_date: string;
  rating?: number;
  summary?: string;
  goals?: string;
}): Promise<void> {
  await apiFetch('/admin/hr/performance-reviews', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrPerformanceReview(id: number): Promise<void> {
  await apiFetch(`/admin/hr/performance-reviews/${id}`, { method: 'DELETE' });
}

export async function fetchHrTrainingRecords(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrTrainingRecordDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrTrainingRecordDto>>(`/admin/hr/training-records${suffix}`);
  return parsePaginated(payload);
}

export async function createHrTrainingRecord(body: {
  employee_id: number;
  title: string;
  provider?: string;
  completed_on?: string;
  notes?: string;
}): Promise<void> {
  await apiFetch('/admin/hr/training-records', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrTrainingRecord(id: number): Promise<void> {
  await apiFetch(`/admin/hr/training-records/${id}`, { method: 'DELETE' });
}

export async function fetchHrBenefits(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResult<HrBenefitDto>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const payload = await apiFetch<ApiPaginated<HrBenefitDto>>(`/admin/hr/benefits${suffix}`);
  return parsePaginated(payload);
}

export async function createHrBenefit(body: {
  employee_id: number;
  benefit_type: string;
  amount?: number;
  effective_from?: string;
  effective_to?: string;
  notes?: string;
}): Promise<void> {
  await apiFetch('/admin/hr/benefits', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteHrBenefit(id: number): Promise<void> {
  await apiFetch(`/admin/hr/benefits/${id}`, { method: 'DELETE' });
}
