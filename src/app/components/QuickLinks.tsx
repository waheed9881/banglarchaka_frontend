import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';
import { BD_POPULAR_QUICK_SEARCHES } from '@/app/data/bdPopularCars';

const QUICK_CITIES = [
  { param: 'Dhaka', labelKey: 'footer.cityDhaka' as const },
  { param: 'Chattogram', labelKey: 'footer.cityChattogram' as const },
  { param: 'Rajshahi', labelKey: 'footer.cityRajshahi' as const },
  { param: 'Khulna', labelKey: 'footer.cityKhulna' as const },
  { param: 'Sylhet', labelKey: 'footer.citySylhet' as const },
  { param: 'Gazipur', labelKey: 'footer.cityGazipur' as const },
  { param: 'Barishal', labelKey: 'footer.cityBarishal' as const },
  { param: 'Rangpur', labelKey: 'footer.cityRangpur' as const },
];

export function QuickLinks() {
  const { t } = useTranslation();

  const promos = [
    {
      titleKey: 'quickLinks.promoCatalogTitle',
      bodyKey: 'quickLinks.promoCatalogBody',
      to: '/listings?type=used_car',
    },
    {
      titleKey: 'quickLinks.promoSearchTitle',
      bodyKey: 'quickLinks.promoSearchBody',
      to: '/listings?type=used_car',
    },
    {
      titleKey: 'quickLinks.promoDealersTitle',
      bodyKey: 'quickLinks.promoDealersBody',
      to: '/used-car-dealers',
    },
    {
      titleKey: 'quickLinks.promoSafeTitle',
      bodyKey: 'quickLinks.promoSafeBody',
      to: '/privacy',
    },
  ] as const;

  return (
    <section className="border-t border-slate-200 bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <PremiumSectionHeading
          align="center"
          className="mb-12 md:mb-14"
          eyebrow={t('homePremiumHeading.quickLinksEyebrow')}
          title={t('homePremiumHeading.quickLinksTitle')}
          subtitle={t('homePremiumHeading.quickLinksSubtitle')}
        />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-bold tracking-tight text-[#00236f] md:text-xl">{t('quickLinks.popularTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {BD_POPULAR_QUICK_SEARCHES.map((item) => (
                <Link
                  key={`${item.listingType}-${item.q}`}
                  to={`/listings?type=${item.listingType}&q=${encodeURIComponent(item.q)}`}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-[#00236f] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold tracking-tight text-[#00236f] md:text-xl">{t('quickLinks.browseByCity')}</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_CITIES.map(({ param, labelKey }) => (
                <Link
                  key={param}
                  to={`/listings?type=used_car&city=${encodeURIComponent(param)}`}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-[#00236f] hover:text-white"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {promos.map((item) => (
              <Link key={item.titleKey} to={item.to} className="group rounded-lg p-2 hover:bg-white/60 transition">
                <div className="text-lg font-bold text-[#233D7B] group-hover:underline">{t(item.titleKey)}</div>
                <div className="text-sm text-gray-600 mt-1 leading-snug">{t(item.bodyKey)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
