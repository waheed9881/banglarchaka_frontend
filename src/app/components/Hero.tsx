import { Search, X } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/app/components/ui/carousel';
import { cn } from '@/app/components/ui/utils';
import { HERO_CAROUSEL_SLIDES } from '@/app/constants/heroCarouselSlides';
import { BD_CITIES, CITY_LABEL_KEYS } from '@/i18n/bdCities';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';

/** Tall hero — larger banner strip (viewport-filling) */
const HERO_MIN_HEIGHT_CLASS = 'min-h-[min(92vh,1024px)]';

function HeroAutoBanner() {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused) return;
    const id = window.setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => window.clearInterval(id);
  }, [api, paused]);

  return (
    <div
      className="relative h-full w-full min-h-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Carousel
        opts={{ loop: true }}
        setApi={setApi}
        className="h-full"
        aria-label={t('hero.bannerCarouselAria')}
      >
        <CarouselContent className={cn('-ml-0', HERO_MIN_HEIGHT_CLASS)}>
          {HERO_CAROUSEL_SLIDES.map((slide, i) => (
            <CarouselItem key={slide.id} className={cn('basis-full pl-0', HERO_MIN_HEIGHT_CLASS)}>
              <Link
                to="/post-ad"
                className={cn(
                  'group relative block h-full w-full overflow-hidden',
                  HERO_MIN_HEIGHT_CLASS,
                )}
              >
                <img
                  src={slide.src}
                  alt=""
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.015]',
                    slide.objectClass,
                  )}
                  width={2400}
                  height={1350}
                  sizes="100vw"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={i === 0 ? 'high' : undefined}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="outline"
          className="absolute left-3 top-[40%] z-10 size-10 -translate-y-1/2 border border-white/25 bg-white/92 text-neutral-900 shadow-lg backdrop-blur-sm hover:bg-white disabled:opacity-35 sm:left-5"
        />
        <CarouselNext
          variant="outline"
          className="absolute right-3 top-[40%] z-10 size-10 -translate-y-1/2 border border-white/25 bg-white/92 text-neutral-900 shadow-lg backdrop-blur-sm hover:bg-white disabled:opacity-35 sm:right-5"
        />
      </Carousel>
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-center gap-2 sm:bottom-28">
        {HERO_CAROUSEL_SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={t('hero.bannerSlideDotAria', { n: slide.id })}
            aria-current={i === current ? 'true' : undefined}
            className={cn(
              'pointer-events-auto h-2 rounded-full transition-[width,background-color] duration-300',
              i === current ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/50 hover:bg-white/80',
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

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
    <section className="relative bg-white text-gray-900">
      {/* Full-bleed tall hero: carousel background + copy overlay (search card overlaps below) */}
      <div className={cn('relative z-0 w-full overflow-hidden bg-neutral-950', HERO_MIN_HEIGHT_CLASS)}>
        <div className="absolute inset-0 z-0 [&_[data-slot=carousel-content]]:h-full">
          <HeroAutoBanner />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-neutral-950/[0.42]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 pb-32 pt-16 sm:pb-40 sm:pt-20 md:pb-44 lg:pb-48">
          <div className="pointer-events-auto mx-auto w-full max-w-3xl text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-xs">
              {t('hero.brandEyebrow')}
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              {t('hero.headline')}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/92 sm:mt-4 sm:text-lg">
              {t('hero.subhead')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
              <Link
                to="/post-ad"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/90 bg-white/12 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/22"
              >
                {t('nav.postAd')}
              </Link>
              <Link
                to="/auctions"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 shadow-lg shadow-black/30 transition hover:bg-neutral-100"
              >
                {t('nav.auctions')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter: pulled up — sits on lower part of hero + white area */}
      <div className="relative z-20 mx-auto -mt-[7.5rem] mb-8 max-w-5xl px-4 sm:-mt-[8.75rem] sm:mb-10 lg:-mt-[9.5rem]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.22)] sm:p-6">
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
                  className={`px-5 py-2.5 rounded-t-md font-semibold shrink-0 transition-colors ${
                    type === value ? 'bg-brand-red text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
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
              {brandsLoading ? (
                <div
                  className="px-3 py-2.5 border border-gray-200 rounded-md bg-gray-100 animate-pulse min-h-[42px]"
                  role="status"
                  aria-busy="true"
                  aria-label={t('hero.brandLabel')}
                />
              ) : (
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
              )}
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
                className="px-6 py-2.5 bg-brand-green text-white rounded-lg hover:bg-brand-green-hover transition flex items-center justify-center gap-2 font-semibold shadow-sm"
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
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-xs text-gray-700 hover:border-brand-red/50 hover:text-brand-red hover:bg-red-50/80 transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-brand-red hover:underline font-medium"
                style={{ fontSize: '13px' }}
              >
                {showAdvanced ? t('hero.advancedFiltersHide') : t('hero.advancedFiltersShow')}
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={clearFilters} className="text-[13px] text-neutral-600 font-semibold hover:text-brand-red hover:underline">
                  {t('hero.clearShort')}
                </button>
                <button type="button" onClick={saveCurrentSearch} className="text-[13px] text-neutral-600 font-semibold hover:text-brand-red hover:underline">
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
                  className="md:col-span-3 rounded-lg bg-brand-red text-white text-sm font-bold py-2.5 hover:bg-brand-red-hover transition"
                >
                  {t('hero.applyAdvancedFilters')}
                </button>
              </div>
            )}
        </div>
      </div>

      {savedSearches.length > 0 ? (
        <div className="border-t border-neutral-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
            <div className="mx-auto max-w-5xl rounded-xl border border-neutral-200/90 bg-white px-4 py-3 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('hero.savedSearches')}</div>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((s) => (
                  <div
                    key={s.query}
                    className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-neutral-200 bg-white py-1 pl-3 pr-1 text-xs text-neutral-800 shadow-sm transition hover:border-brand-red/30"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/listings?${s.query}`)}
                      className="min-w-0 truncate py-0.5 text-left hover:text-brand-red hover:underline"
                    >
                      {s.label}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeSavedSearch(s.query, e)}
                      className="shrink-0 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-red/40"
                      aria-label={t('hero.removeSavedSearch')}
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
