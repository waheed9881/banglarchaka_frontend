import { useEffect, useState } from 'react';
import { API_V1 } from '@/lib/config';
import { apiFetch } from '@/lib/api';

type CategoriesPayload = { data?: unknown[] };

function listingsTotal(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const meta = (payload as { meta?: { total?: unknown } }).meta;
  const t = meta?.total;
  return typeof t === 'number' ? t : null;
}

export function ApiConnectionHint() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'warn_categories' | 'warn_listings' | 'err'>(
    'idle',
  );
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catJson = await apiFetch<CategoriesPayload>('/categories');
        const catCount = Array.isArray(catJson?.data) ? catJson.data.length : 0;

        let usedCarTotal: number | null = null;
        try {
          const listJson = await apiFetch<unknown>('/listings?listing_type=used_car&per_page=1');
          usedCarTotal = listingsTotal(listJson);
        } catch {
          usedCarTotal = null;
        }

        if (cancelled) return;

        if (catCount === 0) {
          setStatus('warn_categories');
          setDetail('');
          return;
        }

        if (usedCarTotal === 0) {
          setStatus('warn_listings');
          setDetail('');
          return;
        }

        setStatus('ok');
        setDetail(
          `${catCount} root categor${catCount === 1 ? 'y' : 'ies'} · ${usedCarTotal.toLocaleString()} used cars · ${API_V1}`,
        );
      } catch (e) {
        if (!cancelled) {
          setStatus('err');
          const msg = e instanceof Error ? e.message : 'Request failed';
          setDetail(msg.length > 180 ? `${msg.slice(0, 180)}...` : msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'idle') {
    return (
      <div className="w-full py-2 text-xs text-slate-500">
        API: connecting… <span className="opacity-70">({API_V1})</span>
      </div>
    );
  }

  if (status === 'err') {
    return (
      <div className="w-full py-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-lg mb-2 px-3">
        <strong>Backend:</strong> could not reach API ({API_V1}). {detail} — in dev, run{' '}
        <code className="bg-amber-100 px-1 rounded">php artisan serve</code> on{' '}
        <code className="bg-amber-100 px-1 rounded">VITE_DEV_API_PROXY</code> (default{' '}
        <code className="bg-amber-100 px-1 rounded">http://127.0.0.1:8000</code>) so Vite can proxy{' '}
        <code className="bg-amber-100 px-1 rounded">/api</code>.
      </div>
    );
  }

  if (status === 'warn_categories') {
    return (
      <div className="w-full py-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-lg mb-2 px-3 space-y-1">
        <p>
          <strong>API reachable — data missing.</strong>{' '}
          <code className="bg-amber-100 px-1 rounded">{API_V1}</code> loads no categories — seed the Laravel DB your dev proxy uses (
          <code className="bg-amber-100 px-1 rounded">VITE_DEV_API_PROXY</code>, usually{' '}
          <code className="bg-amber-100 px-1 rounded">http://127.0.0.1:8000</code>).
        </p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>
            <span className="opacity-90">Already inside the </span>
            <code className="bg-amber-100 px-1 rounded">backend</code>
            <span className="opacity-90"> folder:</span>{' '}
            <code className="bg-amber-100 px-1 rounded">php artisan marketplace:ensure</code>
          </li>
          <li>
            <span className="opacity-90">At </span>
            <code className="bg-amber-100 px-1 rounded">pakwheels-clone</code>
            <span className="opacity-90"> root:</span> <code className="bg-amber-100 px-1 rounded">cd backend</code>
            <span className="opacity-90">, then the same command (do not </span>
            <code className="bg-amber-100 px-1 rounded">cd backend</code>
            <span className="opacity-90"> twice).</span>
          </li>
        </ul>
        <p className="opacity-95 mt-1">
          Full reset: <code className="bg-amber-100 px-1 rounded">php artisan migrate:fresh --seed</code>. If you already
          seeded but this persists: <code className="bg-amber-100 px-1 rounded">php artisan marketplace:doctor</code> then
          restart <code className="bg-amber-100 px-1 rounded">php artisan serve</code>. Use this repo&apos;s Vite port (
          <code className="bg-amber-100 px-1 rounded">VITE_DEV_PORT</code>, default 5275) so <code className="bg-amber-100 px-1 rounded">/api</code>{' '}
          proxies correctly. Restart <code className="bg-amber-100 px-1 rounded">npm run dev</code> after env changes.
        </p>
      </div>
    );
  }

  if (status === 'warn_listings') {
    return (
      <div className="w-full py-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-lg mb-2 px-3">
        <strong>API reachable — listings missing:</strong> Categories exist but{' '}
        <code className="bg-amber-100 px-1 rounded">{API_V1}</code> has 0 used_car rows. In{' '}
        <code className="bg-amber-100 px-1 rounded">backend</code> run{' '}
        <code className="bg-amber-100 px-1 rounded">php artisan marketplace:ensure</code> (vehicles CSV beside{' '}
        <code className="bg-amber-100 px-1 rounded">backend</code> per{' '}
        <code className="bg-amber-100 px-1 rounded">.env.example</code>) or{' '}
        <code className="bg-amber-100 px-1 rounded">php artisan migrate:fresh --seed</code>.
      </div>
    );
  }

  return (
    <div className="w-full py-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg mb-2 px-3">
      <strong>API OK:</strong> {detail}
    </div>
  );
}
