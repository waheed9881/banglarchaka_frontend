import { API_V1 } from './config';

const TOKEN_KEY = 'banglarchaka_token';

export function getAuthToken(): string | null {
  const primary = localStorage.getItem(TOKEN_KEY);
  if (primary) return primary;
  const migrated = localStorage.getItem('pakwheels_clone_token');
  if (migrated) {
    localStorage.setItem(TOKEN_KEY, migrated);
    localStorage.removeItem('pakwheels_clone_token');
    return migrated;
  }
  return null;
}

export function setAuthToken(token: string | null): void {
  localStorage.removeItem('pakwheels_clone_token');
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_V1}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(init.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (
    init.body !== undefined &&
    !(init.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    const hint =
      import.meta.env.DEV && e instanceof TypeError
        ? `Could not reach the API (${url}). Start Laravel with \`php artisan serve\` (default http://127.0.0.1:8000) so Vite proxies ${API_V1}. (${e.message})`
        : e instanceof Error
          ? e.message
          : 'Network request failed';
    throw new Error(hint);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let msg =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : typeof data === 'string'
          ? data
          : res.statusText;
    if (typeof data === 'object' && data !== null && 'errors' in data) {
      const errors = (data as { errors?: Record<string, string[] | string> }).errors;
      if (errors && typeof errors === 'object') {
        const flat = Object.values(errors).flatMap((v) => (Array.isArray(v) ? v : [String(v)]));
        if (flat.length > 0) {
          msg = flat[0];
        }
      }
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (typeof data === 'string') {
    const trimmed = data.trimStart();
    const hint =
      trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE')
        ? 'This usually means the browser received an HTML page instead of JSON from the API. Run `php artisan serve` (default :8000) so Vite can proxy `/api`. For `pnpm preview`, configure `preview.proxy` in vite.config.'
        : `Unexpected text response: ${trimmed.slice(0, 120)}`;
    throw new Error(hint);
  }

  return data as T;
}

async function fetchWithAuth(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_V1}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}

export async function apiFetchText(path: string, init: RequestInit = {}): Promise<string> {
  const res = await fetchWithAuth(path, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.text();
}

export async function apiDownload(path: string, filename: string, init: RequestInit = {}): Promise<void> {
  const res = await fetchWithAuth(path, init);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
