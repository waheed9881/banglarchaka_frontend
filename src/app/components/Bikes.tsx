import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Calendar, Gauge } from 'lucide-react';
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
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1080&q=80';

/** Brands with strong presence in Bangladesh (commuter + sport segments). */
const BIKE_BRANDS = ['Honda', 'Yamaha', 'Suzuki', 'Bajaj', 'TVS', 'Hero', 'Runner'] as const;

export function Bikes() {
  const { t } = useTranslation();
  const [bikes, setBikes] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings({ listing_type: 'used_bike', sort: 'newest', per_page: 8 })
      .then((rows) => setBikes(rows))
      .catch(() => setBikes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-y border-slate-100 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <PremiumSectionHeading
          eyebrow={t('homePremiumHeading.usedBikesEyebrow')}
          title={t('homeSections.usedBikesTitle')}
          subtitle={t('homeSections.usedBikesSubtitle')}
          action={
            <Link to="/used-bikes" className="shrink-0 text-sm font-bold text-[#ba0035] underline-offset-4 hover:underline">
              {t('homeSections.viewAllBikes')}
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? <SkeletonCardGrid count={8} /> : null}
          {!loading &&
            bikes.map((bike) => (
            <Link
              key={bike.id}
              to={listingPublicHref(bike)}
              className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00236f]/40"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={resolveMediaUrl(listingCoverMediaPath(bike.media)) || FALLBACK_IMAGE}
                  alt={bike.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-[#00236f]">{bike.title}</h3>
                <div className="mb-3 text-xl font-bold text-emerald-700">{formatMoney(bike.price, bike.currency)}</div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {bike.location_city || t('homeFeatured.na')}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 shrink-0" />
                      {bike.vehicle_year || t('homeFeatured.na')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4 shrink-0" />
                      {bike.mileage_km ? `${bike.mileage_km.toLocaleString()} km` : t('homeFeatured.na')}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {BIKE_BRANDS.map((name) => (
            <Link
              key={name}
              to={`/listings?type=used_bike&q=${encodeURIComponent(name)}`}
              className="bg-white rounded-lg p-4 shadow hover:shadow-md transition text-center border-l-4 border-[#C4161C] ring-1 ring-gray-100 hover:ring-[#233D7B]/30"
            >
              <div className="text-2xl font-bold text-gray-900">{name}</div>
              <div className="text-sm text-gray-600 mt-1">{t('homeSections.browseListings')}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
