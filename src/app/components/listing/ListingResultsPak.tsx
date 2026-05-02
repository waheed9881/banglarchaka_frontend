import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import {
  Check,
  Heart,
  Link2,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import { Link } from 'react-router';
import { getAuthToken } from '@/lib/api';
import { addToWishlist, removeFromWishlist } from '@/lib/engagement';
import {
  formatMoney,
  listingPublicHref,
  resolveMediaUrl,
  type BrandDto,
  type ListingDto,
} from '@/lib/marketplace';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const FALLBACK =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=640&q=80';

export function mergeListingParams(
  locationSearch: string,
  updates: Record<string, string | null | undefined>,
): URLSearchParams {
  const next = new URLSearchParams(locationSearch);
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null || v === '') next.delete(k);
    else next.set(k, v);
  }
  next.delete('page');
  return next;
}

export function formatListingUpdated(car: ListingDto): string {
  const raw = car.updated_at || car.created_at;
  if (!raw) return 'Recently updated';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return 'Recently updated';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Updated just now';
  if (mins < 60) return `Updated ${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Updated ${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 14) return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  return `Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function listingSpecsLine(car: ListingDto): string {
  const parts: string[] = [];
  if (car.vehicle_year != null) parts.push(String(car.vehicle_year));
  if (car.mileage_km != null && Number.isFinite(Number(car.mileage_km))) {
    parts.push(`${Number(car.mileage_km).toLocaleString()} km`);
  }
  if (car.fuel_type) {
    const f = car.fuel_type;
    parts.push(f.charAt(0).toUpperCase() + f.slice(1));
  }
  const dyn = car.dynamic_attributes;
  if (dyn && typeof dyn === 'object') {
    const cc = (dyn as Record<string, unknown>).engine_cc ?? (dyn as Record<string, unknown>).cc;
    if (cc != null && String(cc).trim() !== '') parts.push(`${cc} cc`);
    else if (typeof (dyn as Record<string, unknown>).engine === 'string') {
      parts.push(String((dyn as Record<string, unknown>).engine));
    }
  }
  if (car.transmission) {
    const t = car.transmission;
    parts.push(t.charAt(0).toUpperCase() + t.slice(1));
  }
  return parts.join(' | ');
}

export function formatPriceBanglaShort(car: ListingDto): string {
  const n = Number(car.price);
  if (!Number.isFinite(n)) return formatMoney(car.price, car.currency);
  const lac = n / 100000;
  if (lac >= 0.1 && lac < 1000) {
    const rounded = lac >= 10 ? lac.toFixed(1) : lac.toFixed(2);
    return `৳ ${rounded} lac${Number(rounded) !== 1 ? 's' : ''}`;
  }
  return formatMoney(car.price, car.currency);
}

type SidebarPakProps = {
  locationSearch: string;
  setSearchParams: (next: URLSearchParams, opts?: { replace?: boolean }) => void;
  brands: BrandDto[];
  city: string;
  setCity: (v: string) => void;
  brandId: string;
  setBrandId: (v: string) => void;
  keyword: string;
  setKeyword: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  minYear: string;
  setMinYear: (v: string) => void;
  maxYear: string;
  setMaxYear: (v: string) => void;
  fuelType: string;
  setFuelType: (v: string) => void;
  transmission: string;
  setTransmission: (v: string) => void;
  condition: string;
  setCondition: (v: string) => void;
  verifiedDealerOnly: boolean;
  setVerifiedDealerOnly: (v: boolean) => void;
  dealerOnly: boolean;
  setDealerOnly: (v: boolean) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (v: boolean) => void;
  commitFiltersToUrl: () => void;
  clearFiltersToUrl: () => void;
};

const CITY_CHIPS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur', 'Cumilla', 'Barishal'];
const COLOR_CHIPS = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Green'];
const BODY_CHIPS: Array<{ label: string; q: string }> = [
  { label: 'Sedan', q: 'sedan' },
  { label: 'Hatchback', q: 'hatchback' },
  { label: 'SUV', q: 'SUV' },
  { label: 'Crossover', q: 'crossover' },
];

export function PakFiltersSidebar({
  locationSearch,
  setSearchParams,
  brands,
  city,
  setCity,
  brandId,
  setBrandId,
  keyword,
  setKeyword,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minYear,
  setMinYear,
  maxYear,
  setMaxYear,
  fuelType,
  setFuelType,
  transmission,
  setTransmission,
  condition,
  setCondition,
  verifiedDealerOnly,
  setVerifiedDealerOnly,
  dealerOnly,
  setDealerOnly,
  featuredOnly,
  setFeaturedOnly,
  commitFiltersToUrl,
  clearFiltersToUrl,
}: SidebarPakProps) {
  const applyChip = (updates: Record<string, string | null | undefined>) => {
    setSearchParams(mergeListingParams(locationSearch, updates), { replace: true });
  };

  const chipActive = (key: string, val: string) => new URLSearchParams(locationSearch).get(key) === val;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-24">
      <div className="border-b border-gray-100 px-4 py-3 bg-[#f8f9fa]">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-gray-800">Show results by</h3>
      </div>
      <div className="p-4 pb-28 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto lg:pb-4">
        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Search keyword</div>
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitFiltersToUrl()}
              placeholder="Make, model…"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm text-gray-900"
            />
            <button
              type="button"
              onClick={() => commitFiltersToUrl()}
              className="shrink-0 rounded bg-[#233D7B] text-white p-2 hover:bg-[#1a2d5a]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">City</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyChip({ city: null })}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                !city ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              All
            </button>
            {CITY_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => applyChip({ city: c })}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                  chipActive('city', c) ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Other city"
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Make</div>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All makes</option>
            {brands.map((b) => (
              <option value={String(b.id)} key={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Price (BDT)</div>
          <div className="flex gap-2 items-center">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="From"
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="To"
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              type="button"
              onClick={() => commitFiltersToUrl()}
              className="shrink-0 rounded bg-[#233D7B] text-white px-3 py-2 text-xs font-bold hover:bg-[#1a2d5a]"
            >
              Go
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Year</div>
          <div className="flex gap-2 items-center">
            <input
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              placeholder="From"
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
              placeholder="To"
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              type="button"
              onClick={() => commitFiltersToUrl()}
              className="shrink-0 rounded bg-[#233D7B] text-white px-3 py-2 text-xs font-bold hover:bg-[#1a2d5a]"
            >
              Go
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Transmission</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Any', v: '' },
              { label: 'Automatic', v: 'automatic' },
              { label: 'Manual', v: 'manual' },
            ].map(({ label, v }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setTransmission(v);
                  applyChip({ transmission: v || null });
                }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                  (v === '' && !transmission) || transmission === v
                    ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Fuel type</div>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Any</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Colour (keyword)</div>
          <div className="flex flex-wrap gap-2">
            {COLOR_CHIPS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => applyChip({ q: col.toLowerCase() })}
                className="rounded-full px-2 py-1 text-[11px] font-medium border border-gray-200 text-gray-700 hover:border-[#233D7B]"
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Body type (keyword)</div>
          <div className="flex flex-wrap gap-2">
            {BODY_CHIPS.map(({ label, q }) => (
              <button
                key={label}
                type="button"
                onClick={() => applyChip({ q })}
                className="rounded-full px-2 py-1 text-[11px] font-medium border border-gray-200 text-gray-700 hover:border-[#233D7B]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Condition</div>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Any</option>
            <option value="used">Used</option>
            <option value="reconditioned">Reconditioned</option>
            <option value="new">New</option>
          </select>
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={verifiedDealerOnly}
              onChange={(e) => setVerifiedDealerOnly(e.target.checked)}
            />
            Verified dealers only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={dealerOnly} onChange={(e) => setDealerOnly(e.target.checked)} />
            Dealer listings only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
            Featured ads only
          </label>
        </div>

        <button
          type="button"
          onClick={() => commitFiltersToUrl()}
          className="w-full bg-[#3EB549] text-white py-2.5 rounded font-bold hover:bg-[#36a340] transition shadow-sm"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={() => clearFiltersToUrl()}
          className="w-full border border-gray-300 text-gray-800 py-2.5 rounded font-semibold hover:bg-gray-50 transition"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

type RowPakProps = {
  car: ListingDto;
  wishlistedIds: Set<string>;
  setWishlistedIds: Dispatch<SetStateAction<Set<string>>>;
  copiedListingId: string | null;
  copyListingUrl: (car: ListingDto, e: MouseEvent) => void;
  phoneRevealId: string | null;
  setPhoneRevealId: Dispatch<SetStateAction<string | null>>;
};

export function PakListingRow({
  car,
  wishlistedIds,
  setWishlistedIds,
  copiedListingId,
  copyListingUrl,
  phoneRevealId,
  setPhoneRevealId,
}: RowPakProps) {
  const href = listingPublicHref(car);
  const phone = car.seller?.phone?.trim();
  const showPhone = phoneRevealId === car.id;

  return (
    <article className="flex flex-col sm:flex-row gap-0 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition overflow-hidden">
      <Link
        to={href}
        className="relative shrink-0 w-full sm:w-[200px] md:w-[220px] h-44 sm:h-auto sm:min-h-[140px] bg-gray-100 block"
      >
        <ImageWithFallback
          src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK}
          alt=""
          className="h-full w-full object-cover sm:absolute sm:inset-0"
          loading="lazy"
        />
        {car.featured ? (
          <span className="absolute top-2 left-2 bg-[#C4161C] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
            Featured
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col md:flex-row md:justify-between gap-3 p-4 min-w-0">
        <div className="min-w-0 flex-1">
          <Link to={href} className="text-[17px] font-bold text-[#1565C0] hover:underline leading-snug line-clamp-2">
            {car.title}
          </Link>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {car.location_city || 'Bangladesh'}
          </div>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">{listingSpecsLine(car)}</p>
          <p className="text-xs text-gray-500 mt-3">{formatListingUpdated(car)}</p>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between gap-3 shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 md:pl-4 md:border-l md:border-gray-100">
          <div className="text-xl font-bold text-gray-900 tabular-nums">{formatPriceBanglaShort(car)}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-gray-200 bg-white p-2 hover:bg-gray-50"
              onClick={(e) => copyListingUrl(car, e)}
              aria-label={copiedListingId === car.id ? 'Copied' : 'Copy link'}
            >
              {copiedListingId === car.id ? (
                <Check className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
              ) : (
                <Link2 className="h-5 w-5 text-gray-600" strokeWidth={2} />
              )}
            </button>
            <button
              type="button"
              className="rounded border border-gray-200 bg-white p-2 hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                if (!getAuthToken()) {
                  window.alert('Please sign in to save favourites.');
                  return;
                }
                const saved = wishlistedIds.has(car.id);
                (saved ? removeFromWishlist(car.id) : addToWishlist(car.id))
                  .then(() =>
                    setWishlistedIds((prev) => {
                      const next = new Set(prev);
                      if (saved) next.delete(car.id);
                      else next.add(car.id);
                      return next;
                    }),
                  )
                  .catch((err) => window.alert(err instanceof Error ? err.message : 'Wishlist failed'));
              }}
              aria-label="Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${wishlistedIds.has(car.id) ? 'text-[#C4161C] fill-current' : 'text-gray-600'}`}
              />
            </button>
            {phone ? (
              <button
                type="button"
                onClick={() => setPhoneRevealId((prev) => (prev === car.id ? null : car.id))}
                className="inline-flex items-center gap-2 rounded bg-[#3EB549] text-white px-4 py-2 text-sm font-bold hover:bg-[#36a340] transition whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                {showPhone ? phone : 'Show phone no.'}
              </button>
            ) : (
              <span className="text-xs text-gray-400 whitespace-nowrap">No phone on file</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function UsedCarsListingFooter() {
  const cols = [
    {
      title: 'By city',
      links: ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna'].map((c) => ({
        label: `Cars in ${c}`,
        to: `/listings?type=used_car&city=${encodeURIComponent(c)}`,
      })),
    },
    {
      title: 'By make',
      links: ['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'Nissan'].map((m) => ({
        label: `Used ${m}`,
        to: `/listings?type=used_car&q=${encodeURIComponent(m)}`,
      })),
    },
    {
      title: 'By budget',
      links: [
        { label: 'Under ৳5 lac', to: '/listings?type=used_car&max_price=500000' },
        { label: '৳5L – ৳15L', to: '/listings?type=used_car&min_price=500000&max_price=1500000' },
        { label: '৳15L – ৳40L', to: '/listings?type=used_car&min_price=1500000&max_price=4000000' },
        { label: 'Featured cars', to: '/listings?type=used_car&featured=1' },
      ],
    },
  ];

  return (
    <div className="mt-12 space-y-10 border-t border-gray-200 pt-10">
      <div className="rounded-xl border border-[#233D7B]/15 bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Post an ad for free</h3>
          <p className="text-gray-600 mt-1 text-sm">Reach buyers across Bangladesh with photos and price in BDT.</p>
        </div>
        <Link
          to="/used-cars/sell"
          className="inline-flex justify-center rounded-lg bg-[#3EB549] px-8 py-3 text-white font-bold hover:bg-[#36a340] transition shadow-md shrink-0"
        >
          Sell your car
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Used cars in Bangladesh</h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
          Browse verified-style dealer listings where available, compare specs side-by-side, and contact sellers after you
          review the full ad. Always inspect the vehicle and paperwork before paying — BanglarChaka is a discovery and
          contact platform.
        </p>
      </div>

      <div className="rounded-xl bg-[#eef5fb] border border-blue-100 px-4 py-8">
        <h3 className="text-center text-lg font-bold text-[#233D7B] mb-6">Browse more used cars</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-[#1565C0] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-4 text-center text-sm text-gray-700">
        <strong className="text-[#233D7B]">Notify me:</strong> Save a search from the filters above — bookmark this page
        with your criteria or use <Link to="/login" className="underline font-semibold">sign-in</Link> for messages &
        wishlist.
      </div>
    </div>
  );
}
