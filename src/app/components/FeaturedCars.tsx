import { MapPin, Gauge, Calendar, Settings } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  fetchListings,
  formatMoney,
  listingPublicHref,
  listingCoverMediaPath,
  resolveMediaUrl,
  type ListingDto,
} from '@/lib/marketplace';
import { SkeletonCardGrid } from '@/app/components/PremiumSkeleton';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1080&q=80';

export function FeaturedCars() {
  const { t } = useTranslation();
  const [cars, setCars] = useState<ListingDto[]>([]);
  const [feedHint, setFeedHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const featured = await fetchListings({ listing_type: 'used_car', featured: 1, per_page: 8 });
        if (cancelled) return;
        if (featured.length > 0) {
          setCars(featured);
          setFeedHint(null);
          return;
        }
        const popular = await fetchListings({ listing_type: 'used_car', sort: 'views', per_page: 8 });
        if (cancelled) return;
        setCars(popular);
        setFeedHint(t('homeFeatured.feedHint'));
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <section className="bg-[#f8f9fa] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#00236f] md:text-4xl">{t('homeFeatured.title')}</h2>
            {feedHint ? <p className="mt-2 max-w-xl text-sm text-slate-600">{feedHint}</p> : null}
          </div>
          <Link
            to="/listings?type=used_car"
            className="shrink-0 text-sm font-bold text-[#ba0035] underline-offset-4 hover:underline"
          >
            {t('homeFeatured.viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? <SkeletonCardGrid count={8} /> : null}
          {!loading &&
            cars.map((car) => (
            <Link
              key={car.id}
              to={`${listingPublicHref(car)}${car.has_live_auction ? '#detail-auction' : ''}`}
              className="group block overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-[0_8px_30px_-6px_rgba(0,35,111,0.08)] outline-none transition duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_20px_44px_-12px_rgba(0,35,111,0.14)] focus-visible:ring-2 focus-visible:ring-[#00236f]/35 focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <ImageWithFallback
                  src={resolveMediaUrl(listingCoverMediaPath(car.media)) || FALLBACK_IMAGE}
                  alt={car.title}
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/20 to-transparent p-3 pb-10" aria-hidden />
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                  {car.featured ? (
                    <span className="rounded-md bg-[#00236f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {t('homeFeatured.badge')}
                    </span>
                  ) : null}
                  {car.has_live_auction ? (
                    <span className="rounded-md bg-[#ba0035] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {t('listingBrowse.auctionBadge')}
                    </span>
                  ) : null}
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
                      {car.mileage_km ? `${car.mileage_km.toLocaleString()} km` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
                    <span className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-tight text-slate-700">
                      {car.transmission || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
