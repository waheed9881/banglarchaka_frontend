import { apiFetch, setAuthToken } from './api';

export type AuthResponse = {
  token: string;
  token_type: string;
  user: { id: number; name: string; email: string };
};

export type MeResponse = {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ name: string }>;
};

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

export async function registerBuyer(params: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  setAuthToken(data.token);
  return data;
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
