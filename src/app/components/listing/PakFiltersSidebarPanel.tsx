import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  fetchVehicleModelsForBrand,
  type BrandDto,
  type ListingFacetBuckets,
  type VehicleModelDto,
} from '@/lib/marketplace';
import { BD_CITIES as BD_CITIES_ALL, CITY_LABEL_KEYS } from '@/i18n/bdCities';
import { mergeListingParams } from './ListingResultsPak';
import {
  KEYWORD_MAX_LEN,
  normalizePriceDigits,
  type PakFilterFieldErrors,
} from './listingPakFilterValidate';
import { PAK_ASSEMBLY_SLUG_TO_HINTS, PAK_REGISTRATION_SLUG_TO_HINTS } from './pakFilterExpand';
import { PakPriceFilterHumanHint } from './pakPriceHumanReadout';

export type PakFiltersSidebarProps = {
  locationSearch: string;
  setSearchParams: (next: URLSearchParams, opts?: { replace?: boolean }) => void;
  brands: BrandDto[];
  city: string;
  setCity: (v: string) => void;
  keyword: string;
  setKeyword: Dispatch<SetStateAction<string>>;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  minYear: string;
  setMinYear: (v: string) => void;
  maxYear: string;
  setMaxYear: (v: string) => void;
  minMileage: string;
  setMinMileage: (v: string) => void;
  maxMileage: string;
  setMaxMileage: (v: string) => void;
  selectedBrandIds: string[];
  onToggleBrandId: (id: string) => void;
  brandQuery: string;
  setBrandQuery: (v: string) => void;
  selectedModelIds: string[];
  onToggleModelId: (id: string) => void;
  modelQuery: string;
  setModelQuery: (v: string) => void;
  fuelTypes: string[];
  onToggleFuelType: (slug: string) => void;
  transmissionTypes: string[];
  onToggleTransmission: (slug: string) => void;
  selectedBodyHints: string[];
  onToggleBodyHint: (slug: string) => void;
  selectedPaintHints: string[];
  onTogglePaintHint: (slug: string) => void;
  condition: string;
  setCondition: (v: string) => void;
  verifiedDealerOnly: boolean;
  setVerifiedDealerOnly: (v: boolean) => void;
  dealerOnly: boolean;
  setDealerOnly: (v: boolean) => void;
  individualOnly: boolean;
  setIndividualOnly: (v: boolean) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (v: boolean) => void;
  urgentOnly: boolean;
  setUrgentOnly: (v: boolean) => void;
  facetBuckets: ListingFacetBuckets | null;
  variantHintsInput: string;
  setVariantHintsInput: (v: string) => void;
  minEngineCc: string;
  setMinEngineCc: (v: string) => void;
  maxEngineCc: string;
  setMaxEngineCc: (v: string) => void;
  selectedAssemblySlugs: string[];
  onToggleAssemblySlug: (slug: string) => void;
  selectedRegistrationSlugs: string[];
  onToggleRegistrationSlug: (slug: string) => void;
  selectedFeatureSlugs: string[];
  onToggleFeatureSlug: (slug: string) => void;
  commitFiltersToUrl: () => void;
  clearFiltersToUrl: () => void;
  listingType: string;
  filterErrors: PakFilterFieldErrors | null;
  onClearPakFilterErrors: (fields: Array<keyof PakFilterFieldErrors> | 'all') => void;
  layout: 'desktop' | 'overlay';
  onAfterApplyOverlay?: () => void;
};

const CITY_CHIPS: Array<{ slug: string; labelKey: string }> = BD_CITIES_ALL.map((slug) => ({
  slug,
  labelKey: CITY_LABEL_KEYS[slug],
}));
const COLOR_CHIPS: Array<{ q: string; labelKey: string }> = [
  { q: 'white', labelKey: 'listingBrowse.colWhite' },
  { q: 'black', labelKey: 'listingBrowse.colBlack' },
  { q: 'silver', labelKey: 'listingBrowse.colSilver' },
  { q: 'grey', labelKey: 'listingBrowse.colGrey' },
  { q: 'blue', labelKey: 'listingBrowse.colBlue' },
  { q: 'red', labelKey: 'listingBrowse.colRed' },
  { q: 'green', labelKey: 'listingBrowse.colGreen' },
];
const BODY_CHIPS: Array<{ labelKey: string; q: string }> = [
  { labelKey: 'listingBrowse.chipSedan', q: 'sedan' },
  { labelKey: 'listingBrowse.chipHatchback', q: 'hatchback' },
  { labelKey: 'listingBrowse.chipSuv', q: 'SUV' },
  { labelKey: 'listingBrowse.chipCrossover', q: 'crossover' },
  { labelKey: 'listingBrowse.chipCoupe', q: 'coupe' },
  { labelKey: 'listingBrowse.chipPickup', q: 'pickup' },
  { labelKey: 'listingBrowse.chipVan', q: 'van' },
];

const FUEL_OPTS = ['petrol', 'diesel', 'hybrid', 'electric', 'cng'] as const;
const TRANS_OPTS = ['automatic', 'manual'] as const;

const PAK_PRICE_SLIDER_MAX = 50_000_000;
const FEATURE_SLUGS = [
  'abs',
  'airbags',
  'sunroof',
  'navigation',
  'cruise',
  'alloy',
  'climate',
  'android_panel',
  'push_start',
] as const;
const ASSEMBLY_SLUGS = Object.keys(PAK_ASSEMBLY_SLUG_TO_HINTS) as string[];
const REG_SLUGS = Object.keys(PAK_REGISTRATION_SLUG_TO_HINTS) as string[];

export function PakFiltersSidebar(props: PakFiltersSidebarProps) {
  const { t } = useTranslation();
  const {
    locationSearch,
    setSearchParams,
    brands,
    city,
    setCity,
    keyword,
    setKeyword,
    selectedBrandIds,
    onToggleBrandId,
    brandQuery,
    setBrandQuery,
    selectedModelIds,
    onToggleModelId,
    modelQuery,
    setModelQuery,
    facetBuckets,
    layout,
    onAfterApplyOverlay,
  } = props;

  const filterIssuesRef = useRef<HTMLDivElement | null>(null);

  const [loadedModels, setLoadedModels] = useState<VehicleModelDto[]>([]);

  const filterYearHintText = useMemo(
    () =>
      t('listingBrowse.filterYearHint', {
        min: 1950,
        max: new Date().getFullYear() + 1,
      }),
    [t],
  );

  useEffect(() => {
    const slugs = brands
      .filter((b) => selectedBrandIds.includes(String(b.id)))
      .map((b) => b.slug)
      .filter(Boolean);
    if (slugs.length === 0) {
      setLoadedModels([]);
      return;
    }
    let cancelled = false;
    Promise.all(slugs.map((s) => fetchVehicleModelsForBrand(s)))
      .then((chunks) => {
        if (cancelled) return;
        const map = new Map<number, VehicleModelDto>();
        for (const chunk of chunks) {
          for (const m of chunk) map.set(m.id, m);
        }
        setLoadedModels([...map.values()].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => !cancelled && setLoadedModels([]));
    return () => {
      cancelled = true;
    };
  }, [brands, selectedBrandIds]);

  const applyChip = (updates: Record<string, string | null | undefined>) => {
    setSearchParams(mergeListingParams(locationSearch, updates), { replace: true });
  };

  const chipActive = (key: string, val: string) => new URLSearchParams(locationSearch).get(key) === val;

  const err = props.filterErrors ?? {};
  const fieldRing = (key: keyof PakFilterFieldErrors) =>
    err[key] ? 'border-red-500 ring-1 ring-red-200/80' : 'border-gray-300';

  const brandFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.brands.forEach(({ key, count }) => {
      if (key != null) m.set(String(key), count);
    });
    return m;
  }, [facetBuckets]);

  const modelFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.vehicle_models.forEach(({ key, count }) => {
      if (key != null) m.set(String(key), count);
    });
    return m;
  }, [facetBuckets]);

  const fuelFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.fuel_types.forEach(({ key, count }) => {
      if (key != null) m.set(String(key).toLowerCase(), count);
    });
    return m;
  }, [facetBuckets]);

  const transmissionFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.transmissions.forEach(({ key, count }) => {
      if (key != null) m.set(String(key).toLowerCase(), count);
    });
    return m;
  }, [facetBuckets]);

  const assemblyFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.assembly_types?.forEach(({ key, count }) => {
      if (key != null) m.set(String(key).toLowerCase(), count);
    });
    return m;
  }, [facetBuckets]);

  const registrationFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.registration_regions?.forEach(({ key, count }) => {
      if (key != null) m.set(String(key).toLowerCase(), count);
    });
    return m;
  }, [facetBuckets]);

  const featureTagFacet = useMemo(() => {
    const m = new Map<string, number>();
    facetBuckets?.feature_tags?.forEach(({ key, count }) => {
      if (key != null) m.set(String(key).toLowerCase(), count);
    });
    return m;
  }, [facetBuckets]);

  const filterIssueMessages = [...new Set(Object.values(err).filter(Boolean))] as string[];

  const [featuresOpen, setFeaturesOpen] = useState(false);

  const priceMinNum = useMemo(() => {
    const d = normalizePriceDigits(props.minPrice);
    const n = d ? Number(d) : 0;
    return Number.isFinite(n) ? Math.min(Math.max(0, n), PAK_PRICE_SLIDER_MAX) : 0;
  }, [props.minPrice]);

  const priceMaxNum = useMemo(() => {
    const d = normalizePriceDigits(props.maxPrice);
    const n = d ? Number(d) : PAK_PRICE_SLIDER_MAX;
    return Number.isFinite(n)
      ? Math.min(Math.max(priceMinNum, n), PAK_PRICE_SLIDER_MAX)
      : PAK_PRICE_SLIDER_MAX;
  }, [props.maxPrice, priceMinNum]);

  useEffect(() => {
    if (!props.filterErrors || Object.keys(props.filterErrors).length === 0) return;
    requestAnimationFrame(() => filterIssuesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }, [props.filterErrors]);

  const brandQueryLower = brandQuery.trim().toLowerCase();
  const filteredBrands = useMemo(() => {
    const base = [...brands];
    base.sort((a, b) => a.name.localeCompare(b.name));
    if (!brandQueryLower) return base;
    return base.filter((b) => (b.name + b.slug).toLowerCase().includes(brandQueryLower));
  }, [brands, brandQueryLower]);

  const modelQueryLower = modelQuery.trim().toLowerCase();
  const filteredModels = useMemo(() => {
    if (!modelQueryLower) return loadedModels;
    return loadedModels.filter((m) => (m.name + m.slug).toLowerCase().includes(modelQueryLower));
  }, [loadedModels, modelQueryLower]);

  const fuelLabel = (slug: string) => {
    if (slug === 'cng') return 'CNG';
    const lk = slug === 'petrol' ? 'hero.petrol' : slug === 'diesel' ? 'hero.diesel' : slug === 'hybrid' ? 'hero.hybrid' : 'hero.electric';
    return t(lk as 'hero.petrol');
  };

  const footerActions = layout === 'overlay' && (
    <div className="border-t border-gray-200 bg-white px-4 py-3 flex gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-bold text-gray-800"
        onClick={() => props.clearFiltersToUrl()}
      >
        {t('listingBrowse.clearAll')}
      </button>
      <button
        type="button"
        className="flex-1 rounded-lg bg-[#3EB549] py-3 text-sm font-bold text-white"
        onClick={() => {
          props.commitFiltersToUrl();
          onAfterApplyOverlay?.();
        }}
      >
        {t('listingBrowse.applyFilters')}
      </button>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden ${layout === 'desktop' ? 'sticky top-24 max-h-[calc(100vh-5rem)]' : 'h-full rounded-none border-x-0 border-t-0'}`}
    >
      <div className="border-b border-gray-100 px-4 py-3 bg-[#f8f9fa] shrink-0">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-gray-800">{t('listingBrowse.showResultsBy')}</h3>
      </div>
      <div
        className={`p-4 space-y-6 overflow-y-auto flex-1 ${layout === 'overlay' ? 'pb-6' : 'pb-28 lg:pb-4'} ${layout === 'desktop' ? 'min-h-0' : ''}`}
      >
        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.searchKeyword')}</div>
          <p className="text-[11px] text-gray-500 mb-1.5 leading-snug">{t('listingBrowse.filterKeywordDebouncedHint')}</p>
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => {
                props.onClearPakFilterErrors(['keyword']);
                setKeyword(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') props.commitFiltersToUrl();
              }}
              placeholder={t('listingBrowse.placeholderKeyword')}
              className={`flex-1 min-w-0 px-3 py-2 border rounded text-sm text-gray-900 ${fieldRing('keyword')}`}
              aria-invalid={Boolean(err.keyword)}
              maxLength={KEYWORD_MAX_LEN}
            />
            <button
              type="button"
              onClick={() => props.commitFiltersToUrl()}
              className="shrink-0 rounded bg-[#233D7B] text-white p-2 hover:bg-[#1a2d5a]"
              aria-label={t('listingBrowse.searchAria')}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          {err.keyword ? <p className="mt-1.5 text-xs text-red-600">{err.keyword}</p> : null}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.city')}</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyChip({ city: null })}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                !city ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t('listingBrowse.all')}
            </button>
            {CITY_CHIPS.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => applyChip({ city: c.slug })}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                  chipActive('city', c.slug) ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t(c.labelKey)}
              </button>
            ))}
          </div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('listingBrowse.otherCity')}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.makeMulti')}</div>
          <input
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder={t('listingBrowse.searchMakes')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
          />
          <div className="max-h-44 overflow-y-auto border border-gray-100 rounded divide-y divide-gray-50">
            {filteredBrands.map((b) => {
              const id = String(b.id);
              const c = brandFacet.get(id);
              const active = selectedBrandIds.includes(id);
              return (
                <label key={id} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50">
                  <input type="checkbox" checked={active} onChange={() => onToggleBrandId(id)} />
                  <span className="min-w-0 flex-1 truncate">{b.name}</span>
                  {c != null ? (
                    <span className="shrink-0 text-[11px] text-gray-400 tabular-nums">({c.toLocaleString()})</span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.modelMulti')}</div>
          {selectedBrandIds.length === 0 ? (
            <p className="text-xs text-gray-500">{t('listingBrowse.modelDependsOnMake')}</p>
          ) : (
            <>
              <input
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                placeholder={t('listingBrowse.searchModels')}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
              />
              <div className="max-h-44 overflow-y-auto border border-gray-100 rounded divide-y divide-gray-50">
                {filteredModels.map((m) => {
                  const id = String(m.id);
                  const c = modelFacet.get(id);
                  const active = selectedModelIds.includes(id);
                  return (
                    <label key={id} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50">
                      <input type="checkbox" checked={active} onChange={() => onToggleModelId(id)} />
                      <span className="min-w-0 flex-1 truncate">{m.name}</span>
                      {c != null ? (
                        <span className="shrink-0 text-[11px] text-gray-400 tabular-nums">({c.toLocaleString()})</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.variantKeyword')}</div>
          <p className="text-[11px] text-gray-500 mb-1.5 leading-snug">{t('listingBrowse.variantKeywordHint')}</p>
          <input
            value={props.variantHintsInput}
            onChange={(e) => props.setVariantHintsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') props.commitFiltersToUrl();
            }}
            placeholder={t('listingBrowse.variantKeywordPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            maxLength={KEYWORD_MAX_LEN}
          />
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.priceBdt')}</div>
          <p className="text-[11px] text-gray-500 mb-2 leading-snug">{t('listingBrowse.filterPriceHint')}</p>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-2 gap-y-1 items-start">
            <input
              value={props.minPrice}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minPrice', 'maxPrice']);
                props.setMinPrice(e.target.value);
              }}
              placeholder={t('listingBrowse.from')}
              inputMode="numeric"
              autoComplete="off"
              className={`w-full px-2 py-2 border rounded text-sm ${fieldRing('minPrice')}`}
            />
            <input
              value={props.maxPrice}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minPrice', 'maxPrice']);
                props.setMaxPrice(e.target.value);
              }}
              placeholder={t('listingBrowse.to')}
              inputMode="numeric"
              autoComplete="off"
              className={`w-full px-2 py-2 border rounded text-sm ${fieldRing('maxPrice')}`}
            />
            <button
              type="button"
              onClick={() => props.commitFiltersToUrl()}
              className="row-span-2 self-stretch flex items-center justify-center shrink-0 rounded bg-[#233D7B] text-white px-3 py-2 text-xs font-bold hover:bg-[#1a2d5a]"
            >
              {t('listingBrowse.go')}
            </button>
            <PakPriceFilterHumanHint raw={props.minPrice} />
            <PakPriceFilterHumanHint raw={props.maxPrice} />
          </div>
          {(err.minPrice || err.maxPrice) && (
            <div className="mt-1.5 space-y-1 text-xs text-red-600">
              {err.minPrice ? (
                <p>
                  {t('listingBrowse.filterErrMinLabel')}: {err.minPrice}
                </p>
              ) : null}
              {err.maxPrice ? (
                <p>
                  {t('listingBrowse.filterErrMaxLabel')}: {err.maxPrice}
                </p>
              ) : null}
            </div>
          )}
          <div className="mt-3 space-y-2">
            <label className="block text-[11px] font-medium text-gray-600">{t('listingBrowse.priceSliderMin')}</label>
            <input
              type="range"
              min={0}
              max={PAK_PRICE_SLIDER_MAX}
              step={50000}
              value={priceMinNum}
              onChange={(e) => {
                const n = Number(e.target.value);
                props.onClearPakFilterErrors(['minPrice', 'maxPrice']);
                props.setMinPrice(String(n));
                const maxD = normalizePriceDigits(props.maxPrice);
                if (maxD && Number(maxD) < n) props.setMaxPrice(String(n));
              }}
              className="w-full accent-[#233D7B]"
              aria-label={t('listingBrowse.priceSliderMinAria')}
            />
            <label className="block text-[11px] font-medium text-gray-600">{t('listingBrowse.priceSliderMax')}</label>
            <input
              type="range"
              min={0}
              max={PAK_PRICE_SLIDER_MAX}
              step={50000}
              value={priceMaxNum}
              onChange={(e) => {
                const n = Number(e.target.value);
                props.onClearPakFilterErrors(['minPrice', 'maxPrice']);
                props.setMaxPrice(String(n));
                const minD = normalizePriceDigits(props.minPrice);
                if (minD && Number(minD) > n) props.setMinPrice(String(n));
              }}
              className="w-full accent-[#233D7B]"
              aria-label={t('listingBrowse.priceSliderMaxAria')}
            />
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.year')}</div>
          <p className="text-[11px] text-gray-500 mb-2 leading-snug">{filterYearHintText}</p>
          <div className="flex gap-2 items-center">
            <input
              value={props.minYear}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minYear', 'maxYear']);
                props.setMinYear(e.target.value);
              }}
              placeholder={t('listingBrowse.from')}
              inputMode="numeric"
              maxLength={4}
              className={`w-full px-2 py-2 border rounded text-sm tabular-nums ${fieldRing('minYear')}`}
            />
            <input
              value={props.maxYear}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minYear', 'maxYear']);
                props.setMaxYear(e.target.value);
              }}
              placeholder={t('listingBrowse.to')}
              inputMode="numeric"
              maxLength={4}
              className={`w-full px-2 py-2 border rounded text-sm tabular-nums ${fieldRing('maxYear')}`}
            />
            <button
              type="button"
              onClick={() => props.commitFiltersToUrl()}
              className="shrink-0 rounded bg-[#233D7B] text-white px-3 py-2 text-xs font-bold hover:bg-[#1a2d5a]"
            >
              {t('listingBrowse.go')}
            </button>
          </div>
          {(err.minYear || err.maxYear) && (
            <div className="mt-1.5 space-y-1 text-xs text-red-600">
              {err.minYear ? <p>{t('listingBrowse.filterErrMinLabel')}: {err.minYear}</p> : null}
              {err.maxYear ? <p>{t('listingBrowse.filterErrMaxLabel')}: {err.maxYear}</p> : null}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.mileageKm')}</div>
          <div className="flex gap-2 items-center">
            <input
              value={props.minMileage}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minMileage', 'maxMileage']);
                props.setMinMileage(e.target.value);
              }}
              placeholder={t('listingBrowse.from')}
              inputMode="numeric"
              className={`w-full px-2 py-2 border rounded text-sm ${fieldRing('minMileage')}`}
            />
            <input
              value={props.maxMileage}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minMileage', 'maxMileage']);
                props.setMaxMileage(e.target.value);
              }}
              placeholder={t('listingBrowse.to')}
              inputMode="numeric"
              className={`w-full px-2 py-2 border rounded text-sm ${fieldRing('maxMileage')}`}
            />
          </div>
          {(err.minMileage || err.maxMileage) ? (
            <div className="mt-1.5 space-y-1 text-xs text-red-600">
              {err.minMileage ? <p>{err.minMileage}</p> : null}
              {err.maxMileage ? <p>{err.maxMileage}</p> : null}
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.fuelTypeMulti')}</div>
          <div className="space-y-1 border border-gray-100 rounded divide-y divide-gray-50">
            {(props.listingType === 'used_bike' ? [...FUEL_OPTS].filter((x) => x !== 'hybrid') : [...FUEL_OPTS]).map((slug) => {
              const ct = fuelFacet.get(slug);
              const lab = fuelLabel(slug);
              const checked = props.fuelTypes.includes(slug);
              return (
                <label key={slug} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50">
                  <input type="checkbox" checked={checked} onChange={() => props.onToggleFuelType(slug)} />
                  <span className="flex-1">{lab}</span>
                  {ct != null ? <span className="text-[11px] text-gray-400">({ct.toLocaleString()})</span> : null}
                </label>
              );
            })}
          </div>
        </div>

        {props.listingType !== 'used_bike' ? (
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.transmissionMulti')}</div>
            <div className="space-y-1 border border-gray-100 rounded divide-y divide-gray-50">
              {TRANS_OPTS.map((slug) => {
                const ct = transmissionFacet.get(slug);
                const lab = slug === 'automatic' ? t('hero.automatic') : t('hero.manual');
                const checked = props.transmissionTypes.includes(slug);
                return (
                  <label key={slug} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50">
                    <input type="checkbox" checked={checked} onChange={() => props.onToggleTransmission(slug)} />
                    <span className="flex-1">{lab}</span>
                    {ct != null ? <span className="text-[11px] text-gray-400">({ct.toLocaleString()})</span> : null}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.bodyTypeHints')}</div>
          <div className="flex flex-wrap gap-2">
            {BODY_CHIPS.map(({ labelKey, q }) => {
              const on = props.selectedBodyHints.includes(q.toLowerCase());
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => props.onToggleBodyHint(q.toLowerCase())}
                  className={`rounded-full px-2 py-1 text-[11px] font-medium border ${
                    on ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.engineCcRange')}</div>
          <p className="text-[11px] text-gray-500 mb-2 leading-snug">{t('listingBrowse.engineCcHint')}</p>
          <div className="flex gap-2 items-center">
            <input
              value={props.minEngineCc}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minEngineCc', 'maxEngineCc']);
                props.setMinEngineCc(e.target.value);
              }}
              placeholder={t('listingBrowse.from')}
              inputMode="numeric"
              className={`w-full px-2 py-2 border rounded text-sm tabular-nums ${fieldRing('minEngineCc')}`}
            />
            <input
              value={props.maxEngineCc}
              onChange={(e) => {
                props.onClearPakFilterErrors(['minEngineCc', 'maxEngineCc']);
                props.setMaxEngineCc(e.target.value);
              }}
              placeholder={t('listingBrowse.to')}
              inputMode="numeric"
              className={`w-full px-2 py-2 border rounded text-sm tabular-nums ${fieldRing('maxEngineCc')}`}
            />
          </div>
          {(err.minEngineCc || err.maxEngineCc) && (
            <div className="mt-1.5 space-y-1 text-xs text-red-600">
              {err.minEngineCc ? <p>{err.minEngineCc}</p> : null}
              {err.maxEngineCc ? <p>{err.maxEngineCc}</p> : null}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.assemblyHeading')}</div>
          <p className="text-[11px] text-gray-500 mb-2 leading-snug">{t('listingBrowse.assemblyHint')}</p>
          <div className="flex flex-wrap gap-2">
            {ASSEMBLY_SLUGS.map((slug) => {
              const ct = assemblyFacet.get(slug);
              const on = props.selectedAssemblySlugs.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => props.onToggleAssemblySlug(slug)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium border ${
                    on ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{t(`listingBrowse.assembly_${slug}`)}</span>
                  {ct != null ? (
                    <span className={`tabular-nums ${on ? 'text-[#233D7B]/80' : 'text-gray-400'}`}>
                      ({ct.toLocaleString()})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.registeredHeading')}</div>
          <p className="text-[11px] text-gray-500 mb-2 leading-snug">{t('listingBrowse.registeredHint')}</p>
          <div className="flex flex-wrap gap-2">
            {REG_SLUGS.map((slug) => {
              const ct = registrationFacet.get(slug);
              const on = props.selectedRegistrationSlugs.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => props.onToggleRegistrationSlug(slug)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium border ${
                    on ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{t(`listingBrowse.region_${slug}`)}</span>
                  {ct != null ? (
                    <span className={`tabular-nums ${on ? 'text-[#233D7B]/80' : 'text-gray-400'}`}>
                      ({ct.toLocaleString()})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.colourMulti')}</div>
          <div className="flex flex-wrap gap-2">
            {COLOR_CHIPS.map((col) => {
              const on = props.selectedPaintHints.includes(col.q);
              return (
                <button
                  key={col.q}
                  type="button"
                  onClick={() => props.onTogglePaintHint(col.q)}
                  className={`rounded-full px-2 py-1 text-[11px] font-medium border ${
                    on ? 'border-[#233D7B] bg-[#233D7B]/10 text-[#233D7B]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t(col.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setFeaturesOpen((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-bold text-gray-700 uppercase tracking-wide"
            aria-expanded={featuresOpen}
          >
            <span>{t('listingBrowse.featuresHeading')}</span>
            <span className="text-[10px] text-gray-500">{featuresOpen ? '−' : '+'}</span>
          </button>
          {featuresOpen ? (
            <div className="mt-2 space-y-2 border border-gray-100 rounded divide-y divide-gray-50">
              {FEATURE_SLUGS.map((slug) => {
                const ct = featureTagFacet.get(slug);
                return (
                  <label key={slug} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50">
                    <input type="checkbox" checked={props.selectedFeatureSlugs.includes(slug)} onChange={() => props.onToggleFeatureSlug(slug)} />
                    <span className="flex-1">{t(`listingBrowse.feature_${slug}`)}</span>
                    {ct != null ? <span className="text-[11px] text-gray-400">({ct.toLocaleString()})</span> : null}
                  </label>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{t('listingBrowse.condition')}</div>
          <select
            value={props.condition}
            onChange={(e) => props.setCondition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">{t('listingBrowse.fuelAny')}</option>
            <option value="used">{t('hero.used')}</option>
            <option value="reconditioned">{t('hero.reconditioned')}</option>
            <option value="new">{t('hero.new')}</option>
          </select>
        </div>

        {filterIssueMessages.length > 0 ? (
          <div
            ref={filterIssuesRef}
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-950"
          >
            <p className="font-semibold mb-1">{t('listingBrowse.filterErrSummaryTitle')}</p>
            <ul className="list-disc pl-4 space-y-0.5 marker:text-red-300">
              {filterIssueMessages.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t('listingBrowse.adAndSellerHeading')}</div>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={props.featuredOnly}
              onChange={(e) => props.setFeaturedOnly(e.target.checked)}
            />
            {t('listingBrowse.featuredAdsOnly')}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={props.urgentOnly} onChange={(e) => props.setUrgentOnly(e.target.checked)} />
            {t('listingBrowse.urgentAdsOnly')}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={props.verifiedDealerOnly}
              onChange={(e) => props.setVerifiedDealerOnly(e.target.checked)}
            />
            {t('listingBrowse.verifiedDealersOnly')}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={props.dealerOnly} onChange={(e) => props.setDealerOnly(e.target.checked)} />
            {t('listingBrowse.dealerListingsOnly')}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={props.individualOnly} onChange={(e) => props.setIndividualOnly(e.target.checked)} />
            {t('listingBrowse.individualSellerOnly')}
          </label>
        </div>

        {layout === 'desktop' ? (
          <>
            <button
              type="button"
              onClick={() => props.commitFiltersToUrl()}
              className="w-full bg-[#3EB549] text-white py-2.5 rounded font-bold hover:bg-[#36a340] transition shadow-sm"
            >
              {t('listingBrowse.applyFilters')}
            </button>
            <button
              type="button"
              onClick={() => props.clearFiltersToUrl()}
              className="w-full border border-gray-300 text-gray-800 py-2.5 rounded font-semibold hover:bg-gray-50 transition"
            >
              {t('listingBrowse.clearAll')}
            </button>
          </>
        ) : null}
      </div>
      {footerActions}
    </div>
  );
}
