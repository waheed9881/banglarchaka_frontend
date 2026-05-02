import { MapPin, Gauge, Calendar, Settings } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  fetchListings,
  formatMoney,
  listingPublicHref,
  resolveMediaUrl,
  type ListingDto,
} from '@/lib/marketplace';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1080&q=80';

function FeaturedCarCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white shadow overflow-hidden ring-1 ring-gray-100">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-md w-[85%]" />
        <div className="h-7 bg-gray-200 rounded-md w-[40%]" />
        <div className="h-3 bg-gray-200 rounded-md w-full" />
        <div className="h-3 bg-gray-200 rounded-md w-4/5" />
      </div>
    </div>
  );
}

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
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('homeFeatured.title')}</h2>
            {feedHint ? <p className="text-sm text-gray-600 mt-2">{feedHint}</p> : null}
          </div>
          <Link to="/listings?type=used_car" className="text-[#233D7B] hover:underline font-semibold shrink-0">
            {t('homeFeatured.viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }, (_, i) => <FeaturedCarCardSkeleton key={i} />)
          ) : null}
          {!loading &&
            cars.map((car) => (
            <Link
              key={car.id}
              to={`${listingPublicHref(car)}${car.has_live_auction ? '#detail-auction' : ''}`}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden block ring-1 ring-transparent hover:ring-[#233D7B]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#233D7B]"
            >
              <div className="relative">
                <ImageWithFallback
                  src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK_IMAGE}
                  alt={car.title}
                  className="w-full h-48 object-cover"
                />
                {car.featured ? (
                  <div className="absolute top-3 left-3 bg-[#C4161C] text-white px-3 py-1 rounded text-xs font-semibold">
                    {t('homeFeatured.badge')}
                  </div>
                ) : null}
                {car.has_live_auction ? (
                  <div className="absolute bottom-3 left-3 bg-[#233D7B] text-white px-2.5 py-1 rounded text-[11px] font-bold shadow">
                    {t('listingBrowse.auctionBadge')}
                  </div>
                ) : null}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{car.title}</h3>
                <div className="text-[#3EB549] font-bold text-xl mb-3">{formatMoney(car.price, car.currency)}</div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {car.location_city || t('homeFeatured.na')}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 shrink-0" />
                      {car.vehicle_year || t('homeFeatured.na')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4 shrink-0" />
                      {car.mileage_km ? `${car.mileage_km.toLocaleString()} km` : t('homeFeatured.na')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 shrink-0" />
                    {car.transmission || t('homeFeatured.na')}
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
