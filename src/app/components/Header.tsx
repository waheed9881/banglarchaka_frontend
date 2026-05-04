import { User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { useMarketPrefs } from '@/app/context/MarketPrefsContext';
import { fetchMe, logoutLocal, type MeResponse } from '@/lib/auth';
import { getAuthToken } from '@/lib/api';
import { Link, useLocation, useNavigate } from 'react-router';
import { MORE_NAV_SECTIONS, MoreNavMenuPanel } from './MoreNavMenu';
import { AUTO_STORE_MOBILE_LINKS, AutoStoreMegaMenuPanel } from './AutoStoreMegaMenu';
import { POST_AD_MENU_LINKS, PostAdDropdownPanel } from './PostAdDropdown';
import { BIKES_MOBILE_LINKS, BikesMegaMenuPanel } from './BikesMegaMenu';
import { NEW_CARS_MOBILE_LINKS, NewCarsMegaMenuPanel } from './NewCarsMegaMenu';
import { UsedCarsMegaMenuPanel } from './UsedCarsMegaMenu';
import logoUrl from '@/assets/logo_3.webp';
import { MarketRegionSwitcher } from '@/app/components/MarketRegionSwitcher';

const navBtn =
  'flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors';

/** Plain nav links — light header */
const navLinkElevated =
  'px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-md text-neutral-800 transition-colors duration-150 hover:bg-neutral-100';

export function Header({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse | null>(null);
  const { applyFromMe } = useMarketPrefs();
  /** Avoid flashing “Sign In” while /auth/me resolves for a stored token */
  const [authReady, setAuthReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [usedCarsMobileOpen, setUsedCarsMobileOpen] = useState(false);
  const [newCarsMobileOpen, setNewCarsMobileOpen] = useState(false);
  const [bikesMobileOpen, setBikesMobileOpen] = useState(false);
  const [autoStoreMobileOpen, setAutoStoreMobileOpen] = useState(false);
  const [postAdMobileOpen, setPostAdMobileOpen] = useState(false);
  const [moreMobileOpen, setMoreMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((u) => {
        if (!cancelled) setMe(u);
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    applyFromMe(me);
  }, [me, applyFromMe]);

  /** Verified dealer must pick a plan before using the site with this session */
  useEffect(() => {
    if (me?.status !== 'pending_plan') return;
    if (location.pathname === '/register/dealer-plan') return;
    navigate('/register/dealer-plan', { replace: true });
  }, [me?.status, location.pathname, navigate]);

  const doLogout = () => {
    logoutLocal();
    setMe(null);
    setAuthReady(true);
    setMsg(t('nav.loggedOut'));
    setTimeout(() => setMsg(''), 2500);
  };

  const tokenWhileLoading = !authReady && typeof window !== 'undefined' && !!getAuthToken();

  const canAccessAdmin = !!me?.roles?.some((r) => ['super_admin', 'admin', 'moderator'].includes(r.name));
  const canAccessHr = !!me?.roles?.some((r) => ['super_admin', 'admin', 'hr_manager'].includes(r.name));
  const canAccessFinance = !!me?.roles?.some((r) =>
    ['super_admin', 'admin', 'finance_officer', 'account_manager'].includes(r.name),
  );
  const canAccessStaffPortal = canAccessAdmin || canAccessHr || canAccessFinance;
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

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [accountMenuOpen]);

  const mobileAccordionBtn =
    'text-left px-3 py-3 rounded-md hover:bg-neutral-100 flex items-center justify-between gap-2 w-full text-neutral-900';

  return (
    <header
      className={`w-full bg-white border-b border-neutral-200/90 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${mobileNavOpen ? 'z-[200]' : 'z-50'}`}
    >
      {/* Utility strip */}
      <div className="border-b border-neutral-200/90 bg-white text-neutral-700">
        <div className="max-w-7xl mx-auto px-4 flex min-h-[40px] items-center justify-between py-1 text-[12px] sm:text-[13px]">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            {/* <span className="hover:text-white cursor-default truncate transition"></span> */}
            <MarketRegionSwitcher />
            <LanguageSwitcher />
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {tokenWhileLoading ? (
              <span className="text-neutral-500 text-[11px] sm:text-xs whitespace-nowrap" aria-live="polite">
                {t('common.loading')}
              </span>
            ) : !me ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-2.5 text-[11px] font-semibold text-neutral-800 transition hover:bg-neutral-100 hover:text-brand-red sm:px-3 sm:text-xs"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border border-neutral-300 bg-white px-2.5 text-[11px] font-semibold text-neutral-900 shadow-sm transition hover:border-brand-red/40 hover:text-brand-red sm:px-3 sm:text-xs"
                >
                  {t('nav.register')}
                </Link>
              </div>
            ) : (
              <div className="relative flex justify-end" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className="flex h-8 max-w-[min(52vw,14rem)] items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-neutral-800 transition hover:bg-neutral-100 sm:max-w-[16rem] sm:gap-1.5 sm:px-2.5 sm:text-xs"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <User className="w-3.5 h-3.5 shrink-0 text-neutral-600" aria-hidden />
                  <span className="truncate text-left">{me.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 opacity-80 transition ${accountMenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {accountMenuOpen ? (
                  <div
                    className="absolute right-0 top-full z-[250] mt-1 min-w-[13.5rem] rounded-lg border border-white/10 bg-white py-1 text-gray-900 shadow-xl"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('/wishlist');
                      }}
                    >
                      {t('nav.wishlist')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('/my-listings');
                      }}
                    >
                      {t('nav.myListings')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onNavigate('/messages');
                      }}
                    >
                      {t('nav.messages')}
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        doLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* {msg ? <div className="bg-amber-50 text-amber-900 text-xs px-4 py-2 border-b border-amber-200">{msg}</div> : null} */}

      {/* Main nav — relative so mega menus align to full content width (no horizontal overflow) */}
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-3 min-h-[52px] py-1">
          <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
            <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
              <img
                src={logoUrl}
                alt="Banglar Chaka — বাংলার চাকা"
                className="h-9 sm:h-10 w-auto max-w-[min(200px,48vw)] object-contain object-left"
                width={200}
                height={40}
                decoding="async"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 flex-wrap xl:flex-nowrap min-w-0 min-h-0">
              <div className="group/used">
                <Link
                  to="/listings?type=used_car"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-neutral-800 transition-colors duration-150 group-hover/used:bg-neutral-50 group-hover/used:text-neutral-900 group-hover/used:border-neutral-200 group-hover/used:border-b-neutral-50 group-hover/used:shadow-sm"
                  title={t('nav.tooltipUsedCars')}
                >
                  {t('nav.usedCars')} <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/used:pointer-events-auto group-hover/used:visible group-hover/used:opacity-100 transition-opacity duration-150 absolute left-0 right-0 top-full z-50 pt-1">
                  <div className="w-full min-w-0">
                    <UsedCarsMegaMenuPanel />
                  </div>
                </div>
              </div>

              <Link to="/auctions" className={navLinkElevated} title={t('nav.tooltipAuctions')}>
                {t('nav.auctions')}
              </Link>

              <div className="group/new">
                <Link
                  to="/new-cars"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-neutral-800 transition-colors duration-150 group-hover/new:bg-neutral-50 group-hover/new:text-neutral-900 group-hover/new:border-neutral-200 group-hover/new:border-b-neutral-50 group-hover/new:shadow-sm"
                  title={t('mega.newCars.banner')}
                >
                  {t('nav.newCars')}{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/new:text-brand-red" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/new:pointer-events-auto group-hover/new:visible group-hover/new:opacity-100 transition-opacity duration-150 absolute left-0 right-0 top-full z-50 pt-1">
                  <div className="w-full min-w-0">
                    <NewCarsMegaMenuPanel />
                  </div>
                </div>
              </div>
              <div className="group/bikes">
                <Link
                  to="/used-bikes"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-neutral-800 transition-colors duration-150 group-hover/bikes:bg-neutral-50 group-hover/bikes:text-neutral-900 group-hover/bikes:border-neutral-200 group-hover/bikes:border-b-neutral-50 group-hover/bikes:shadow-sm"
                  title={t('mega.bikes.banner')}
                >
                  {t('nav.bikes')}{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/bikes:text-brand-red" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/bikes:pointer-events-auto group-hover/bikes:visible group-hover/bikes:opacity-100 transition-opacity duration-150 absolute left-0 right-0 top-full z-50 pt-1">
                  <div className="w-full min-w-0 max-w-full overflow-x-auto">
                    <BikesMegaMenuPanel />
                  </div>
                </div>
              </div>
              <div className="relative group/autostore">
                <Link
                  to="/listings?type=auto_part"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-neutral-800 transition-colors duration-150 group-hover/autostore:bg-neutral-50 group-hover/autostore:text-neutral-900 group-hover/autostore:border-neutral-200 group-hover/autostore:border-b-neutral-50 group-hover/autostore:shadow-sm"
                  title={t('nav.tooltipAutoStore')}
                >
                  {t('nav.autoStore')}{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/autostore:text-brand-red" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/autostore:pointer-events-auto group-hover/autostore:visible group-hover/autostore:opacity-100 transition-opacity duration-150 absolute left-0 top-full z-50 pt-1 w-max max-w-[min(22rem,calc(100vw-2rem))]">
                  <AutoStoreMegaMenuPanel />
                </div>
              </div>
              <Link to="/videos" className={navLinkElevated}>
                {t('nav.videos')}
              </Link>
              <Link to="/forums" className={navLinkElevated}>
                {t('nav.forums')}
              </Link>
              <Link to="/blog" className={navLinkElevated}>
                {t('nav.blog')}
              </Link>
              {canAccessStaffPortal ? (
                <button type="button" onClick={() => onNavigate('/admin')} className={navBtn}>
                  {t('nav.admin')}
                </button>
              ) : null}
              {canAccessDealer ? (
                <button type="button" onClick={() => onNavigate('/dealer/portal')} className={navBtn}>
                  {t('nav.dealerPortal')}
                </button>
              ) : null}
              <div className="relative group/more">
                <button type="button" className={`${navBtn} items-center gap-1.5`} aria-haspopup="menu">
                  {t('nav.more')} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-brand-green text-white px-1 py-px rounded leading-none">
                    {t('common.new')}
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
                className="flex items-center gap-1.5 bg-brand-red text-white px-4 sm:px-6 py-2 rounded-md hover:bg-brand-red-hover transition font-semibold shadow-sm text-[13px] sm:text-sm whitespace-nowrap"
                title={t('nav.tooltipPostAd')}
              >
                {t('nav.postAd')}
                <ChevronDown className="w-3.5 h-3.5 opacity-95 shrink-0 pointer-events-none" aria-hidden />
              </button>
              <div className="pointer-events-none invisible opacity-0 group-hover/postad:pointer-events-auto group-hover/postad:visible group-hover/postad:opacity-100 transition-opacity duration-150 absolute right-0 top-full z-50 pt-1">
                <PostAdDropdownPanel />
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-2.5 rounded-lg hover:bg-neutral-100 text-neutral-800 -mr-1"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
            <div
              className="lg:hidden w-full border-t border-neutral-200 max-h-[min(78vh,calc(100dvh-10rem))] flex flex-col -mx-4 px-4 bg-neutral-50/70"
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.openMenu')}
            >
              <div
                className="overflow-y-auto overscroll-contain py-2 flex flex-col gap-0.5 text-[15px] font-medium text-neutral-900 min-h-0 flex-1"
                style={{ fontWeight: 500 }}
              >
                <div className="flex flex-col rounded-lg bg-white border border-neutral-200/80 px-1 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setUsedCarsMobileOpen((o) => !o)}
                    className={mobileAccordionBtn}
                    aria-expanded={usedCarsMobileOpen}
                  >
                    {t('nav.usedCars')}
                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-80 ${usedCarsMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {usedCarsMobileOpen ? (
                    <div className="pl-3 pr-2 pb-3 border-l-2 border-brand-red/90 ml-3 space-y-0.5">
                      <Link
                        to="/listings?type=used_car"
                        className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                        onClick={closeMobileNav}
                      >
                        {t('nav.browseAllUsedCars')}
                      </Link>
                      <Link
                        to="/used-cars/featured"
                        className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                        onClick={closeMobileNav}
                      >
                        {t('nav.featuredUsedCars')}
                      </Link>
                      <Link
                        to="/used-cars/sell"
                        className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                        onClick={closeMobileNav}
                      >
                        {t('nav.sellYourCar')}
                      </Link>
                      <Link
                        to="/used-car-dealers"
                        className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                        onClick={closeMobileNav}
                      >
                        {t('nav.usedCarDealers')}
                      </Link>
                      <Link
                        to="/car-prices"
                        className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                        onClick={closeMobileNav}
                      >
                        {t('nav.carPrices')}
                      </Link>
                    </div>
                  ) : null}
                </div>

                <Link
                  to="/auctions"
                  className="block py-3 px-3 rounded-lg hover:bg-neutral-100 text-neutral-900 font-medium"
                  onClick={closeMobileNav}
                >
                  {t('nav.auctions')}
                </Link>

                <div className="flex flex-col rounded-lg bg-white border border-neutral-200/80 px-1 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setNewCarsMobileOpen((o) => !o)}
                    className={mobileAccordionBtn}
                    aria-expanded={newCarsMobileOpen}
                  >
                    {t('nav.newCars')}
                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-80 ${newCarsMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {newCarsMobileOpen ? (
                    <div className="pl-3 pr-2 pb-3 border-l-2 border-brand-red/90 ml-3 space-y-0.5">
                      {NEW_CARS_MOBILE_LINKS.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                          onClick={closeMobileNav}
                        >
                          {t(l.labelKey)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col rounded-lg bg-white border border-neutral-200/80 px-1 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBikesMobileOpen((o) => !o)}
                    className={mobileAccordionBtn}
                    aria-expanded={bikesMobileOpen}
                  >
                    {t('nav.bikes')}
                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-80 ${bikesMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {bikesMobileOpen ? (
                    <div className="pl-3 pr-2 pb-3 border-l-2 border-brand-red/90 ml-3 space-y-0.5">
                      {BIKES_MOBILE_LINKS.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                          onClick={closeMobileNav}
                        >
                          {t(l.labelKey)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col rounded-lg bg-white border border-neutral-200/80 px-1 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAutoStoreMobileOpen((o) => !o)}
                    className={mobileAccordionBtn}
                    aria-expanded={autoStoreMobileOpen}
                  >
                    {t('nav.autoStore')}
                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-80 ${autoStoreMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {autoStoreMobileOpen ? (
                    <div className="pl-3 pr-2 pb-3 border-l-2 border-brand-red/90 ml-3 space-y-0.5">
                      {AUTO_STORE_MOBILE_LINKS.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                          onClick={closeMobileNav}
                        >
                          {t(l.labelKey)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                <Link to="/videos" className="block px-3 py-3 rounded-lg hover:bg-neutral-100 text-neutral-900" onClick={closeMobileNav}>
                  {t('nav.videos')}
                </Link>
                <Link to="/forums" className="block px-3 py-3 rounded-lg hover:bg-neutral-100 text-neutral-900" onClick={closeMobileNav}>
                  {t('nav.forums')}
                </Link>
                <Link to="/blog" className="block px-3 py-3 rounded-lg hover:bg-neutral-100 text-neutral-900" onClick={closeMobileNav}>
                  {t('nav.blog')}
                </Link>
                {canAccessStaffPortal ? (
                  <button type="button" onClick={() => go('/admin')} className="text-left px-3 py-3 rounded-lg hover:bg-neutral-100 w-full text-neutral-900">
                    {t('nav.admin')}
                  </button>
                ) : null}
                {canAccessDealer ? (
                  <button type="button" onClick={() => go('/dealer/portal')} className="text-left px-3 py-3 rounded-lg hover:bg-neutral-100 w-full text-neutral-900">
                    {t('nav.dealerPortal')}
                  </button>
                ) : null}

                <div className="flex flex-col rounded-lg bg-white border border-neutral-200/80 px-1 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setMoreMobileOpen((o) => !o)}
                    className={mobileAccordionBtn}
                    aria-expanded={moreMobileOpen}
                  >
                    <span className="flex items-center gap-2">
                      {t('nav.more')}
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-brand-green text-white px-1 py-px rounded leading-none">
                        {t('common.new')}
                      </span>
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-80 ${moreMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {moreMobileOpen ? (
                    <div className="pl-3 pr-2 pb-3 border-l-2 border-brand-green/80 ml-3 space-y-3">
                      {MORE_NAV_SECTIONS.map((section) => (
                        <div key={section.titleKey}>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 px-2 pt-1">{t(section.titleKey)}</div>
                          <div className="flex flex-col">
                            {section.links.map((l) => (
                              <Link
                                key={l.to}
                                to={l.to}
                                className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                                onClick={closeMobileNav}
                              >
                                {t(l.labelKey)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col rounded-lg bg-red-50 ring-1 ring-brand-red/35 px-1 py-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setPostAdMobileOpen((o) => !o)}
                    className="text-left px-3 py-3 rounded-md text-brand-red font-semibold hover:bg-white flex items-center justify-between gap-2 w-full"
                    aria-expanded={postAdMobileOpen}
                  >
                    {t('nav.postAd')}
                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-90 ${postAdMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {postAdMobileOpen ? (
                    <div className="pl-3 pr-2 pb-3 border-l-2 border-brand-red/40 ml-3 space-y-0.5">
                      {POST_AD_MENU_LINKS.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          className="block py-2.5 px-2 text-sm text-neutral-700 hover:text-brand-red hover:bg-red-50/60 rounded-md"
                          onClick={closeMobileNav}
                        >
                          {t(l.labelKey)}
                        </Link>
                      ))}
                      <Link
                        to="/post-ad"
                        className="block py-2.5 px-2 text-sm text-neutral-600 hover:text-brand-red hover:bg-white rounded-md border-t border-red-100 mt-2 pt-3"
                        onClick={closeMobileNav}
                      >
                        {t('nav.otherListingTypes')}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 border-t border-neutral-200 pt-4 pb-3 mt-1 bg-white rounded-b-lg">
                {tokenWhileLoading ? (
                  <span className="block px-3 py-2 text-neutral-500 text-sm">{t('common.loading')}</span>
                ) : !me ? (
                  <div className="grid grid-cols-2 gap-2 px-1">
                    <Link
                      to="/login"
                      className="block px-3 py-3 rounded-lg bg-brand-red text-white font-semibold text-center shadow-sm text-sm hover:bg-brand-red-hover"
                      onClick={closeMobileNav}
                    >
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-3 rounded-lg border border-neutral-300 text-neutral-900 font-semibold text-center text-sm hover:border-brand-red/40 hover:text-brand-red bg-white"
                      onClick={closeMobileNav}
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1 px-1">
                    <div className="px-2 py-2 text-xs text-neutral-500 truncate">{me.name}</div>
                    <button type="button" onClick={() => go('/wishlist')} className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-sm text-neutral-800">
                      {t('nav.wishlist')}
                    </button>
                    <button type="button" onClick={() => go('/my-listings')} className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-sm text-neutral-800">
                      {t('nav.myListings')}
                    </button>
                    <button type="button" onClick={() => go('/messages')} className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-sm text-neutral-800">
                      {t('nav.messages')}
                    </button>
                    <button type="button" onClick={doLogout} className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-sm text-neutral-600">
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
        ) : null}
      </div>
    </header>
  );
}
