import { User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchMe, logoutLocal } from '@/lib/auth';
import { getAuthToken } from '@/lib/api';
import { Link, useLocation } from 'react-router';
import { MORE_NAV_SECTIONS, MoreNavMenuPanel } from './MoreNavMenu';
import { AUTO_STORE_MOBILE_LINKS, AutoStoreMegaMenuPanel } from './AutoStoreMegaMenu';
import { POST_AD_MENU_LINKS, PostAdDropdownPanel } from './PostAdDropdown';
import { BIKES_MOBILE_LINKS, BIKES_NAV_TOOLTIP, BikesMegaMenuPanel } from './BikesMegaMenu';
import { NEW_CARS_MOBILE_LINKS, NEW_CARS_NAV_TOOLTIP, NewCarsMegaMenuPanel } from './NewCarsMegaMenu';
import { UsedCarsMegaMenuPanel } from './UsedCarsMegaMenu';

const navBtn =
  'flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-colors';

const navLink =
  'px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-colors';

/** Plain nav links with PakWheels-style solid white hover (no dropdown) */
const navLinkElevated =
  'px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-md text-white/95 transition-colors duration-150 hover:bg-white hover:text-gray-900';

export function Header({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const location = useLocation();
  const [me, setMe] = useState<{ id: number; name: string; email: string; roles?: Array<{ name: string }> } | null>(null);
  /** Avoid flashing “Sign In” while /auth/me resolves for a stored token */
  const [authReady, setAuthReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [usedCarsMobileOpen, setUsedCarsMobileOpen] = useState(false);
  const [newCarsMobileOpen, setNewCarsMobileOpen] = useState(false);
  const [bikesMobileOpen, setBikesMobileOpen] = useState(false);
  const [autoStoreMobileOpen, setAutoStoreMobileOpen] = useState(false);
  const [postAdMobileOpen, setPostAdMobileOpen] = useState(false);
  const [moreMobileOpen, setMoreMobileOpen] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((u) => {
      if (!cancelled) setMe(u);
    }).finally(() => {
      if (!cancelled) setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const doLogout = () => {
    logoutLocal();
    setMe(null);
    setAuthReady(true);
    setMsg('Logged out');
    setTimeout(() => setMsg(''), 2500);
  };

  const tokenWhileLoading = !authReady && typeof window !== 'undefined' && !!getAuthToken();

  const canAccessAdmin = !!me?.roles?.some((r) => ['super_admin', 'admin', 'moderator'].includes(r.name));
  const canAccessHr = !!me?.roles?.some((r) => ['super_admin', 'admin', 'hr_manager'].includes(r.name));
  const canAccessFinance = !!me?.roles?.some((r) =>
    ['super_admin', 'admin', 'finance_officer', 'account_manager'].includes(r.name),
  );
  const canAccessDealer = !!me?.roles?.some((r) => ['dealer', 'super_admin', 'admin'].includes(r.name));

  const go = (path: string) => {
    setMobileNavOpen(false);
    setUsedCarsMobileOpen(false);
    setNewCarsMobileOpen(false);
    setBikesMobileOpen(false);
    setAutoStoreMobileOpen(false);
    setPostAdMobileOpen(false);
    setMoreMobileOpen(false);
    onNavigate(path);
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    setUsedCarsMobileOpen(false);
    setNewCarsMobileOpen(false);
    setBikesMobileOpen(false);
    setAutoStoreMobileOpen(false);
    setPostAdMobileOpen(false);
    setMoreMobileOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow-md bg-[#233D7B]">
      {/* Utility strip */}
      <div className="border-b border-white/10 text-white/95">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-1.5 text-[12px] sm:text-[13px]">
          <div className="flex gap-4 sm:gap-6 min-w-0">
            <span className="hover:text-white cursor-default truncate transition">Download App via SMS</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {tokenWhileLoading ? (
              <span className="text-white/70 text-[11px] sm:text-xs whitespace-nowrap" aria-live="polite">
                Loading…
              </span>
            ) : !me ? (
              <Link to="/login" className="hover:text-white transition font-medium whitespace-nowrap">
                Sign In
              </Link>
            ) : (
              <div className="flex flex-wrap gap-x-3 gap-y-1 items-center justify-end">
                <button type="button" onClick={() => onNavigate('/wishlist')} className="hover:text-white transition text-[11px] sm:text-xs">
                  Wishlist
                </button>
                <button type="button" onClick={() => onNavigate('/my-listings')} className="hover:text-white transition text-[11px] sm:text-xs">
                  My listings
                </button>
                <button type="button" onClick={() => onNavigate('/messages')} className="hover:text-white transition text-[11px] sm:text-xs">
                  Messages
                </button>
                <span className="text-[11px] sm:text-xs flex items-center gap-1 max-w-[120px] sm:max-w-none truncate">
                  <User className="w-3.5 h-3.5 shrink-0" /> {me.name}
                </span>
                <button type="button" onClick={doLogout} className="hover:text-white transition flex items-center gap-1 text-[11px] sm:text-xs">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {msg ? <div className="bg-amber-50 text-amber-900 text-xs px-4 py-2 border-b border-amber-200">{msg}</div> : null}

      {/* Main dark nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-3 min-h-[52px] py-1">
          <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
            <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#C4161C] rounded-full flex items-center justify-center ring-2 ring-white/20 shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">B</span>
              </div>
              <span
                className="text-lg sm:text-xl font-bold text-white tracking-tight truncate max-w-[9.5rem] sm:max-w-none"
                style={{ letterSpacing: '-0.5px' }}
              >
                BanglarChaka
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 flex-wrap xl:flex-nowrap min-w-0">
              <div className="relative group/used">
                <Link
                  to="/listings?type=used_car"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/used:bg-white group-hover/used:text-gray-900 group-hover/used:border-white group-hover/used:border-b-white group-hover/used:shadow-[0_1px_0_0_white]"
                  title="Used cars for sale"
                >
                  Used Cars <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/used:pointer-events-auto group-hover/used:visible group-hover/used:opacity-100 transition-opacity duration-150 absolute left-0 top-full z-50 min-w-[min(720px,92vw)] max-w-[min(92vw,920px)]">
                  <UsedCarsMegaMenuPanel />
                </div>
              </div>

              <div className="relative group/new">
                <Link
                  to="/listings?type=new_car"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/new:bg-white group-hover/new:text-gray-900 group-hover/new:border-white group-hover/new:border-b-white group-hover/new:shadow-[0_1px_0_0_white]"
                  title={NEW_CARS_NAV_TOOLTIP}
                >
                  New Cars{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/new:text-[#C4161C]" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/new:pointer-events-auto group-hover/new:visible group-hover/new:opacity-100 transition-opacity duration-150 absolute left-0 top-full z-50 pt-1 min-w-[min(640px,92vw)] max-w-[min(92vw,840px)] w-max">
                  <NewCarsMegaMenuPanel />
                </div>
              </div>
              <div className="relative group/bikes">
                <Link
                  to="/listings?type=used_bike"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/bikes:bg-white group-hover/bikes:text-gray-900 group-hover/bikes:border-white group-hover/bikes:border-b-white group-hover/bikes:shadow-[0_1px_0_0_white]"
                  title={BIKES_NAV_TOOLTIP}
                >
                  Bikes{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/bikes:text-[#C4161C]" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/bikes:pointer-events-auto group-hover/bikes:visible group-hover/bikes:opacity-100 transition-opacity duration-150 absolute left-0 top-full z-50 pt-1 min-w-[min(900px,94vw)] max-w-[min(96vw,1040px)] w-max">
                  <BikesMegaMenuPanel />
                </div>
              </div>
              <div className="relative group/autostore">
                <Link
                  to="/listings?type=auto_part"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/autostore:bg-white group-hover/autostore:text-gray-900 group-hover/autostore:border-white group-hover/autostore:border-b-white group-hover/autostore:shadow-[0_1px_0_0_white]"
                  title="Auto parts & accessories"
                >
                  Auto Store{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/autostore:text-[#C4161C]" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/autostore:pointer-events-auto group-hover/autostore:visible group-hover/autostore:opacity-100 transition-opacity duration-150 absolute left-0 top-full z-50 pt-1 w-max">
                  <AutoStoreMegaMenuPanel />
                </div>
              </div>
              <Link to="/videos" className={navLinkElevated}>
                Videos
              </Link>
              <Link to="/forums" className={navLinkElevated}>
                Forums
              </Link>
              <Link to="/blog" className={navLinkElevated}>
                Blog
              </Link>
              {canAccessAdmin ? (
                <button type="button" onClick={() => onNavigate('/admin/moderation')} className={navBtn}>
                  Admin
                </button>
              ) : null}
              {canAccessHr ? (
                <button type="button" onClick={() => onNavigate('/admin/hr')} className={navBtn}>
                  HR
                </button>
              ) : null}
              {canAccessFinance ? (
                <button type="button" onClick={() => onNavigate('/admin/finance')} className={navBtn}>
                  Finance
                </button>
              ) : null}
              {canAccessDealer ? (
                <button type="button" onClick={() => onNavigate('/dealer/portal')} className={navBtn}>
                  Dealer Portal
                </button>
              ) : null}
              <div className="relative group/more">
                <button type="button" className={`${navBtn} items-center gap-1.5`} aria-haspopup="menu">
                  More <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-sky-500 text-white px-1 py-px rounded leading-none">
                    New
                  </span>
                </button>
                <div className="pointer-events-none invisible opacity-0 group-hover/more:pointer-events-auto group-hover/more:visible group-hover/more:opacity-100 transition-opacity duration-150 absolute right-0 top-full z-50 pt-1">
                  <MoreNavMenuPanel />
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative group/postad">
              <button
                type="button"
                onClick={() => onNavigate('/post-ad')}
                className="flex items-center gap-1.5 bg-[#C4161C] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 transition font-semibold shadow-sm text-[13px] sm:text-sm whitespace-nowrap"
                title="Post an ad — choose category from the menu"
              >
                Post an Ad
                <ChevronDown className="w-3.5 h-3.5 opacity-95 shrink-0 pointer-events-none" aria-hidden />
              </button>
              <div className="pointer-events-none invisible opacity-0 group-hover/postad:pointer-events-auto group-hover/postad:visible group-hover/postad:opacity-100 transition-opacity duration-150 absolute right-0 top-full z-50 pt-1">
                <PostAdDropdownPanel />
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <nav
            className="lg:hidden border-t border-white/15 py-3 pb-4 flex flex-col gap-0.5 text-[14px] font-medium text-white/95"
            style={{ fontWeight: 500 }}
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setUsedCarsMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md hover:bg-white/10 flex items-center justify-between"
                aria-expanded={usedCarsMobileOpen}
              >
                Used Cars
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${usedCarsMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {usedCarsMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  <Link
                    to="/listings?type=used_car"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    Browse all used cars
                  </Link>
                  <Link
                    to="/used-cars/featured"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    Featured used cars
                  </Link>
                  <Link
                    to="/used-cars/sell"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    Sell your car
                  </Link>
                  <Link
                    to="/used-car-dealers"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    Used car dealers
                  </Link>
                  <Link
                    to="/car-prices"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    Car prices
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setNewCarsMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md hover:bg-white/10 flex items-center justify-between"
                aria-expanded={newCarsMobileOpen}
              >
                New Cars
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${newCarsMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {newCarsMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {NEW_CARS_MOBILE_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setBikesMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md hover:bg-white/10 flex items-center justify-between"
                aria-expanded={bikesMobileOpen}
              >
                Bikes
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${bikesMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {bikesMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {BIKES_MOBILE_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setAutoStoreMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md hover:bg-white/10 flex items-center justify-between"
                aria-expanded={autoStoreMobileOpen}
              >
                Auto Store
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${autoStoreMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {autoStoreMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {AUTO_STORE_MOBILE_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <Link to="/videos" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
              Videos
            </Link>
            <Link to="/forums" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
              Forums
            </Link>
            <Link to="/blog" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
              Blog
            </Link>
            {canAccessAdmin ? (
              <button type="button" onClick={() => go('/admin/moderation')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                Admin
              </button>
            ) : null}
            {canAccessHr ? (
              <button type="button" onClick={() => go('/admin/hr')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                HR
              </button>
            ) : null}
            {canAccessFinance ? (
              <button type="button" onClick={() => go('/admin/finance')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                Finance
              </button>
            ) : null}
            {canAccessDealer ? (
              <button type="button" onClick={() => go('/dealer/portal')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                Dealer Portal
              </button>
            ) : null}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setMoreMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md hover:bg-white/10 flex items-center justify-between gap-2"
                aria-expanded={moreMobileOpen}
              >
                <span className="flex items-center gap-2">
                  More
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-sky-500 text-white px-1 py-px rounded leading-none">
                    New
                  </span>
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${moreMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-sky-500/70 ml-2 space-y-3">
                  {MORE_NAV_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/45 px-2 pt-1">{section.title}</div>
                      <div className="flex flex-col">
                        {section.links.map((l) => (
                          <Link
                            key={l.to}
                            to={l.to}
                            className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                            onClick={closeMobileNav}
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setPostAdMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md text-[#ffb4b4] font-semibold hover:bg-white/10 flex items-center justify-between gap-2"
                aria-expanded={postAdMobileOpen}
              >
                Post an Ad
                <ChevronDown className={`w-4 h-4 shrink-0 opacity-90 ${postAdMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {postAdMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {POST_AD_MENU_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    to="/post-ad"
                    className="block py-2 px-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded border-t border-white/10 mt-1 pt-3"
                    onClick={closeMobileNav}
                  >
                    Other listing types…
                  </Link>
                </div>
              ) : null}
            </div>
            {tokenWhileLoading ? (
              <span className="block px-2 py-2.5 text-white/70 text-sm">Loading…</span>
            ) : !me ? (
              <Link to="/login" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
                Sign In
              </Link>
            ) : (
              <button type="button" onClick={() => go('/my-listings')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                My listings
              </button>
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
