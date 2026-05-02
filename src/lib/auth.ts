import { apiFetch, setAuthToken } from './api';

export type AuthResponse = {
  token: string;
  token_type: string;
  user: { id: number; name: string; email: string; roles?: Array<{ name: string }> };
};

export type MeResponse = {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ name: string }>;
  country_code?: string | null;
  preferred_currency?: string | null;
};

/** Roles that can use moderation APIs (listings, reviews, reports queue). */
export const ADMIN_MOD_ROLES = ['super_admin', 'admin', 'moderator'] as const;

/** Roles that can use admin HR APIs. */
export const ADMIN_HR_ROLES = ['super_admin', 'admin', 'hr_manager'] as const;

/** Roles that can use admin finance APIs. */
export const ADMIN_FINANCE_ROLES = ['super_admin', 'admin', 'finance_officer', 'account_manager'] as const;

export function hasStaffRole(me: MeResponse | null | undefined, roles: readonly string[]): boolean {
  return !!me?.roles?.some((r) => roles.includes(r.name));
}

/** Any staff section under `/admin` (moderation, HR, or finance). */
export function canAccessAdminPortal(me: MeResponse | null | undefined): boolean {
  return (
    hasStaffRole(me, ADMIN_MOD_ROLES) ||
    hasStaffRole(me, ADMIN_HR_ROLES) ||
    hasStaffRole(me, ADMIN_FINANCE_ROLES)
  );
}

/**
 * After login/register: honor `?next=`, then send staff to `/admin`, else home.
 */
export function resolvePostLoginPath(me: MeResponse | null, returnTo: string | null): string {
  if (returnTo) return returnTo;
  if (canAccessAdminPortal(me)) return '/admin';
  return '/';
}

export async function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  setAuthToken(data.token);
  return data;
}

export async function loginWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  return data;
}

export type RegisterPendingResponse = {
  requires_otp: true;
  message: string;
  email_mask?: string;
  debug_code?: string;
};

export async function registerBuyer(params: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}): Promise<AuthResponse | RegisterPendingResponse> {
  const data = await apiFetch<AuthResponse | RegisterPendingResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if ('requires_otp' in data && data.requires_otp) {
    return data;
  }
  const auth = data as AuthResponse;
  setAuthToken(auth.token);
  return auth;
}

export async function verifyRegistrationOtp(email: string, otp: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
  });
  setAuthToken(data.token);
  return data;
}

/** Request reset email — always succeeds with generic messaging if email format is valid. */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
}

/** Complete reset after clicking link from email */
export async function resetPasswordApi(params: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function logoutLocal(): void {
  setAuthToken(null);
}

export async function fetchMe(): Promise<MeResponse | null> {
  try {
    return await apiFetch<MeResponse>('/auth/me');
  } catch {
    return null;
  }
}

export async function patchAccountPreferences(body: {
  country_code: string;
  preferred_currency: string;
}): Promise<MeResponse> {
  return apiFetch<MeResponse>('/account/preferences', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
