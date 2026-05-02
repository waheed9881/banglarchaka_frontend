import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { Landmark, LayoutDashboard, MessagesSquare, UsersRound } from 'lucide-react';
import { fetchMe } from '@/lib/auth';
import { dp } from '@/app/components/dealerPortalTheme';
import { setPageSeo } from '@/lib/seo';

const DEALER_PORTAL_ROLES = new Set(['dealer', 'super_admin', 'admin']);

const nav = [
  { to: '/dealer/portal', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dealer/portal/hr', end: false, label: 'Human resources', icon: UsersRound },
  { to: '/dealer/portal/finance', end: false, label: 'Finance', icon: Landmark },
] as const;

export function DealerPortalLayout() {
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  useEffect(() => {
    setPageSeo('Dealer portal · BanglarChaka', 'Dashboard, HR, and finance for your showroom.');
  }, []);

  useEffect(() => {
    fetchMe()
      .then((me) => setCanAccess(!!me?.roles?.some((r) => DEALER_PORTAL_ROLES.has(r.name))))
      .catch(() => setCanAccess(false));
  }, []);

  if (canAccess === false) {
    return (
      <div className={`${dp.shell} flex items-center justify-center px-4 py-16`}>
        <div className={`${dp.card} ${dp.cardPad} max-w-md text-center`}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <LayoutDashboard className="h-7 w-7" aria-hidden />
          </div>
          <h1 className={dp.heroTitle}>Access restricted</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Dealer portal opens for dealer accounts (plus admins). Sign in with a showroom-linked profile or ask support for role access.
          </p>
          <Link to="/" className={`mt-6 ${dp.btnPrimary} w-full`}>
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (canAccess === null) {
    return (
      <div className={`${dp.shell} flex items-center justify-center px-4`}>
        <div className={`${dp.card} px-10 py-8 flex flex-col items-center gap-4`}>
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#233D7B] border-t-transparent" aria-hidden />
          <p className="text-sm font-medium text-slate-600">Opening dealer workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={dp.shell}>
      <div className={dp.inner}>
        {/* Hero strip */}
        <div className="relative mb-8 lg:mb-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#233D7B] via-[#2d4a8f] to-[#1a2d5a] px-6 py-8 sm:px-10 sm:py-10 text-white shadow-xl shadow-[#233D7B]/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden />
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-2">BanglarChaka · Dealer workspace</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your showroom command centre</h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base text-white/85 leading-relaxed">
                Profile, inventory, buyer messages, HR, and books — aligned for how real dealerships operate day to day.
              </p>
            </div>
            <Link
              to="/messages"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <MessagesSquare className="h-5 w-5" aria-hidden />
              Messages inbox
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-24 space-y-2" aria-label="Dealer portal sections">
              <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Navigate</p>
              {nav.map(({ to, end, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => dp.navSidebarItem(isActive)}>
                  <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Mobile nav */}
          <div className="lg:hidden -mt-2 mb-2 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `${dp.navMobilePill(isActive)} snap-start`}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label.replace('Human resources', 'HR')}
              </NavLink>
            ))}
          </div>

          <main className="flex-1 min-w-0 pb-16">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
