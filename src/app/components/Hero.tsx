import { Search, X } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BD_CITIES, CITY_LABEL_KEYS } from '@/i18n/bdCities';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';
import { SkeletonHeroCard, SkeletonLiveRegion } from '@/app/components/PremiumSkeleton';

const HERO_BG =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80';

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
  const [brandsLoading, setBrandsLoading] = useState(true);
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
      .catch(() => setBrands([]))
      .finally(() => setBrandsLoading(false));
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

  const removeSavedSearch = (query: string, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const next = savedSearches.filter((x) => x.query !== query);
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
    <section className="relative flex min-h-[min(88vh,900px)] flex-col justify-end overflow-hidden py-12 md:justify-center md:py-16">
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/65 via-black/40 to-black/80" />
        <img src={HERO_BG} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
          {t('hero.headline')}
        </h1>
        <p className="mb-8 max-w-2xl text-base text-slate-200 md:text-lg">{t('hero.subhead')}</p>

        <div className="w-full max-w-5xl">
          {brandsLoading ? (
            <>
              <SkeletonLiveRegion>{t('common.loading')}</SkeletonLiveRegion>
              <SkeletonHeroCard />
            </>
          ) : (
            <>
            <div className="rounded-2xl border border-white/30 bg-white/95 p-5 text-left text-gray-900 shadow-2xl backdrop-blur-md md:p-8">
              <div className="mb-5 flex gap-2 overflow-x-auto border-b border-slate-200 pb-4">
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
                    className={`shrink-0 rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition ${
                      type === value ? 'bg-[#ba0035] text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {labelFn()}
                  </button>
                ))}
              </div>

              <form
                className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
              >
                <label className="block space-y-1.5 md:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {t('hero.brandLabel')}
                  </span>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
                    aria-label={t('hero.brandLabel')}
                  >
                    <option value="">{t('hero.anyMake')}</option>
                    {brands.map((b) => (
                      <option value={String(b.id)} key={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5 md:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {t('hero.modelKeywordPlaceholder')}
                  </span>
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t('hero.modelKeywordPlaceholder')}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-gray-800 outline-none placeholder:text-slate-400 focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
                    aria-label={t('hero.modelKeywordPlaceholder')}
                  />
                </label>
                <label className="block space-y-1.5 md:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {t('hero.cityLabel')}
                  </span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
                    aria-label={t('hero.cityLabel')}
                  >
                    <option value="">{t('hero.anyCity')}</option>
                    {BD_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {t(CITY_LABEL_KEYS[c])}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ba0035] px-6 text-[14px] font-bold text-white shadow-md transition hover:bg-[#9a002c] md:mt-0 md:h-[42px] md:self-end"
                >
                  <Search className="h-4 w-4" aria-hidden />
                  {t('hero.searchShort')}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="text-[13px] font-medium text-[#00236f] hover:underline"
                >
                  {showAdvanced ? t('hero.advancedFiltersHide') : t('hero.advancedFiltersShow')}
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[13px] font-semibold text-[#00236f] hover:underline"
                  >
                    {t('hero.clearShort')}
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentSearch}
                    className="text-[13px] font-semibold text-[#00236f] hover:underline"
                  >
                    {t('hero.saveSearch')}
                  </button>
                </div>
              </div>

              {showAdvanced ? (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
                  <input
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder={t('hero.placeholderMinPrice')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
                  />
                  <input
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={t('hero.placeholderMaxPrice')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
                  />
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
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
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
                  />
                  <input
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    placeholder={t('hero.placeholderMaxYear')}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
                  />
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
                  >
                    <option value="">{t('hero.anyTransmissionShort')}</option>
                    <option value="manual">{t('hero.manual')}</option>
                    <option value="automatic">{t('hero.automatic')}</option>
                  </select>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
                  >
                    <option value="">{t('hero.anyConditionShort')}</option>
                    <option value="used">{t('hero.used')}</option>
                    <option value="new">{t('hero.new')}</option>
                    <option value="reconditioned">{t('hero.reconditioned')}</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={verifiedDealerOnly}
                      onChange={(e) => setVerifiedDealerOnly(e.target.checked)}
                    />
                    {t('hero.verifiedDealersOnly')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={dealerOnly} onChange={(e) => setDealerOnly(e.target.checked)} />
                    {t('hero.dealerListingsOnly')}
                  </label>
                  <button
                    type="button"
                    onClick={() => submitSearch()}
                    className="rounded-lg bg-[#00236f] py-2.5 text-sm font-bold text-white transition hover:bg-[#001a52] md:col-span-3"
                  >
                    {t('hero.applyAdvancedFilters')}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip.chipKey}
                  type="button"
                  onClick={() => submitSearch(chip.patch)}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </>
          )}
        </div>

        {savedSearches.length > 0 ? (
          <div className="mx-auto mt-6 w-full max-w-5xl rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="mb-2 text-xs font-semibold text-slate-100">{t('hero.savedSearches')}</div>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((s) => (
                <div
                  key={s.query}
                  className="inline-flex items-center max-w-full gap-0.5 rounded-full bg-white/15 text-white text-xs hover:bg-white/25 transition pl-3 pr-1 py-1"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/listings?${s.query}`)}
                    className="min-w-0 truncate py-0.5 text-left hover:underline"
                  >
                    {s.label}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeSavedSearch(s.query, e)}
                    className="shrink-0 rounded-full p-1 hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/80"
                    aria-label={t('hero.removeSavedSearch')}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
          <button
            type="button"
            onClick={() => navigate('/listings?type=used_car')}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
          >
            <div className="text-xl font-bold text-white">200K+</div>
            <div className="text-xs text-slate-200">{t('hero.statCarsForSale')}</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings?type=used_bike')}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
          >
            <div className="text-xl font-bold text-white">50K+</div>
            <div className="text-xs text-slate-200">{t('hero.statBikesForSale')}</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/used-car-dealers')}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
          >
            <div className="text-xl font-bold text-white">5K+</div>
            <div className="text-xs text-slate-200">{t('hero.statDealers')}</div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings?type=auto_part')}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
          >
            <div className="text-xl font-bold text-white">100K+</div>
            <div className="text-xs text-slate-200">{t('hero.statAutoPartsShort')}</div>
          </button>
        </div>
      </div>
    </section>
  );
}
