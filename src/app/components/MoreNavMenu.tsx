import { Link } from 'react-router';

export const MORE_NAV_SECTIONS: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'Tools',
    links: [
      { label: 'Compare cars', to: '/compare' },
      { label: 'Car prices', to: '/car-prices' },
      { label: 'Car reviews', to: '/car-reviews' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
  {
    title: 'Bikes & store',
    links: [
      { label: 'New bikes', to: '/new-bikes' },
      { label: 'Bike prices', to: '/bike-prices' },
      { label: 'Bike reviews', to: '/bike-reviews' },
      { label: 'Accessories', to: '/accessories' },
      { label: 'Wheels & tyres', to: '/wheels-tyres' },
      { label: 'Engine parts', to: '/engine-parts' },
      { label: 'Car care', to: '/car-care' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & conditions', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
    ],
  },
];

export function MoreNavMenuPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] p-4 sm:p-5 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 min-w-[260px] sm:min-w-[540px]">
        {MORE_NAV_SECTIONS.map((s) => (
          <div key={s.title}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2.5">{s.title}</div>
            <nav className="flex flex-col gap-0.5">
              {s.links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-gray-800 hover:text-[#C4161C] py-1.5 rounded px-1 -mx-1 hover:bg-gray-50 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}

