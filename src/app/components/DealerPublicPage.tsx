import { ArrowLeft, CheckCircle, MapPin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import {
  fetchDealerProfile,
  formatMoney,
  resolveMediaUrl,
  type DealerProfileDto,
} from '@/lib/marketplace';
import { getAuthToken } from '@/lib/api';
import { setPageSeo } from '@/lib/seo';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1280&q=80';

export function DealerPublicPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<DealerProfileDto | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) {
      setDealer(null);
      return;
    }
    setDealer(undefined);
    fetchDealerProfile(slug)
      .then(setDealer)
      .catch(() => setDealer(null));
  }, [slug]);

  useEffect(() => {
    if (dealer === undefined) return;
    if (!dealer) {
      setPageSeo(t('dealerPublic.seoNotFound'));
      return;
    }
    const desc = (
      dealer.about?.trim() || t('dealerPublic.seoDealerDescFallback', { name: dealer.business_name })
    ).slice(0, 160);
    setPageSeo(t('dealerPublic.seoDealerTitle', { name: dealer.business_name }), desc);
  }, [dealer, t]);

  if (dealer === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-600">{t('dealerPublic.loading')}</div>
    );
  }

  if (!dealer) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-700 mb-4">{t('dealerPublic.notFound')}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[#233D7B] font-semibold hover:underline"
        >
          {t('dealerPublic.backHome')}
        </button>
      </div>
    );
  }

  const branchCity = dealer.branches?.find((b) => b.city)?.city ?? dealer.branches?.[0]?.city;
  const listings = dealer.listings ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="h-40 md:h-52 bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] relative">
        {dealer.banner_path ? (
          <img
            src={resolveMediaUrl(dealer.banner_path) ?? ''}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        ) : null}
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-white drop-shadow-md hover:underline text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-100 shadow flex items-center justify-center overflow-hidden shrink-0">
              {dealer.logo_path ? (
                <img
                  src={resolveMediaUrl(dealer.logo_path) ?? ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-[#233D7B]">
                  {dealer.business_name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{dealer.business_name}</h1>
                {dealer.verified_at ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {t('dealerPublic.verified')}
                  </span>
                ) : null}
              </div>

              {branchCity ? (
                <p className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {branchCity}
                </p>
              ) : null}

              {dealer.about ? <p className="text-gray-700 leading-relaxed mb-4">{dealer.about}</p> : null}

              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (!slug) return;
                    if (!getAuthToken()) {
                      window.alert(t('dealerPublic.signInToMessage'));
                      navigate('/login');
                      return;
                    }
                    navigate(`/messages?dealer=${encodeURIComponent(slug)}`);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#233D7B] text-white font-medium hover:bg-[#1a2d5a]"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('dealerPublic.messageShowroom')}
                </button>
                {dealer.whatsapp ? (
                  <a
                    href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                  >
                    {t('dealerPublic.whatsapp')}
                  </a>
                ) : null}
                {dealer.website ? (
                  <a
                    href={dealer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:border-[#233D7B]"
                  >
                    {t('dealerPublic.website')}
                  </a>
                ) : null}
              </div>

              {dealer.response_rate_percent != null ? (
                <p className="mt-4 text-sm text-gray-500">
                  {dealer.avg_response_time_seconds != null
                    ? t('dealerPublic.responseLine', {
                        rate: dealer.response_rate_percent,
                        mins: Math.round(dealer.avg_response_time_seconds / 60),
                      })
                    : t('dealerPublic.responseLineNoAvg', { rate: dealer.response_rate_percent })}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {dealer.branches && dealer.branches.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dealerPublic.locations')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dealer.branches.map((b) => (
                <div
                  key={b.id ?? `${b.name ?? 'branch'}-${b.city ?? ''}`}
                  className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
                >
                  <div className="font-semibold text-gray-900">{b.name || t('dealerPublic.branchFallback')}</div>
                  {b.city ? (
                    <p className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {b.city}
                    </p>
                  ) : null}
                  {b.address_line ? (
                    <p className="text-sm text-gray-600 mt-1 pl-6">{b.address_line}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">{t('dealerPublic.listingsHeading')}</h2>
        {listings.length === 0 ? (
          <p className="text-gray-600">{t('dealerPublic.noListings')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((car) => (
              <button
                key={car.id}
                type="button"
                onClick={() =>
                  navigate(
                    car.listing_type === 'new_car'
                      ? `/new-cars/${car.id}`
                      : `/listings/${car.id}`,
                  )
                }
                className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition text-left overflow-hidden"
              >
                <div className="aspect-[16/10] bg-gray-100">
                  <img
                    src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK_IMAGE}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{car.title}</h3>
                  {car.brand?.name ? (
                    <p className="text-xs text-gray-500 mt-1">{car.brand.name}</p>
                  ) : null}
                  <p className="text-[#C4161C] font-bold mt-2">
                    {formatMoney(car.price, car.currency)}
                  </p>
                  {car.location_city ? (
                    <p className="text-sm text-gray-500 mt-1">{car.location_city}</p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
