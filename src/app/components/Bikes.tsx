import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Calendar, Gauge } from 'lucide-react';
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
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1080&q=80';

function BikeCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white shadow overflow-hidden ring-1 ring-gray-100">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-md w-[88%]" />
        <div className="h-7 bg-gray-200 rounded-md w-[36%]" />
        <div className="h-3 bg-gray-200 rounded-md w-full" />
        <div className="h-3 bg-gray-200 rounded-md w-3/5" />
      </div>
    </div>
  );
}

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
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('homeSections.usedBikesTitle')}</h2>
            <p className="text-gray-600 mt-2">{t('homeSections.usedBikesSubtitle')}</p>
          </div>
          <Link to="/used-bikes" className="text-[#233D7B] hover:underline font-semibold">
            {t('homeSections.viewAllBikes')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }, (_, i) => <BikeCardSkeleton key={i} />)
          ) : null}
          {!loading &&
            bikes.map((bike) => (
            <Link
              key={bike.id}
              to={listingPublicHref(bike)}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden block ring-1 ring-transparent hover:ring-[#233D7B]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#233D7B]"
            >
              <div className="relative">
                <ImageWithFallback
                  src={resolveMediaUrl(bike.media?.[0]?.path) || FALLBACK_IMAGE}
                  alt={bike.title}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{bike.title}</h3>
                <div className="text-[#3EB549] font-bold text-xl mb-3">{formatMoney(bike.price, bike.currency)}</div>

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
