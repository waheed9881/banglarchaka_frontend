import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useOutletContext } from 'react-router';
import {
  ADMIN_FINANCE_ROLES,
  ADMIN_HR_ROLES,
  ADMIN_MOD_ROLES,
  canAccessAdminPortal,
  fetchMe,
  hasStaffRole,
} from '@/lib/auth';

export type AdminOutletContext = {
  canModerate: boolean;
  canHr: boolean;
  canFinance: boolean;
};

function navCls({ isActive }: { isActive: boolean }) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-[#233D7B] text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;
}

/** Default `/admin` → first section this user can access. */
export function AdminPanelIndexRedirect() {
  const ctx = useOutletContext<AdminOutletContext>();
  if (ctx.canModerate) return <Navigate to="moderation" replace />;
  if (ctx.canHr) return <Navigate to="hr" replace />;
  if (ctx.canFinance) return <Navigate to="finance" replace />;
  return <Navigate to="/" replace />;
}

export function AdminLayout() {
  const [phase, setPhase] = useState<'loading' | 'denied' | 'ready'>('loading');
  const [flags, setFlags] = useState<AdminOutletContext>({
    canModerate: false,
    canHr: false,
    canFinance: false,
  });

  useEffect(() => {
    fetchMe()
      .then((me) => {
        if (!me || !canAccessAdminPortal(me)) {
          setPhase('denied');
          return;
        }
        setFlags({
          canModerate: hasStaffRole(me, ADMIN_MOD_ROLES),
          canHr: hasStaffRole(me, ADMIN_HR_ROLES),
          canFinance: hasStaffRole(me, ADMIN_FINANCE_ROLES),
        });
        setPhase('ready');
      })
      .catch(() => setPhase('denied'));
  }, []);

  if (phase === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600 text-sm">Loading admin panel…</p>
      </div>
    );
  }

  if (phase === 'denied') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center space-y-4">
            <h1 className="text-xl font-bold text-gray-900">Admin sign-in required</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Is account par moderation, HR ya finance admin access hona chahiye. Pehle sign in karein — demo ke liye backend seed
              karke <strong>super_admin</strong> wala user use karein.
            </p>
            <Link
              to="/login?next=/admin"
              className="inline-flex rounded-lg bg-[#233D7B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a2d5a]"
            >
              Sign in to admin
            </Link>
            <Link to="/" className="block text-sm text-[#233D7B] hover:underline pt-2">
              ← Back to site
            </Link>
            {import.meta.env.DEV ? (
              <p className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                Seed:{' '}
                <code className="bg-gray-100 px-1 rounded">admin@banglarchaka.local</code> /{' '}
                <code className="bg-gray-100 px-1 rounded">BanglarAdmin1!</code>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col lg:flex-row">
      <aside className="lg:w-56 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
        <div className="p-4 lg:p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Admin panel</h2>
          <p className="text-xs text-gray-500 mt-1">Moderation, HR, Finance</p>
        </div>
        <nav className="flex flex-row lg:flex-col gap-1 p-2 overflow-x-auto lg:overflow-visible">
          {flags.canModerate ? (
            <NavLink to="/admin/moderation" className={navCls}>
              Moderation
            </NavLink>
          ) : null}
          {flags.canHr ? (
            <NavLink to="/admin/hr" className={navCls}>
              HR
            </NavLink>
          ) : null}
          {flags.canFinance ? (
            <NavLink to="/admin/finance" className={navCls}>
              Finance
            </NavLink>
          ) : null}
        </nav>
        <div className="hidden lg:block p-4 mt-auto border-t border-gray-100">
          <Link to="/" className="text-xs font-medium text-[#233D7B] hover:underline">
            ← Site home
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet context={flags} />
      </main>
    </div>
  );
}
