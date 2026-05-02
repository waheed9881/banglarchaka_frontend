import {
  Building2,
  Car,
  GitCompare,
  MessageSquare,
  Route,
  Search,
  Tag,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

function MegaLink({
  title,
  desc,
  to,
  icon,
}: {
  title: string;
  desc: string;
  to: string;
  icon: ReactNode;
}) {
  return (
    <Link to={to} className="flex gap-3 rounded-md px-2 py-2 -mx-2 hover:bg-gray-50 transition group/item">
      <span className="mt-0.5 shrink-0 text-[#C4161C] opacity-90 group-hover/item:opacity-100">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900 leading-snug">{title}</span>
        <span className="block text-xs text-gray-500 mt-0.5 leading-snug">{desc}</span>
      </span>
    </Link>
  );
}

function BrandLink({ label, q }: { label: string; q: string }) {
  const qs = new URLSearchParams({ type: 'new_car', q });
  return (
    <Link to={`/listings?${qs.toString()}`} className="block text-sm text-gray-700 hover:text-[#C4161C] py-1.5 transition">
      {label}
    </Link>
  );
}

function NewModelLink({ label, q }: { label: string; q: string }) {
  const qs = new URLSearchParams({ type: 'new_car', q });
  return (
    <Link to={`/listings?${qs.toString()}`} className="block text-sm text-gray-700 hover:text-[#C4161C] py-1.5 transition">
      {label}
    </Link>
  );
}

const POPULAR_BRANDS: Array<{ label: string; q: string }> = [
  { label: 'Suzuki Cars', q: 'Suzuki' },
  { label: 'Toyota Cars', q: 'Toyota' },
  { label: 'Honda Cars', q: 'Honda' },
  { label: 'Kia Cars', q: 'Kia' },
  { label: 'Hyundai Cars', q: 'Hyundai' },
  { label: 'Changan Cars', q: 'Changan' },
  { label: 'MG Cars', q: 'MG' },
  { label: 'BMW Cars', q: 'BMW' },
  { label: 'Audi Cars', q: 'Audi' },
];

const POPULAR_NEW_MODELS: Array<{ label: string; q: string }> = [
  { label: 'Honda Civic', q: 'Honda Civic' },
  { label: 'Suzuki Alto', q: 'Suzuki Alto' },
  { label: 'Suzuki Cultus', q: 'Suzuki Cultus' },
  { label: 'Honda City', q: 'Honda City' },
  { label: 'Toyota Corolla', q: 'Toyota Corolla' },
  { label: 'Toyota Yaris', q: 'Toyota Yaris' },
  { label: 'Changan Alsvin', q: 'Changan Alsvin' },
  { label: 'Suzuki Wagon R', q: 'Wagon R' },
  { label: 'Kia Sportage', q: 'Kia Sportage' },
];

export const NEW_CARS_MOBILE_LINKS: Array<{ labelKey: string; to: string }> = [
  { labelKey: 'nav.mobileNewCarsFindNew', to: '/new-cars' },
  { labelKey: 'nav.mobileNewCarsCompare', to: '/compare' },
  { labelKey: 'nav.mobileNewCarsReviews', to: '/car-reviews' },
  { labelKey: 'nav.mobileNewCarsPrices', to: '/car-prices' },
  { labelKey: 'nav.mobileNewCarsOnRoad', to: '/car-prices' },
  { labelKey: 'nav.mobileNewCarsDealers', to: '/listings?type=new_car&dealer_only=1' },
];

export function NewCarsMegaMenuPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={`max-w-full rounded-tl-none rounded-tr-lg rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] ${className}`}
    >
      <div className="border-b border-gray-200 px-4 py-2.5 bg-white">
        <p className="inline-block max-w-xl rounded-sm border border-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          {t('mega.newCars.banner')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-5 space-y-1">
          <MegaLink
            title={t('mega.newCars.findTitle')}
            desc={t('mega.newCars.findDesc')}
            to="/new-cars"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.newCars.compareTitle')}
            desc={t('mega.newCars.compareDesc')}
            to="/compare"
            icon={<GitCompare className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.newCars.reviewsTitle')}
            desc={t('mega.newCars.reviewsDesc')}
            to="/car-reviews"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.newCars.pricesTitle')}
            desc={t('mega.newCars.pricesDesc')}
            to="/car-prices"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.newCars.onRoadTitle')}
            desc={t('mega.newCars.onRoadDesc')}
            to="/car-prices"
            icon={<Route className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.newCars.dealersTitle')}
            desc={t('mega.newCars.dealersDesc')}
            to="/listings?type=new_car&dealer_only=1"
            icon={<Building2 className="w-5 h-5" />}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Car className="w-4 h-4 text-[#C4161C]" />
            {t('mega.newCars.popularBrands')}
          </div>
          <nav className="flex flex-col">
            {POPULAR_BRANDS.map((b) => (
              <BrandLink key={b.label} label={b.label} q={b.q} />
            ))}
          </nav>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Car className="w-4 h-4 text-[#C4161C]" />
            {t('mega.newCars.popularNewCars')}
          </div>
          <nav className="flex flex-col">
            {POPULAR_NEW_MODELS.map((m) => (
              <NewModelLink key={m.label} label={m.label} q={m.q} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
