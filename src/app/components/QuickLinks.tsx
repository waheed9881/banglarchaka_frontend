import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const POPULAR_SEARCH_QUERIES = [
  'Toyota Corolla',
  'Honda Civic',
  'Suzuki Alto',
  'Honda CD 70',
  'Yamaha YBR',
  'Mercedes C Class',
  'BMW 3 Series',
  'Cultus VXR',
] as const;

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
    <section className="py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('quickLinks.popularTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_QUERIES.map((search) => (
                <Link
                  key={search}
                  to={`/listings?type=used_car&q=${encodeURIComponent(search)}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#233D7B] hover:text-white transition"
                >
                  {search}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('quickLinks.browseByCity')}</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_CITIES.map(({ param, labelKey }) => (
                <Link
                  key={param}
                  to={`/listings?type=used_car&city=${encodeURIComponent(param)}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#233D7B] hover:text-white transition"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-100">
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
