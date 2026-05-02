import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BD_CITIES, CITY_LABEL_KEYS } from '@/i18n/bdCities';
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
  const { t } = useTranslation();
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
    const typeLabel =
      s.listingType === 'used_car'
        ? t('hero.savedSearchUsedCars')
        : s.listingType === 'new_car'
          ? t('hero.savedSearchNewCars')
          : s.listingType === 'used_bike'
            ? t('hero.savedSearchBikes')
            : t('hero.savedSearchParts');
    const cityLabel =
      s.city && s.city in CITY_LABEL_KEYS
        ? ` · ${t(CITY_LABEL_KEYS[s.city as keyof typeof CITY_LABEL_KEYS])}`
        : s.city
          ? ` · ${s.city}`
          : '';
    const label = `${typeLabel}${cityLabel}${s.keyword ? ` · ${s.keyword}` : ''}`;
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

  const quickChips: Array<{ chipKey: string; label: string; patch: SearchPatch }> = [
    { chipKey: 'used_car', label: t('footer.usedCars'), patch: { listingType: 'used_car' } },
    { chipKey: 'new_car', label: t('footer.newCars'), patch: { listingType: 'new_car' } },
    { chipKey: 'used_bike', label: t('hero.tabBikes'), patch: { listingType: 'used_bike' } },
    { chipKey: 'auto_part', label: t('hero.autoParts'), patch: { listingType: 'auto_part' } },
    { chipKey: 'hybrid', label: t('hero.hybrid'), patch: { fuelType: 'hybrid' } },
    { chipKey: 'auto', label: t('hero.automatic'), patch: { transmission: 'automatic' } },
    { chipKey: 'manual', label: t('hero.manual'), patch: { transmission: 'manual' } },
    { chipKey: 'used', label: t('hero.used'), patch: { condition: 'used' } },
  ];

  return (
    <div className="relative bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.5px' }}>
            {t('hero.headline')}
          </h2>
          <p className="text-base text-blue-100">{t('hero.subhead')}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-5 text-gray-900">
            <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
              {(
                [
                  [() => t('footer.usedCars'), 'used_car'],
                  [() => t('footer.newCars'), 'new_car'],
                  [() => t('hero.tabBikes'), 'used_bike'],
                  [() => t('hero.autoParts'), 'auto_part'],
                ] as const
              ).map(([labelFn, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => submitSearch({ listingType: value })}
                  className={`px-5 py-2.5 rounded-t-md font-semibold shrink-0 ${
                    type === value ? 'bg-[#C4161C] text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '13px' }}
                >
                  {labelFn()}
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
                aria-label={t('hero.brandLabel')}
              >
                <option value="">{t('hero.anyMake')}</option>
                {brands.map((b) => (
                  <option value={String(b.id)} key={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('hero.modelKeywordPlaceholder')}
                className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white"
                style={{ fontSize: '13px' }}
                aria-label={t('hero.modelKeywordPlaceholder')}
              />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white"
                style={{ fontSize: '13px' }}
                aria-label={t('hero.cityLabel')}
              >
                <option value="">{t('hero.anyCity')}</option>
                {BD_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {t(CITY_LABEL_KEYS[c])}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#3EB549] text-white rounded hover:bg-green-600 transition flex items-center justify-center gap-2 font-semibold shadow-sm"
                style={{ fontSize: '14px' }}
              >
                <Search className="w-4 h-4" aria-hidden />
                {t('hero.searchShort')}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip.chipKey}
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
                {showAdvanced ? t('hero.advancedFiltersHide') : t('hero.advancedFiltersShow')}
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={clearFilters} className="text-[13px] text-[#233D7B] font-semibold hover:underline">
                  {t('hero.clearShort')}
                </button>
                <button type="button" onClick={saveCurrentSearch} className="text-[13px] text-[#233D7B] font-semibold hover:underline">
                  {t('hero.saveSearch')}
                </button>
              </div>
            </div>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={t('hero.placeholderMinPrice')}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={t('hero.placeholderMaxPrice')}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                >
                  <option value="">{t('hero.anyFuelType')}</option>
                  <option value="petrol">{t('hero.petrol')}</option>
                  <option value="diesel">{t('hero.diesel')}</option>
                  <option value="hybrid">{t('hero.hybrid')}</option>
                  <option value="electric">{t('hero.electric')}</option>
                </select>
                <input
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  placeholder={t('hero.placeholderMinYear')}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <input
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  placeholder={t('hero.placeholderMaxYear')}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                />
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                >
                  <option value="">{t('hero.anyTransmissionShort')}</option>
                  <option value="manual">{t('hero.manual')}</option>
                  <option value="automatic">{t('hero.automatic')}</option>
                </select>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded text-gray-700 bg-white text-sm"
                >
                  <option value="">{t('hero.anyConditionShort')}</option>
                  <option value="used">{t('hero.used')}</option>
                  <option value="new">{t('hero.new')}</option>
                  <option value="reconditioned">{t('hero.reconditioned')}</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={verifiedDealerOnly} onChange={(e) => setVerifiedDealerOnly(e.target.checked)} />
                  {t('hero.verifiedDealersOnly')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={dealerOnly} onChange={(e) => setDealerOnly(e.target.checked)} />
                  {t('hero.dealerListingsOnly')}
                </label>
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="md:col-span-3 rounded-lg bg-[#233D7B] text-white text-sm font-bold py-2.5 hover:bg-[#1a2d5a] transition"
                >
                  {t('hero.applyAdvancedFilters')}
                </button>
              </div>
            )}
          </div>
        </div>

        {savedSearches.length > 0 && (
          <div className="max-w-5xl mx-auto mt-5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
            <div className="text-xs font-semibold text-blue-100 mb-2">{t('hero.savedSearches')}</div>
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
            <div className="text-xs text-blue-100">{t('hero.statCarsForSale')}</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings?type=used_bike')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">50K+</div>
            <div className="text-xs text-blue-100">{t('hero.statBikesForSale')}</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/used-car-dealers')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">5K+</div>
            <div className="text-xs text-blue-100">{t('hero.statDealers')}</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings?type=auto_part')}
            className="bg-white/10 backdrop-blur-sm rounded-md p-3 text-center hover:bg-white/20 transition cursor-pointer border border-transparent hover:border-white/20"
          >
            <div className="text-xl font-bold">100K+</div>
            <div className="text-xs text-blue-100">{t('hero.statAutoPartsShort')}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
