import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Calendar, Gauge, Heart, Link2, MapPin, Settings, Check } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney, resolveMediaUrl, type ListingDto } from '@/lib/marketplace';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1080&q=80';

type ListingGridCardProps = {
  car: ListingDto;
  onOpen: () => void;
  wishlisted: boolean;
  onToggleWishlist: (e: MouseEvent<HTMLButtonElement>) => void;
  copied: boolean;
  onCopyLink: (e: MouseEvent<HTMLButtonElement>) => void;
};

export function ListingGridCard({
  car,
  onOpen,
  wishlisted,
  onToggleWishlist,
  copied,
  onCopyLink,
}: ListingGridCardProps) {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-[0_8px_30px_-6px_rgba(0,35,111,0.08)] outline-none transition duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_20px_44px_-12px_rgba(0,35,111,0.14)] focus-visible:ring-2 focus-visible:ring-[#00236f]/35 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK_IMAGE}
          alt={car.title}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-x-0 top-0 z-[1] bg-gradient-to-b from-black/25 to-transparent p-3 pb-8" aria-hidden />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {car.featured ? (
            <span className="rounded-md bg-[#00236f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {t('listingBrowse.featured')}
            </span>
          ) : null}
          {car.has_live_auction ? (
            <span className="rounded-md bg-[#ba0035] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {t('listingBrowse.auctionBadge')}
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-[#00236f]"
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink(e);
            }}
            aria-label={copied ? t('listingPage.copyListingCopiedAria') : t('listingPage.copyListingLinkAria')}
            title={t('listingPage.copyLinkTitle')}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.25} /> : <Link2 className="h-4 w-4" strokeWidth={2} />}
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition hover:border-white hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(e);
            }}
            aria-label={wishlisted ? t('listingPage.removeWishlistAria') : t('listingPage.saveWishlistAria')}
          >
            <Heart
              className={`h-4 w-4 ${wishlisted ? 'fill-[#ba0035] text-[#ba0035]' : 'text-slate-600'}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug tracking-tight text-[#00236f]">
          {car.title}
        </h3>
        <p className="mt-2 font-sans text-xl font-bold tabular-nums tracking-tight text-[#00236f]">
          {formatMoney(car.price, car.currency)}
        </p>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
          <span className="truncate font-medium">{car.location_city || t('homeFeatured.na')}</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-slate-100 pt-3 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-semibold tabular-nums text-slate-700">{car.vehicle_year || '—'}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-slate-100 px-1">
            <Gauge className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-semibold tabular-nums text-slate-700">
              {car.mileage_km ? t('listingDetail.mileageKm', { n: car.mileage_km.toLocaleString() }) : '—'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Settings className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
            <span className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-tight text-slate-700">
              {car.transmission || '—'}
            </span>
          </div>
        </div>

        <p className="mt-3 truncate text-[11px] text-slate-500">
          <span className="font-medium text-slate-400">{t('listingPage.sellerLabel')}</span>{' '}
          {car.seller?.name || t('listingPage.unknownSeller')}
        </p>
      </div>
    </div>
  );
}
