import {
  Bike,
  BookOpen,
  GitCompare,
  MessageSquare,
  Search,
  Star,
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

function BikeModelLink({ listingType, label, q }: { listingType: 'used_bike' | 'new_bike'; label: string; q: string }) {
  const qs = new URLSearchParams({ type: listingType, q });
  return (
    <Link to={`/listings?${qs.toString()}`} className="block text-sm text-gray-700 hover:text-[#C4161C] py-1.5 transition">
      {label}
    </Link>
  );
}

export const BIKES_NAV_TOOLTIP = 'Bikes for sale in Bangladesh.';

export const BIKES_MOBILE_LINKS: Array<{ label: string; to: string }> = [
  { label: 'Find used bikes', to: '/listings?type=used_bike' },
  { label: 'Used bikes listings', to: '/listings?type=used_bike' },
  { label: 'Featured used bikes', to: '/listings?type=used_bike&featured=1' },
  { label: 'Sell your bike', to: '/used-bikes/sell' },
  { label: 'Used bike dealers', to: '/listings?type=used_bike&dealer_only=1' },
  { label: 'Find new bikes', to: '/listings?type=new_bike' },
  { label: 'Bike comparisons', to: '/compare' },
  { label: 'Bike reviews', to: '/bike-reviews' },
  { label: 'New bike prices', to: '/bike-prices' },
  { label: 'New bike dealers', to: '/listings?type=new_bike&dealer_only=1' },
];

const POPULAR_NEW_BIKES: Array<{ label: string; q: string }> = [
  { label: 'Honda CG 125', q: 'Honda CG 125' },
  { label: 'Yamaha YBR 125', q: 'Yamaha YBR 125' },
  { label: 'Honda CD 70', q: 'Honda CD 70' },
  { label: 'Suzuki GD 110S', q: 'Suzuki GD 110S' },
  { label: 'Suzuki GS 150', q: 'Suzuki GS 150' },
  { label: 'Honda Pridor', q: 'Honda Pridor' },
  { label: 'Yamaha YBR 125G', q: 'Yamaha YBR 125G' },
  { label: 'Honda CB 150F', q: 'Honda CB 150F' },
];

const POPULAR_USED_BIKES: Array<{ label: string; q: string }> = [
  { label: 'Honda CG 125', q: 'Honda CG 125' },
  { label: 'Honda CD 70', q: 'Honda CD 70' },
  { label: 'Yamaha YBR 125', q: 'Yamaha YBR 125' },
  { label: 'Suzuki GS 150', q: 'Suzuki GS 150' },
  { label: 'Honda CB 125F', q: 'Honda CB 125F' },
  { label: 'Yamaha YBR 125G', q: 'Yamaha YBR 125G' },
  { label: 'Honda Pridor', q: 'Honda Pridor' },
  { label: 'Hi Speed Infinity 150', q: 'Hi Speed Infinity 150' },
];

export function BikesMegaMenuPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-tl-none rounded-tr-lg rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] ${className}`}
    >
      <div className="border-b border-gray-200 px-4 py-2.5 bg-white">
        <p className="inline-block max-w-xl rounded-sm border border-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          {BIKES_NAV_TOOLTIP}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-gray-100">
        <div className="p-5 space-y-1">
          <MegaLink
            title="Find Used Bikes"
            desc="Find your next bike from live listings"
            to="/listings?type=used_bike"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title="Used Bikes Listings"
            desc="Search thousands of used bike ads"
            to="/listings?type=used_bike"
            icon={<Bike className="w-5 h-5" />}
          />
          <MegaLink
            title="Featured Used Bikes"
            desc="Boosted picks from sellers"
            to="/listings?type=used_bike&featured=1"
            icon={<Star className="w-5 h-5" />}
          />
          <MegaLink
            title="Sell Your Bike"
            desc="Post a free ad and sell quickly"
            to="/used-bikes/sell"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title="Used Bike Dealers"
            desc="Browse dealer-posted used bikes"
            to="/listings?type=used_bike&dealer_only=1"
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>

        <div className="p-5 space-y-1">
          <MegaLink
            title="Find New Bikes"
            desc="See new bike listings on BanglarChaka"
            to="/listings?type=new_bike"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title="Bike Comparisons"
            desc="Compare bikes and spot differences"
            to="/compare"
            icon={<GitCompare className="w-5 h-5" />}
          />
          <MegaLink
            title="Bike Reviews"
            desc="Read rider and expert reviews"
            to="/bike-reviews"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <MegaLink
            title="New Bikes Prices"
            desc="Check pricing trends for new bikes"
            to="/bike-prices"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title="New Bike Dealers"
            desc="Find dealers listing new bikes"
            to="/listings?type=new_bike&dealer_only=1"
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Bike className="w-4 h-4 text-[#C4161C]" />
            Popular new bikes
          </div>
          <nav className="flex flex-col">
            {POPULAR_NEW_BIKES.map((m) => (
              <BikeModelLink key={`new-${m.label}`} listingType="new_bike" label={m.label} q={m.q} />
            ))}
          </nav>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Bike className="w-4 h-4 text-[#C4161C]" />
            Popular used bikes
          </div>
          <nav className="flex flex-col">
            {POPULAR_USED_BIKES.map((m) => (
              <BikeModelLink key={`used-${m.label}`} listingType="used_bike" label={m.label} q={m.q} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
