import { type Dispatch, type MouseEvent, type SetStateAction } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Heart,
  Link2,
  MapPin,
  Phone,
} from 'lucide-react';
import { Link } from 'react-router';
import { getAuthToken } from '@/lib/api';
import { addToWishlist, removeFromWishlist } from '@/lib/engagement';
import { formatMoney, listingPublicHref, type BrandDto, type ListingDto } from '@/lib/marketplace';
import { BD_CITIES as BD_CITIES_ALL } from '@/i18n/bdCities';
import { ListingCardHoverGallery } from '../ListingCardHoverGallery';

const FALLBACK =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=640&q=80';

export function mergeListingParams(
  locationSearch: string,
  updates: Record<string, string | null | undefined>,
): URLSearchParams {
  const next = new URLSearchParams(locationSearch);
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null || v === '') next.delete(k);
    else next.set(k, v);
  }
  next.delete('page');
  return next;
}

export {
  validatePakListingSidebarInput,
  type PakFilterFieldErrors,
  type PakFilterValidSnapshot,
  type PakListingFilterValidateResult,
  normalizePriceDigits,
  KEYWORD_MAX_LEN,
} from './listingPakFilterValidate';

export { PakFiltersSidebar } from './PakFiltersSidebarPanel';

export function formatListingUpdated(car: ListingDto, t: TFunction): string {
  const raw = car.updated_at || car.created_at;
  if (!raw) return t('listingBrowse.updatedRecently');
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return t('listingBrowse.updatedRecently');
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('listingBrowse.updatedJustNow');
  if (mins < 60) {
    return mins === 1 ? t('listingBrowse.updatedOneMinute') : t('listingBrowse.updatedMinutes', { count: mins });
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return hrs === 1 ? t('listingBrowse.updatedOneHour') : t('listingBrowse.updatedHours', { count: hrs });
  }
  const days = Math.floor(hrs / 24);
  if (days < 14) {
    return days === 1 ? t('listingBrowse.updatedOneDay') : t('listingBrowse.updatedDays', { count: days });
  }
  const locale = typeof document !== 'undefined' && document.documentElement.lang === 'bn' ? 'bn-BD' : 'en-GB';
  const dateStr = d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  return t('listingBrowse.updatedOnDate', { date: dateStr });
}

export function listingSpecsLine(car: ListingDto): string {
  const parts: string[] = [];
  if (car.vehicle_year != null) parts.push(String(car.vehicle_year));
  if (car.mileage_km != null && Number.isFinite(Number(car.mileage_km))) {
    parts.push(`${Number(car.mileage_km).toLocaleString()} km`);
  }
  if (car.fuel_type) {
    const f = car.fuel_type;
    parts.push(f.charAt(0).toUpperCase() + f.slice(1));
  }
  const dyn = car.dynamic_attributes;
  if (dyn && typeof dyn === 'object') {
    const cc = (dyn as Record<string, unknown>).engine_cc ?? (dyn as Record<string, unknown>).cc;
    if (cc != null && String(cc).trim() !== '') parts.push(`${cc} cc`);
    else if (typeof (dyn as Record<string, unknown>).engine === 'string') {
      parts.push(String((dyn as Record<string, unknown>).engine));
    }
  }
  if (car.transmission) {
    const t = car.transmission;
    parts.push(t.charAt(0).toUpperCase() + t.slice(1));
  }
  return parts.join(' | ');
}

export function formatPriceBanglaShort(car: ListingDto): string {
  const n = Number(car.price);
  if (!Number.isFinite(n)) return formatMoney(car.price, car.currency);
  const lac = n / 100000;
  if (lac >= 0.1 && lac < 1000) {
    const rounded = lac >= 10 ? lac.toFixed(1) : lac.toFixed(2);
    return `৳ ${rounded} lac${Number(rounded) !== 1 ? 's' : ''}`;
  }
  return formatMoney(car.price, car.currency);
}

type RowPakProps = {
  car: ListingDto;
  wishlistedIds: Set<string>;
  setWishlistedIds: Dispatch<SetStateAction<Set<string>>>;
  copiedListingId: string | null;
  copyListingUrl: (car: ListingDto, e: MouseEvent) => void;
  phoneRevealId: string | null;
  setPhoneRevealId: Dispatch<SetStateAction<string | null>>;
};

export function PakListingRow({
  car,
  wishlistedIds,
  setWishlistedIds,
  copiedListingId,
  copyListingUrl,
  phoneRevealId,
  setPhoneRevealId,
}: RowPakProps) {
  const { t } = useTranslation();
  const href = car.has_live_auction ? `${listingPublicHref(car)}#detail-auction` : listingPublicHref(car);
  const phone = car.seller?.phone?.trim();
  const showPhone = phoneRevealId === car.id;

  return (
    <article className="flex flex-col sm:flex-row gap-0 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition overflow-hidden">
      <Link
        to={href}
        className="relative shrink-0 w-full sm:w-[200px] md:w-[220px] h-44 sm:h-auto sm:min-h-[140px] bg-gray-100 block"
      >
        <ListingCardHoverGallery
          media={car.media}
          fallbackSrc={FALLBACK}
          alt=""
          wrapperClassName="sm:absolute sm:inset-0"
          className="h-full w-full object-cover sm:absolute sm:inset-0"
          loading="lazy"
        />
        {car.featured ? (
          <span className="absolute top-2 left-2 bg-[#C4161C] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
            {t('listingBrowse.featured')}
          </span>
        ) : null}
        {car.has_live_auction ? (
          <span className="absolute bottom-2 left-2 bg-[#233D7B] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
            {t('listingBrowse.auctionBadge')}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col md:flex-row md:justify-between gap-3 p-4 min-w-0">
        <div className="min-w-0 flex-1">
          <Link to={href} className="text-[17px] font-bold text-[#1565C0] hover:underline leading-snug line-clamp-2">
            {car.title}
          </Link>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {car.location_city || t('listingBrowse.defaultCountry')}
          </div>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">{listingSpecsLine(car)}</p>
          <p className="text-xs text-gray-500 mt-3">{formatListingUpdated(car, t)}</p>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between gap-3 shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 md:pl-4 md:border-l md:border-gray-100">
          <div className="text-xl font-bold text-gray-900 tabular-nums">{formatPriceBanglaShort(car)}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-gray-200 bg-white p-2 hover:bg-gray-50"
              onClick={(e) => copyListingUrl(car, e)}
              aria-label={copiedListingId === car.id ? t('listingBrowse.copied') : t('listingBrowse.copyLink')}
            >
              {copiedListingId === car.id ? (
                <Check className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
              ) : (
                <Link2 className="h-5 w-5 text-gray-600" strokeWidth={2} />
              )}
            </button>
            <button
              type="button"
              className="rounded border border-gray-200 bg-white p-2 hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                if (!getAuthToken()) {
                  window.alert(t('listingBrowse.signInFavourites'));
                  return;
                }
                const saved = wishlistedIds.has(car.id);
                (saved ? removeFromWishlist(car.id) : addToWishlist(car.id))
                  .then(() =>
                    setWishlistedIds((prev) => {
                      const next = new Set(prev);
                      if (saved) next.delete(car.id);
                      else next.add(car.id);
                      return next;
                    }),
                  )
                  .catch((err) => window.alert(err instanceof Error ? err.message : t('listingBrowse.wishlistFailed')));
              }}
              aria-label={t('listingBrowse.wishlistAria')}
            >
              <Heart
                className={`w-5 h-5 ${wishlistedIds.has(car.id) ? 'text-[#C4161C] fill-current' : 'text-gray-600'}`}
              />
            </button>
            {phone ? (
              <button
                type="button"
                onClick={() => setPhoneRevealId((prev) => (prev === car.id ? null : car.id))}
                className="inline-flex items-center gap-2 rounded bg-[#3EB549] text-white px-4 py-2 text-sm font-bold hover:bg-[#36a340] transition whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                {showPhone ? phone : t('listingBrowse.showPhone')}
              </button>
            ) : (
              <span className="text-xs text-gray-400 whitespace-nowrap">{t('listingBrowse.noPhone')}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function UsedCarsListingFooter() {
  const { t } = useTranslation();
  const cols = [
    {
      titleKey: 'listingBrowse.footerColCity' as const,
      links: BD_CITIES_ALL.slice(0, 8).map((c) => ({
        label: t('listingBrowse.carsInCity', { city: c }),
        to: `/listings?type=used_car&city=${encodeURIComponent(c)}`,
      })),
    },
    {
      titleKey: 'listingBrowse.footerColMake' as const,
      links: ['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'Nissan', 'Mitsubishi'].map((m) => ({
        label: t('listingBrowse.usedMake', { make: m }),
        to: `/listings?type=used_car&q=${encodeURIComponent(m)}`,
      })),
    },
    {
      titleKey: 'listingBrowse.footerColBudget' as const,
      links: [
        { label: t('listingBrowse.budgetUnder5'), to: '/listings?type=used_car&max_price=500000' },
        { label: t('listingBrowse.budget5to15'), to: '/listings?type=used_car&min_price=500000&max_price=1500000' },
        { label: t('listingBrowse.budget15to40'), to: '/listings?type=used_car&min_price=1500000&max_price=4000000' },
        { label: t('listingBrowse.featuredCars'), to: '/listings?type=used_car&featured=1' },
      ],
    },
  ];

  return (
    <div className="mt-12 space-y-10 border-t border-gray-200 pt-10">
      <div className="flex flex-col gap-6 rounded-xl border border-[#233D7B]/15 bg-gradient-to-r from-gray-50 to-slate-100/80 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{t('listingBrowse.footerSellTitle')}</h3>
          <p className="text-gray-600 mt-1 text-sm">{t('listingBrowse.footerSellSubtitle')}</p>
        </div>
        <Link
          to="/used-cars/sell"
          className="inline-flex justify-center rounded-lg bg-[#3EB549] px-8 py-3 text-white font-bold hover:bg-[#36a340] transition shadow-md shrink-0"
        >
          {t('listingBrowse.sellYourCar')}
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('listingBrowse.footerSectionTitle')}</h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">{t('listingBrowse.footerSectionBody')}</p>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-8">
        <h3 className="text-center text-lg font-bold text-[#233D7B] mb-6">{t('listingBrowse.browseMoreTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cols.map((col) => (
            <div key={col.titleKey}>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">{t(col.titleKey)}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-[#233D7B] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/90 bg-slate-50 px-4 py-4 text-center text-sm text-gray-700">
        <strong className="text-[#233D7B]">{t('listingBrowse.notifyLead')}</strong> {t('listingBrowse.notifyTrail')}{' '}
        <Link to="/login" className="underline font-semibold">
          {t('listingBrowse.notifySignIn')}
        </Link>{' '}
        {t('listingBrowse.notifyEnd')}
      </div>
    </div>
  );
}
