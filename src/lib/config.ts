/**
 * Resolved API base for `/api/v1` requests.
 *
 * Development (default): `/api/v1` — same-origin; Vite proxies `/api` (and `/storage`) to
 * `VITE_DEV_API_PROXY` (default http://127.0.0.1:8000). Stray absolute `VITE_API_URL` values
 * from the environment are ignored unless `VITE_API_FULL_URL=1`.
 *
 * Set `VITE_API_FULL_URL=1` to honor `VITE_API_URL` again (direct browser → Laravel).
 *
 * Production: explicit `VITE_API_URL` → host + `/api/v1`; empty → same-origin `/api/v1`.
 */
const rawApiUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

const devUseViteProxy = import.meta.env.DEV && import.meta.env.VITE_API_FULL_URL !== '1';

export const API_V1 = devUseViteProxy
  ? '/api/v1'
  : rawApiUrl
    ? /\/api\/v\d+$/i.test(rawApiUrl)
      ? rawApiUrl
      : `${rawApiUrl}/api/v1`
    : import.meta.env.DEV
      ? 'http://127.0.0.1:8000/api/v1'
      : '/api/v1';
