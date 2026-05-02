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
