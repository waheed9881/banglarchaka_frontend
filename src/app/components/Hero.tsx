import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';

type ListingType = 'used_car' | 'new_car' | 'used_bike' | 'auto_part';

type SavedSearch = {
  label: string;
  query: string;
};

type SearchPatch = Partial<{
  listingType: ListingType;
  brandId: string;
  city: string;
  keyword: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  fuelType: string;
  transmission: string;
  condition: string;
  verifiedDealerOnly: boolean;
  dealerOnly: boolean;
}>;

const BD_CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Gazipur',
  'Cumilla',
  'Mymensingh',
  'Jessore',
  'Narayanganj',
];

function buildListingParams(s: {
  listingType: ListingType;
  brandId: string;
  city: string;
  keyword: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  fuelType: string;
  transmission: string;
  condition: string;
  verifiedDealerOnly: boolean;
  dealerOnly: boolean;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set('type', s.listingType);
  if (s.brandId) params.set('brand_id', s.brandId);
  if (s.city) params.set('city', s.city);
  if (s.keyword.trim()) params.set('q', s.keyword.trim());
  if (s.minPrice) params.set('min_price', s.minPrice);
  if (s.maxPrice) params.set('max_price', s.maxPrice);
  if (s.minYear) params.set('min_year', s.minYear);
  if (s.maxYear) params.set('max_year', s.maxYear);
  if (s.fuelType) params.set('fuel_type', s.fuelType);
  if (s.transmission) params.set('transmission', s.transmission);
  if (s.condition) params.set('condition', s.condition);
  if (s.verifiedDealerOnly) params.set('verified_dealer_only', '1');
  if (s.dealerOnly) params.set('dealer_only', '1');
  return params;
}

export function Hero() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [type, setType] = useState<ListingType>('used_car');
  const [brandId, setBrandId] = useState('');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [condition, setCondition] = useState('');
  const [verifiedDealerOnly, setVerifiedDealerOnly] = useState(false);
  const [dealerOnly, setDealerOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    fetchBrands()
      .then((rows) => setBrands(rows))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hero_saved_searches');
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedSearch[];
      if (Array.isArray(parsed)) setSavedSearches(parsed.slice(0, 5));
    } catch {
      setSavedSearches([]);
    }
  }, []);

  const snapshot = (patch: SearchPatch = {}) => ({
    listingType: patch.listingType ?? type,
    brandId: patch.brandId ?? brandId,
    city: patch.city ?? city,
    keyword: patch.keyword ?? keyword,
    minPrice: patch.minPrice ?? minPrice,
    maxPrice: patch.maxPrice ?? maxPrice,
    minYear: patch.minYear ?? minYear,
    maxYear: patch.maxYear ?? maxYear,
    fuelType: patch.fuelType ?? fuelType,
    transmission: patch.transmission ?? transmission,
    condition: patch.condition ?? condition,
    verifiedDealerOnly: patch.verifiedDealerOnly ?? verifiedDealerOnly,
    dealerOnly: patch.dealerOnly ?? dealerOnly,
  });

  /** Push filters to URL and keep Hero state in sync (avoids stale chip/tab clicks). */
  const submitSearch = (patch: SearchPatch = {}) => {
    const s = snapshot(patch);
    const params = buildListingParams(s);
    navigate(`/listings?${params.toString()}`);
    setType(s.listingType);
    setBrandId(s.brandId);
    setCity(s.city);
    setKeyword(s.keyword);
    setMinPrice(s.minPrice);
    setMaxPrice(s.maxPrice);
    setMinYear(s.minYear);
    setMaxYear(s.maxYear);
    setFuelType(s.fuelType);
    setTransmission(s.transmission);
    setCondition(s.condition);
    setVerifiedDealerOnly(s.verifiedDealerOnly);
    setDealerOnly(s.dealerOnly);
  };

  const saveCurrentSearch = () => {
    const params = buildListingParams(snapshot()).toString();
    if (!params.includes('type=')) return;
    const s = snapshot();
    const label = `${s.listingType.replace(/_/g, ' ')}${s.city ? ` · ${s.city}` : ''}${s.keyword ? ` · ${s.keyword}` : ''}`;
    const next = [{ label, query: params }, ...savedSearches.filter((x) => x.query !== params)].slice(0, 5);
    setSavedSearches(next);
    localStorage.setItem('hero_saved_searches', JSON.stringify(next));
  };

  const clearFilters = () => {
    setBrandId('');
    setCity('');
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setFuelType('');
    setTransmission('');
    setCondition('');
    setVerifiedDealerOnly(false);
    setDealerOnly(false);
    navigate(`/listings?type=${type}`);
  };

  const quickChips: Array<{ label: string; patch: SearchPatch }> = [
    { label: 'Used Cars', patch: { listingType: 'used_car' } },
    { label: 'New Cars', patch: { listingType: 'new_car' } },
    { label: 'Bikes', patch: { listingType: 'used_bike' } },
    { label: 'Auto Parts', patch: { listingType: 'auto_part' } },
    { label: 'Hybrid', patch: { fuelType: 'hybrid' } },
    { label: 'Automatic', patch: { transmission: 'automatic' } },
    { label: 'Manual', patch: { transmission: 'manual' } },
    { label: 'Used', patch: { condition: 'used' } },
  ];

  return (
    <div className="relative bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.5px' }}>
            Find Used Cars in Bangladesh
          </h2>
          <p className="text-base text-blue-100">With thousands of cars, we have just the right one for you</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-5 text-gray-900">
            <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
              {(
                [
                  ['Used Cars', 'used_car'],
                  ['New Cars', 'new_car'],
                  ['Bikes', 'used_bike'],
                  ['Auto Parts', 'auto_part'],
                ] as const
              ).map(([label, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => submitSearch({ listingType: value })}
                  className={`px-5 py-2.5 rounded-t-md font-semibold shrink-0 ${
                    type === value ? 'bg-[#C4161C] text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '13px' }}
                >
                  {label}
                </button>
              ))}
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
            >
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white"
                style={{ fontSize: '13px' }}
                aria-label="Make"
              >
                <option value="">Any Make</option>
                {brands.map((b) => (
                  <option value={String(b.id)} key={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Model or keyword"
                className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white"
                style={{ fontSize: '13px' }}
                aria-label="Model or keyword"
              />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white"
                style={{ fontSize: '13px' }}
                aria-label="City"
              >
                <option value="">Any City</option>
                {BD_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#3EB549] text-white rounded hover:bg-green-600 transition flex items-center justify-center gap-2 font-semibold shadow-sm"
                style={{ fontSize: '14px' }}
              >
                <Search className="w-4 h-4" aria-hidden />
                Search
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => submitSearch(chip.patch)}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-xs text-gray-700 hover:border-[#233D7B] hover:text-[#233D7B] hover:bg-blue-50/50 transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-[#233D7B] hover:underline font-medium"
                style={{ fontSize: '13px' }}
              >
                {showAdvanced ? 'Hide Advanced Filters «' : 'Advanced Filters »'}
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={clearFilters} className="text-[13px] text-[#233D7B] font-semibold hover:underline">
                  Clear
                </button>
                <button type="button" onClick={saveCurrentSearch} className="text-[13px] text-[#233D7B] font-semibold hover:underline">
                  Save Search
                </button>
              </div>
            </div>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min Price (BDT)"
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max Price (BDT)"
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                >
                  <option value="">Any Fuel Type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
                <input
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  placeholder="Min Year"
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <input
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  placeholder="Max Year"
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                >
                  <option value="">Any Transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                >
                  <option value="">Any Condition</option>
                  <option value="used">Used</option>
                  <option value="new">New</option>
                  <option value="reconditioned">Reconditioned</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={verifiedDealerOnly} onChange={(e) => setVerifiedDealerOnly(e.target.checked)} />
                  Verified dealers only
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={dealerOnly} onChange={(e) => setDealerOnly(e.target.checked)} />
                  Dealer listings only
                </label>
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="md:col-span-3 rounded-lg bg-[#233D7B] text-white text-sm font-bold py-2.5 hover:bg-[#1a2d5a] transition"
                >
                  Apply advanced filters
                </button>
              </div>
            )}
          </div>
        </div>

        {savedSearches.length > 0 && (
          <div className="max-w-5xl mx-auto mt-5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
            <div className="text-xs font-semibold text-blue-100 mb-2">Saved searches</div>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((s) => (
                <button
                  key={s.query}
                  type="button"
                  onClick={() => navigate(`/listings?${s.query}`)}
                  className="px-3 py-1.5 rounded-full bg-white/15 text-white text-xs hover:bg-white/25 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/listings?type=used_car')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">200K+</div>
            <div className="text-xs text-blue-100">Cars for Sale</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings?type=used_bike')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">50K+</div>
            <div className="text-xs text-blue-100">Bikes for Sale</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/used-car-dealers')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">5K+</div>
            <div className="text-xs text-blue-100">Dealers</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings?type=auto_part')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">100K+</div>
            <div className="text-xs text-blue-100">Auto Parts</div>
          </button>
        </div>
      </div>
    </div>
  );
}
