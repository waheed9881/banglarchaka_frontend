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

/** Tooltip + mobile subtitle */
export const NEW_CARS_NAV_TOOLTIP =
  'Research new cars in Bangladesh — prices, reviews and comparisons';

/** Links shown under expandable “New Cars” on mobile */
export const NEW_CARS_MOBILE_LINKS: Array<{ label: string; to: string }> = [
  { label: 'Find new cars', to: '/listings?type=new_car' },
  { label: 'Car comparisons', to: '/compare' },
  { label: 'Reviews', to: '/car-reviews' },
  { label: 'Prices', to: '/car-prices' },
  { label: 'On-road price guide', to: '/car-prices' },
  { label: 'New car dealers', to: '/listings?type=new_car&dealer_only=1' },
];

export function NewCarsMegaMenuPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-tl-none rounded-tr-lg rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] ${className}`}
    >
      <div className="border-b border-gray-200 px-4 py-2.5 bg-white">
        <p className="inline-block max-w-xl rounded-sm border border-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          {NEW_CARS_NAV_TOOLTIP}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-5 space-y-1">
          <MegaLink
            title="Find New Cars"
            desc="Browse new car listings on BanglarChaka"
            to="/listings?type=new_car"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title="Car Comparisons"
            desc="Compare cars and spot trim differences"
            to="/compare"
            icon={<GitCompare className="w-5 h-5" />}
          />
          <MegaLink
            title="Reviews"
            desc="Read reviews and buying angles by model"
            to="/car-reviews"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <MegaLink
            title="Prices"
            desc="See asking prices for new listings"
            to="/car-prices"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title="On road price"
            desc="Use pricing guides before you budget"
            to="/car-prices"
            icon={<Route className="w-5 h-5" />}
          />
          <MegaLink
            title="New Car Dealers"
            desc="Find dealers posting new inventory"
            to="/listings?type=new_car&dealer_only=1"
            icon={<Building2 className="w-5 h-5" />}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Car className="w-4 h-4 text-[#C4161C]" />
            Popular brands
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
            Popular new cars
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
