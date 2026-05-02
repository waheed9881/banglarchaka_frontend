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
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { POPULAR_NEW_BIKES, POPULAR_USED_BIKES } from '@/app/data/usedBikesBrowse';

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

export const BIKES_MOBILE_LINKS: Array<{ labelKey: string; to: string }> = [
  { labelKey: 'nav.mobileBikesFindUsed', to: '/used-bikes' },
  { labelKey: 'nav.mobileBikesListings', to: '/used-bikes' },
  { labelKey: 'nav.mobileBikesFeatured', to: '/listings?type=used_bike&featured=1' },
  { labelKey: 'nav.mobileBikesSell', to: '/used-bikes/sell' },
  { labelKey: 'nav.mobileBikesDealersUsed', to: '/listings?type=used_bike&dealer_only=1' },
  { labelKey: 'nav.mobileBikesFindNew', to: '/listings?type=new_bike' },
  { labelKey: 'nav.mobileBikesCompare', to: '/compare' },
  { labelKey: 'nav.mobileBikesReviews', to: '/bike-reviews' },
  { labelKey: 'nav.mobileBikesPricesNew', to: '/bike-prices' },
  { labelKey: 'nav.mobileBikesDealersNew', to: '/listings?type=new_bike&dealer_only=1' },
];

export function BikesMegaMenuPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={`max-w-full rounded-tl-none rounded-tr-lg rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] ${className}`}
    >
      <div className="border-b border-gray-200 px-4 py-2.5 bg-white">
        <p className="inline-block max-w-xl rounded-sm border border-gray-900 px-2.5 py-1.5 text-[11px] leading-snug text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          {t('mega.bikes.banner')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-gray-100">
        <div className="p-5 space-y-1">
          <MegaLink
            title={t('mega.bikes.findUsedTitle')}
            desc={t('mega.bikes.findUsedDesc')}
            to="/used-bikes"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.listingsTitle')}
            desc={t('mega.bikes.listingsDesc')}
            to="/used-bikes"
            icon={<Bike className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.featuredTitle')}
            desc={t('mega.bikes.featuredDesc')}
            to="/listings?type=used_bike&featured=1"
            icon={<Star className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.sellTitle')}
            desc={t('mega.bikes.sellDesc')}
            to="/used-bikes/sell"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.usedDealersTitle')}
            desc={t('mega.bikes.usedDealersDesc')}
            to="/listings?type=used_bike&dealer_only=1"
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>

        <div className="p-5 space-y-1">
          <MegaLink
            title={t('mega.bikes.findNewTitle')}
            desc={t('mega.bikes.findNewDesc')}
            to="/listings?type=new_bike"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.compareTitle')}
            desc={t('mega.bikes.compareDesc')}
            to="/compare"
            icon={<GitCompare className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.reviewsTitle')}
            desc={t('mega.bikes.reviewsDesc')}
            to="/bike-reviews"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.newPricesTitle')}
            desc={t('mega.bikes.newPricesDesc')}
            to="/bike-prices"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.bikes.newDealersTitle')}
            desc={t('mega.bikes.newDealersDesc')}
            to="/listings?type=new_bike&dealer_only=1"
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Bike className="w-4 h-4 text-[#C4161C]" />
            {t('mega.bikes.popularNewBikes')}
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
            {t('mega.bikes.popularUsedBikes')}
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
