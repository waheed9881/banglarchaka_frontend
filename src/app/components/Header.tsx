import { User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { fetchMe, logoutLocal } from '@/lib/auth';
import { getAuthToken } from '@/lib/api';
import { Link, useLocation } from 'react-router';
import { MORE_NAV_SECTIONS, MoreNavMenuPanel } from './MoreNavMenu';
import { AUTO_STORE_MOBILE_LINKS, AutoStoreMegaMenuPanel } from './AutoStoreMegaMenu';
import { POST_AD_MENU_LINKS, PostAdDropdownPanel } from './PostAdDropdown';
import { BIKES_MOBILE_LINKS, BikesMegaMenuPanel } from './BikesMegaMenu';
import { NEW_CARS_MOBILE_LINKS, NewCarsMegaMenuPanel } from './NewCarsMegaMenu';
import { UsedCarsMegaMenuPanel } from './UsedCarsMegaMenu';
import logoUrl from '@/assets/logo_3.webp';

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
  const { t } = useTranslation();
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
    setMsg(t('nav.loggedOut'));
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

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <header
      className={`w-full shadow-md bg-[#233D7B] ${mobileNavOpen ? 'z-[200]' : 'z-50'}`}
    >
      {/* Utility strip */}
      <div className="border-b border-white/10 text-white/95">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-1.5 text-[12px] sm:text-[13px]">
          <div className="flex gap-4 sm:gap-6 min-w-0 items-center">
            <span className="hover:text-white cursor-default truncate transition">{t('nav.downloadAppSms')}</span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {tokenWhileLoading ? (
              <span className="text-white/70 text-[11px] sm:text-xs whitespace-nowrap" aria-live="polite">
                {t('common.loading')}
              </span>
            ) : !me ? (
              <Link to="/login" className="hover:text-white transition font-medium whitespace-nowrap">
                {t('nav.signIn')}
              </Link>
            ) : (
              <div className="flex flex-wrap gap-x-3 gap-y-1 items-center justify-end">
                <button type="button" onClick={() => onNavigate('/wishlist')} className="hover:text-white transition text-[11px] sm:text-xs">
                  {t('nav.wishlist')}
                </button>
                <button type="button" onClick={() => onNavigate('/my-listings')} className="hover:text-white transition text-[11px] sm:text-xs">
                  {t('nav.myListings')}
                </button>
                <button type="button" onClick={() => onNavigate('/messages')} className="hover:text-white transition text-[11px] sm:text-xs">
                  {t('nav.messages')}
                </button>
                <span className="text-[11px] sm:text-xs flex items-center gap-1 max-w-[120px] sm:max-w-none truncate">
                  <User className="w-3.5 h-3.5 shrink-0" /> {me.name}
                </span>
                <button type="button" onClick={doLogout} className="hover:text-white transition flex items-center gap-1 text-[11px] sm:text-xs">
                  <LogOut className="w-3.5 h-3.5" />
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {msg ? <div className="bg-amber-50 text-amber-900 text-xs px-4 py-2 border-b border-amber-200">{msg}</div> : null}

      {/* Main dark nav — relative so mega menus align to full content width (no horizontal overflow) */}
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
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/used:bg-white group-hover/used:text-gray-900 group-hover/used:border-white group-hover/used:border-b-white group-hover/used:shadow-[0_1px_0_0_white]"
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

              <div className="group/new">
                <Link
                  to="/new-cars"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/new:bg-white group-hover/new:text-gray-900 group-hover/new:border-white group-hover/new:border-b-white group-hover/new:shadow-[0_1px_0_0_white]"
                  title={t('mega.newCars.banner')}
                >
                  {t('nav.newCars')}{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/new:text-[#C4161C]" />
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
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/bikes:bg-white group-hover/bikes:text-gray-900 group-hover/bikes:border-white group-hover/bikes:border-b-white group-hover/bikes:shadow-[0_1px_0_0_white]"
                  title={t('mega.bikes.banner')}
                >
                  {t('nav.bikes')}{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/bikes:text-[#C4161C]" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/bikes:pointer-events-auto group-hover/bikes:visible group-hover/bikes:opacity-100 transition-opacity duration-150 absolute left-0 right-0 top-full z-50 pt-1">
                  <div className="w-full min-w-0 max-w-full overflow-x-auto">
                    <BikesMegaMenuPanel />
                  </div>
                </div>
              </div>
              <div className="group/autostore">
                <Link
                  to="/listings?type=auto_part"
                  className="relative z-[60] flex items-center gap-1 px-2.5 xl:px-3 py-2.5 text-[13px] xl:text-sm font-medium rounded-t-md border border-transparent text-white/95 transition-colors duration-150 group-hover/autostore:bg-white group-hover/autostore:text-gray-900 group-hover/autostore:border-white group-hover/autostore:border-b-white group-hover/autostore:shadow-[0_1px_0_0_white]"
                  title={t('nav.tooltipAutoStore')}
                >
                  {t('nav.autoStore')}{' '}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 transition-colors group-hover/autostore:text-[#C4161C]" />
                </Link>
                <div className="pointer-events-none invisible opacity-0 group-hover/autostore:pointer-events-auto group-hover/autostore:visible group-hover/autostore:opacity-100 transition-opacity duration-150 absolute left-0 right-0 top-full z-50 pt-1">
                  <div className="w-full min-w-0 flex justify-start">
                    <AutoStoreMegaMenuPanel />
                  </div>
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
              {canAccessAdmin ? (
                <button type="button" onClick={() => onNavigate('/admin/moderation')} className={navBtn}>
                  {t('nav.admin')}
                </button>
              ) : null}
              {canAccessHr ? (
                <button type="button" onClick={() => onNavigate('/admin/hr')} className={navBtn}>
                  {t('nav.hr')}
                </button>
              ) : null}
              {canAccessFinance ? (
                <button type="button" onClick={() => onNavigate('/admin/finance')} className={navBtn}>
                  {t('nav.finance')}
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
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-sky-500 text-white px-1 py-px rounded leading-none">
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
                className="flex items-center gap-1.5 bg-[#C4161C] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-700 transition font-semibold shadow-sm text-[13px] sm:text-sm whitespace-nowrap"
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
              className="lg:hidden p-2.5 rounded-lg hover:bg-white/10 text-white -mr-1"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? t('nav.closeMenu') : t('nav.openMenu')}
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
                {t('nav.usedCars')}
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${usedCarsMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {usedCarsMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  <Link
                    to="/listings?type=used_car"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    {t('nav.browseAllUsedCars')}
                  </Link>
                  <Link
                    to="/used-cars/featured"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    {t('nav.featuredUsedCars')}
                  </Link>
                  <Link
                    to="/used-cars/sell"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    {t('nav.sellYourCar')}
                  </Link>
                  <Link
                    to="/used-car-dealers"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    {t('nav.usedCarDealers')}
                  </Link>
                  <Link
                    to="/car-prices"
                    className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                    onClick={closeMobileNav}
                  >
                    {t('nav.carPrices')}
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
                {t('nav.newCars')}
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${newCarsMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {newCarsMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {NEW_CARS_MOBILE_LINKS.map((l) => (
                    <Link
                      key={l.to + l.labelKey}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {t(l.labelKey)}
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
                {t('nav.bikes')}
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${bikesMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {bikesMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {BIKES_MOBILE_LINKS.map((l) => (
                    <Link
                      key={l.to + l.labelKey}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {t(l.labelKey)}
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
                {t('nav.autoStore')}
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${autoStoreMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {autoStoreMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {AUTO_STORE_MOBILE_LINKS.map((l) => (
                    <Link
                      key={l.to + l.labelKey}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {t(l.labelKey)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <Link to="/videos" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
              {t('nav.videos')}
            </Link>
            <Link to="/forums" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
              {t('nav.forums')}
            </Link>
            <Link to="/blog" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
              {t('nav.blog')}
            </Link>
            {canAccessAdmin ? (
              <button type="button" onClick={() => go('/admin/moderation')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                {t('nav.admin')}
              </button>
            ) : null}
            {canAccessHr ? (
              <button type="button" onClick={() => go('/admin/hr')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                {t('nav.hr')}
              </button>
            ) : null}
            {canAccessFinance ? (
              <button type="button" onClick={() => go('/admin/finance')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                {t('nav.finance')}
              </button>
            ) : null}
            {canAccessDealer ? (
              <button type="button" onClick={() => go('/dealer/portal')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                {t('nav.dealerPortal')}
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
                  {t('nav.more')}
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-sky-500 text-white px-1 py-px rounded leading-none">
                    {t('common.new')}
                  </span>
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform opacity-80 ${moreMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-sky-500/70 ml-2 space-y-3">
                  {MORE_NAV_SECTIONS.map((section) => (
                    <div key={section.titleKey}>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/45 px-2 pt-1">{t(section.titleKey)}</div>
                      <div className="flex flex-col">
                        {section.links.map((l) => (
                          <Link
                            key={l.to}
                            to={l.to}
                            className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
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
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setPostAdMobileOpen((o) => !o)}
                className="text-left px-2 py-2.5 rounded-md text-[#ffb4b4] font-semibold hover:bg-white/10 flex items-center justify-between gap-2"
                aria-expanded={postAdMobileOpen}
              >
                {t('nav.postAd')}
                <ChevronDown className={`w-4 h-4 shrink-0 opacity-90 ${postAdMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {postAdMobileOpen ? (
                <div className="pl-2 pb-2 border-l-2 border-[#C4161C]/80 ml-2 space-y-0.5">
                  {POST_AD_MENU_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="block py-2 px-2 text-sm text-white/85 hover:text-white hover:bg-white/5 rounded"
                      onClick={closeMobileNav}
                    >
                      {t(l.labelKey)}
                    </Link>
                  ))}
                  <Link
                    to="/post-ad"
                    className="block py-2 px-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded border-t border-white/10 mt-1 pt-3"
                    onClick={closeMobileNav}
                  >
                    {t('nav.otherListingTypes')}
                  </Link>
                </div>
              ) : null}
            </div>
            {tokenWhileLoading ? (
              <span className="block px-2 py-2.5 text-white/70 text-sm">{t('common.loading')}</span>
            ) : !me ? (
              <Link to="/login" className="block px-2 py-2.5 rounded-md hover:bg-white/10" onClick={closeMobileNav}>
                {t('nav.signIn')}
              </Link>
            ) : (
              <button type="button" onClick={() => go('/my-listings')} className="text-left px-2 py-2.5 rounded-md hover:bg-white/10">
                {t('nav.myListings')}
              </button>
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
