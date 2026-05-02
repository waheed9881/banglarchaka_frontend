import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const MORE_NAV_SECTIONS: Array<{
  titleKey: string;
  links: Array<{ labelKey: string; to: string }>;
}> = [
  {
    titleKey: 'moreNav.tools',
    links: [
      { labelKey: 'moreNav.compareCars', to: '/compare' },
      { labelKey: 'nav.carPrices', to: '/car-prices' },
      { labelKey: 'moreNav.carReviews', to: '/car-reviews' },
      { labelKey: 'moreNav.sitemap', to: '/sitemap' },
    ],
  },
  {
    titleKey: 'moreNav.bikesStore',
    links: [
      { labelKey: 'moreNav.newBikes', to: '/new-bikes' },
      { labelKey: 'moreNav.bikePrices', to: '/bike-prices' },
      { labelKey: 'moreNav.bikeReviews', to: '/bike-reviews' },
      { labelKey: 'moreNav.accessories', to: '/accessories' },
      { labelKey: 'moreNav.wheelsTyres', to: '/wheels-tyres' },
      { labelKey: 'moreNav.engineParts', to: '/engine-parts' },
      { labelKey: 'moreNav.carCare', to: '/car-care' },
    ],
  },
  {
    titleKey: 'moreNav.legal',
    links: [
      { labelKey: 'moreNav.terms', to: '/terms' },
      { labelKey: 'moreNav.privacy', to: '/privacy' },
    ],
  },
];

export function MoreNavMenuPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] p-4 sm:p-5 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 min-w-[260px] sm:min-w-[540px]">
        {MORE_NAV_SECTIONS.map((s) => (
          <div key={s.titleKey}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2.5">{t(s.titleKey)}</div>
            <nav className="flex flex-col gap-0.5">
              {s.links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-gray-800 hover:text-[#C4161C] py-1.5 rounded px-1 -mx-1 hover:bg-gray-50 transition-colors"
                >
                  {t(l.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
