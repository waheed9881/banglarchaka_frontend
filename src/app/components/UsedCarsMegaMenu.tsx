import {
  BookOpen,
  Car,
  FileCheck,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Target,
  ThumbsUp,
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

function CityLink({ city }: { city: string }) {
  const qs = new URLSearchParams({ type: 'used_car', city });
  return (
    <Link
      to={`/listings?${qs.toString()}`}
      className="block text-sm text-gray-700 hover:text-[#C4161C] py-1.5 transition"
    >
      {city}
    </Link>
  );
}

function ModelLink({ label, q }: { label: string; q: string }) {
  const qs = new URLSearchParams({ type: 'used_car', q });
  return (
    <Link
      to={`/listings?${qs.toString()}`}
      className="block text-sm text-gray-700 hover:text-[#C4161C] py-1.5 transition"
    >
      {label}
    </Link>
  );
}

const POPULAR_CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Gazipur'];

const POPULAR_MODELS: Array<{ label: string; q: string }> = [
  { label: 'Toyota Corolla', q: 'Toyota Corolla' },
  { label: 'Honda Civic', q: 'Honda Civic' },
  { label: 'Honda City', q: 'Honda City' },
  { label: 'Suzuki Swift', q: 'Suzuki Swift' },
  { label: 'Toyota Axio', q: 'Toyota Axio' },
  { label: 'Toyota Noah', q: 'Toyota Noah' },
  { label: 'Suzuki Alto', q: 'Suzuki Alto' },
  { label: 'Mitsubishi Pajero', q: 'Mitsubishi Pajero' },
];

export function UsedCarsMegaMenuPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-tl-none rounded-tr-lg rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        <div className="p-5 space-y-1">
          <MegaLink
            title={t('mega.usedCars.findTitle')}
            desc={t('mega.usedCars.findDesc')}
            to="/listings?type=used_car"
            icon={<Search className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.featuredTitle')}
            desc={t('mega.usedCars.featuredDesc')}
            to="/used-cars/featured"
            icon={<Star className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.sellTitle')}
            desc={t('mega.usedCars.sellDesc')}
            to="/used-cars/sell"
            icon={<Tag className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.dealersTitle')}
            desc={t('mega.usedCars.dealersDesc')}
            to="/used-car-dealers"
            icon={<BookOpen className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.pricesTitle')}
            desc={t('mega.usedCars.pricesDesc')}
            to="/car-prices"
            icon={<Target className="w-5 h-5" />}
          />
        </div>

        <div className="p-5 space-y-1">
          <MegaLink
            title={t('mega.usedCars.certifiedTitle')}
            desc={t('mega.usedCars.certifiedDesc')}
            to="/services/certified-cars"
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.inspectionTitle')}
            desc={t('mega.usedCars.inspectionDesc')}
            to="/services/car-inspection"
            icon={<ThumbsUp className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.sellForMeTitle')}
            desc={t('mega.usedCars.sellForMeDesc')}
            to="/services/sell-it-for-me"
            icon={<ThumbsUp className="w-5 h-5" />}
          />
          <MegaLink
            title={t('mega.usedCars.auctionTitle')}
            desc={t('mega.usedCars.auctionDesc')}
            to="/services/auction-sheet-verification"
            icon={<FileCheck className="w-5 h-5" />}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <MapPin className="w-4 h-4 text-[#C4161C]" />
            {t('mega.usedCars.popularCities')}
          </div>
          <nav className="flex flex-col">{POPULAR_CITIES.map((c) => <CityLink key={c} city={c} />)}</nav>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Car className="w-4 h-4 text-[#C4161C]" />
            {t('mega.usedCars.popularModels')}
          </div>
          <nav className="flex flex-col">
            {POPULAR_MODELS.map((m) => (
              <ModelLink key={m.label} label={m.label} q={m.q} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
