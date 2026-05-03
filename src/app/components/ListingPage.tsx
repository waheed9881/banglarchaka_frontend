import {
  SlidersHorizontal,
  Grid,
  List,
  ChevronUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router';
import { getAuthToken } from '@/lib/api';
import { addToWishlist, fetchWishlistListings, removeFromWishlist } from '@/lib/engagement';
import {
  fetchBrands,
  fetchListingFilterFacets,
  fetchListingsPaged,
  listingPaginationPages,
  listingPublicHref,
  type BrandDto,
  type ListingDto,
  type ListingFacetBuckets,
  type ListingsPageMeta,
} from '@/lib/marketplace';
import { useDebouncedEffect } from '@/lib/hooks/useDebouncedCallback';
import { setPageSeo } from '@/lib/seo';
import { ApiConnectionHint } from './ApiConnectionHint';
import {
  mergeListingParams,
  PakFiltersSidebar,
  PakListingRow,
  UsedCarsListingFooter,
  validatePakListingSidebarInput,
  type PakFilterFieldErrors,
} from './listing/ListingResultsPak';
import { ListingGridCard } from './listing/ListingGridCard';
import { SkeletonBox } from '@/app/components/PremiumSkeleton';

const PER_PAGE_OPTIONS = ['24', '48', '72'] as const;

function splitCsvParam(s: string | null): string[] {
  if (!s?.trim()) return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function ListingCardSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="animate-pulse rounded-lg border border-gray-100 bg-white p-4 shadow-sm flex gap-4">
        <div className="h-28 w-36 shrink-0 rounded-md bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-3 py-1">
          <div className="h-4 rounded bg-gray-200 w-[82%]" />
          <div className="h-6 rounded bg-gray-200 w-[28%]" />
          <div className="h-3 rounded bg-gray-200 w-[55%]" />
          <div className="h-3 rounded bg-gray-200 w-[40%]" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <SkeletonBox className="aspect-[16/10] w-full" rounded="rounded-none" />
      <div className="space-y-3 p-5">
        <SkeletonBox className="h-5 w-[88%]" rounded="rounded-md" />
        <SkeletonBox className="h-7 w-[38%]" rounded="rounded-md" />
        <SkeletonBox className="h-px w-full max-w-[90%]" rounded="rounded-full" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <SkeletonBox className="mx-auto h-8 w-14" rounded="rounded-lg" />
          <SkeletonBox className="mx-auto h-8 w-14" rounded="rounded-lg" />
          <SkeletonBox className="mx-auto h-8 w-14" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function listingParamsFromSearchParams(
  sp: URLSearchParams,
  opts: { ignoreUrlPage?: boolean; page?: string } = {},
): Record<string, string | number | boolean | undefined> {
  const nextPerPageRaw = sp.get('per_page') || '48';
  const nextPerPage = PER_PAGE_OPTIONS.includes(nextPerPageRaw as (typeof PER_PAGE_OPTIONS)[number])
    ? nextPerPageRaw
    : '48';

  const listingKind = sp.get('type') || 'used_car';
  const brandIdsCsv =
    sp.get('brand_ids') ||
    (!sp.get('brand_ids') && sp.get('brand_id') ? (sp.get('brand_id') as string) : undefined);
  const fuelTypesCsv =
    sp.get('fuel_types') ||
    (!sp.get('fuel_types') && sp.get('fuel_type') ? (sp.get('fuel_type') as string) : undefined);
  const transmissionCsv =
    listingKind === 'used_bike'
      ? undefined
      : sp.get('transmissions') ||
        (!sp.get('transmissions') && sp.get('transmission') ? (sp.get('transmission') as string) : undefined);

  const base: Record<string, string | number | boolean | undefined> = {
    listing_type: listingKind,
    city: sp.get('city') || undefined,
    brand_ids: brandIdsCsv,
    vehicle_model_ids: sp.get('vehicle_model_ids') || undefined,
    category_id: sp.get('category_id') || undefined,
    sort: sp.get('sort') || 'newest',
    q: sp.get('q') || undefined,
    min_price: sp.get('min_price') || undefined,
    max_price: sp.get('max_price') || undefined,
    min_year: sp.get('min_year') || undefined,
    max_year: sp.get('max_year') || undefined,
    min_mileage: sp.get('min_mileage') || undefined,
    max_mileage: sp.get('max_mileage') || undefined,
    fuel_types: fuelTypesCsv,
    transmissions: transmissionCsv,
    body_hints: sp.get('body_hints') || undefined,
    paint_hints: sp.get('paint_hints') || undefined,
    variant_hints: sp.get('variant_hints') || undefined,
    feature_slugs: sp.get('feature_slugs') || undefined,
    assembly_types: sp.get('assembly') || undefined,
    registration_regions: sp.get('registration') || undefined,
    assembly_hints: expandCsvSlugs(sp.get('assembly'), PAK_ASSEMBLY_SLUG_TO_HINTS),
    registration_hints: expandCsvSlugs(sp.get('registration'), PAK_REGISTRATION_SLUG_TO_HINTS),
    min_engine_cc: sp.get('min_engine_cc') || undefined,
    max_engine_cc: sp.get('max_engine_cc') || undefined,
    condition: sp.get('condition') || undefined,
    verified_dealer_only: sp.get('verified_dealer_only') === '1' ? 1 : undefined,
    dealer_only: sp.get('dealer_only') === '1' ? 1 : undefined,
    individual_only: sp.get('individual_only') === '1' ? 1 : undefined,
    featured: sp.get('featured') === '1' ? 1 : undefined,
    urgent: sp.get('urgent') === '1' ? 1 : undefined,
    per_page: Number(nextPerPage),
  };

  const urlPage = opts.ignoreUrlPage ? null : sp.get('page');
  const p = opts.page ?? (urlPage && urlPage !== '1' ? urlPage : undefined);
  if (p && p !== '1') {
    base.page = p;
  }

  return base;
}

export function ListingPage({ onOpenDetail }: { onOpenDetail?: (id: string) => void }) {
  const { t } = useTranslation();
  const { search: locationSearch } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window === 'undefined') return 'list';
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get('type') || 'used_car';
    return t === 'used_car' || t === 'used_bike' ? 'list' : 'grid';
  });
  const [showFilters, setShowFilters] = useState(true);
  const [cars, setCars] = useState<ListingDto[]>([]);
  const [listMeta, setListMeta] = useState<ListingsPageMeta | null>(null);
  const [brands, setBrands] = useState<BrandDto[]>([]);

  const [city, setCity] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('newest');
  const [listingType, setListingType] = useState('used_car');
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
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [individualOnly, setIndividualOnly] = useState(false);
  const [phoneRevealId, setPhoneRevealId] = useState<string | null>(null);
  const [sidebarFilterErrors, setSidebarFilterErrors] = useState<PakFilterFieldErrors | null>(null);
  const [pakMobileFiltersOpen, setPakMobileFiltersOpen] = useState(false);
  const [facetBuckets, setFacetBuckets] = useState<ListingFacetBuckets | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [brandQueryPak, setBrandQueryPak] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [modelQueryPak, setModelQueryPak] = useState('');
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<string[]>([]);
  const [minMileage, setMinMileage] = useState('');
  const [maxMileage, setMaxMileage] = useState('');
  const [selectedBodyHints, setSelectedBodyHints] = useState<string[]>([]);
  const [selectedPaintHints, setSelectedPaintHints] = useState<string[]>([]);
  const [variantHintsInput, setVariantHintsInput] = useState('');
  const [minEngineCc, setMinEngineCc] = useState('');
  const [maxEngineCc, setMaxEngineCc] = useState('');
  const [selectedAssemblySlugs, setSelectedAssemblySlugs] = useState<string[]>([]);
  const [selectedRegistrationSlugs, setSelectedRegistrationSlugs] = useState<string[]>([]);
  const [selectedFeatureSlugs, setSelectedFeatureSlugs] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [perPage, setPerPage] = useState<string>('48');
  const [loadingMore, setLoadingMore] = useState(false);
  const [infiniteHasMore, setInfiniteHasMore] = useState(false);
  const scrollSigRef = useRef<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const infiniteNextPageRef = useRef(2);
  const infiniteBusyRef = useRef(false);
  const listMetaRef = useRef<ListingsPageMeta | null>(null);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const locationSearchRef = useRef(locationSearch);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copiedListingId, setCopiedListingId] = useState<string | null>(null);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const continuous = useMemo(
    () => new URLSearchParams(locationSearch).get('continuous') === '1',
    [locationSearch],
  );

  const pakUsedCarList =
    (listingType === 'used_car' || listingType === 'used_bike') && viewMode === 'list';

  listMetaRef.current = listMeta;
  loadingRef.current = loading;
  loadingMoreRef.current = loadingMore;
  locationSearchRef.current = locationSearch;

  useEffect(() => {
    const tParam = listingType;
    if (tParam !== 'used_car' && tParam !== 'used_bike') {
      setFacetBuckets(null);
      return;
    }
    let cancelled = false;
    fetchListingFilterFacets(
      listingParamsFromSearchParams(new URLSearchParams(locationSearch), { ignoreUrlPage: true }),
    ).then((rows) => {
      if (!cancelled) setFacetBuckets(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [listingType, locationSearch]);

  useDebouncedEffect(keyword, 420, () => {
    const sp = new URLSearchParams(locationSearchRef.current);
    const cur = (sp.get('q') || '').trim();
    const next = keyword.trim();
    if (cur === next) return;
    setSearchParams(mergeListingParams(locationSearchRef.current, { q: next || null }), { replace: true });
  });

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }
    };
  }, []);

  /** continuous mode conflicts with URL page — drop page so filters stay canonical */
  useEffect(() => {
    const sp = new URLSearchParams(locationSearch);
    if (sp.get('continuous') !== '1' || !sp.has('page')) {
      return;
    }
    sp.delete('page');
    setSearchParams(sp, { replace: true });
  }, [locationSearch, setSearchParams]);

  useEffect(() => {
    if (!getAuthToken()) return;
    fetchWishlistListings()
      .then((rows) => setWishlistedIds(new Set(rows.map((r) => r.id))))
      .catch(() => setWishlistedIds(new Set()));
  }, []);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(locationSearch);
    setSidebarFilterErrors(null);

    const nextType = sp.get('type') || 'used_car';
    const nextCity = sp.get('city') || '';
    const nextBrand = sp.get('brand_id') || '';
    const nextCategory = sp.get('category_id') || '';
    const nextSort = sp.get('sort') || 'newest';
    const nextQ = sp.get('q') || '';
    const nextMinPrice = sp.get('min_price') || '';
    const nextMaxPrice = sp.get('max_price') || '';
    const nextMinYear = sp.get('min_year') || '';
    const nextMaxYear = sp.get('max_year') || '';
    const nextFuelType =
      sp.get('fuel_types') && !String(sp.get('fuel_types')).includes(',')
        ? String(sp.get('fuel_types'))
        : sp.get('fuel_type') || '';
    const ftMulti = sp.get('fuel_types') || sp.get('fuel_type') || '';
    const nextTransmission =
      nextType === 'used_bike'
        ? ''
        : sp.get('transmissions') && !String(sp.get('transmissions')).includes(',')
          ? String(sp.get('transmissions'))
          : sp.get('transmission') || '';
    const trMulti = nextType === 'used_bike' ? '' : sp.get('transmissions') || sp.get('transmission') || '';
    const nextCondition = sp.get('condition') || '';
    const nextVerifiedDealerOnly = sp.get('verified_dealer_only') === '1';
    const nextDealerOnly = sp.get('dealer_only') === '1';
    const nextFeaturedOnly = sp.get('featured') === '1';
    const brandIdsList = splitCsvParam(sp.get('brand_ids'));
    const nextPage = sp.get('page') || '1';
    const rawPer = sp.get('per_page') || '48';
    const nextPerPage = PER_PAGE_OPTIONS.includes(rawPer as (typeof PER_PAGE_OPTIONS)[number])
      ? rawPer
      : '48';
    const scrollContinuous = sp.get('continuous') === '1';

    setListingType(nextType);
    setCity(nextCity);
    setBrandId(!sp.get('brand_ids') && nextBrand ? nextBrand : '');
    setSelectedBrandIds(
      brandIdsList.length > 0 ? brandIdsList : nextBrand ? [nextBrand] : [],
    );
    setCategoryId(nextCategory);
    setSort(nextSort);
    setKeyword(nextQ);
    setMinPrice(nextMinPrice);
    setMaxPrice(nextMaxPrice);
    setMinYear(nextMinYear);
    setMaxYear(nextMaxYear);
    setMinMileage(sp.get('min_mileage') || '');
    setMaxMileage(sp.get('max_mileage') || '');
    setFuelType(nextFuelType.includes(',') ? '' : nextFuelType.toLowerCase());
    setFuelTypes(splitCsvParam(ftMulti).map((x) => x.toLowerCase()));
    setTransmission(nextTransmission.includes(',') ? '' : nextTransmission.toLowerCase());
    setTransmissionTypes(
      nextType === 'used_bike' ? [] : splitCsvParam(trMulti).map((x) => x.toLowerCase()),
    );
    setSelectedModelIds(splitCsvParam(sp.get('vehicle_model_ids')));
    setSelectedBodyHints(splitCsvParam(sp.get('body_hints')).map((x) => x.toLowerCase()));
    setSelectedPaintHints(splitCsvParam(sp.get('paint_hints')));
    setVariantHintsInput(sp.get('variant_hints') || '');
    setMinEngineCc(sp.get('min_engine_cc') || '');
    setMaxEngineCc(sp.get('max_engine_cc') || '');
    setSelectedAssemblySlugs(splitCsvParam(sp.get('assembly')));
    setSelectedRegistrationSlugs(splitCsvParam(sp.get('registration')));
    setSelectedFeatureSlugs(splitCsvParam(sp.get('feature_slugs')));
    setCondition(nextCondition);
    setVerifiedDealerOnly(nextVerifiedDealerOnly);
    setDealerOnly(nextDealerOnly);
    setFeaturedOnly(nextFeaturedOnly);
    setUrgentOnly(sp.get('urgent') === '1');
    setIndividualOnly(sp.get('individual_only') === '1');
    setPerPage(nextPerPage);

    const stableBase = new URLSearchParams(locationSearch);
    stableBase.delete('page');
    stableBase.delete('continuous');
    const scrollSig = scrollContinuous
      ? `${stableBase.toString()}|pp:${nextPerPage}`
      : `${stableBase.toString()}|pp:${nextPerPage}|pg:${nextPage}`;
    if (scrollSigRef.current !== null && scrollSigRef.current !== scrollSig) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    scrollSigRef.current = scrollSig;

    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    if (!scrollContinuous) {
      setInfiniteHasMore(false);
      infiniteBusyRef.current = false;
    } else {
      infiniteNextPageRef.current = 2;
      infiniteBusyRef.current = false;
    }

    fetchListingsPaged(
      listingParamsFromSearchParams(sp, scrollContinuous ? { ignoreUrlPage: true } : {}),
    )
      .then(({ items, meta }) => {
        if (!cancelled) {
          setCars(items);
          setListMeta(meta);
          if (scrollContinuous && meta) {
            infiniteNextPageRef.current = 2;
            setInfiniteHasMore(meta.last_page >= 2);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : t('listingPage.couldNotLoad'));
          setCars([]);
          setListMeta(null);
          setInfiniteHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locationSearch, t]);

  useEffect(() => {
    if (!continuous || !infiniteHasMore) {
      return;
    }
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) {
          return;
        }
        const meta = listMetaRef.current;
        if (!meta || infiniteBusyRef.current) {
          return;
        }
        const nextP = infiniteNextPageRef.current;
        if (nextP > meta.last_page) {
          return;
        }
        if (loadingRef.current || loadingMoreRef.current) {
          return;
        }

        infiniteBusyRef.current = true;
        setLoadingMore(true);

        const sp = new URLSearchParams(locationSearchRef.current);
        fetchListingsPaged(listingParamsFromSearchParams(sp, { ignoreUrlPage: true, page: String(nextP) }))
          .then(({ items, meta: pageMeta }) => {
            infiniteNextPageRef.current = nextP + 1;
            if (pageMeta) {
              setInfiniteHasMore(infiniteNextPageRef.current <= pageMeta.last_page);
            }
            setCars((prev) => {
              const seen = new Set(prev.map((c) => c.id));
              const merged = [...prev];
              for (const it of items) {
                if (!seen.has(it.id)) {
                  seen.add(it.id);
                  merged.push(it);
                }
              }
              return merged;
            });
          })
          .catch(() => {})
          .finally(() => {
            infiniteBusyRef.current = false;
            setLoadingMore(false);
          });
      },
      { root: null, rootMargin: '320px', threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [continuous, infiniteHasMore]);

  const applySortToUrl = (nextSort: string) => {
    setSort(nextSort);
    const next = new URLSearchParams(locationSearch);
    if (nextSort === 'newest') next.delete('sort');
    else next.set('sort', nextSort);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const applyPerPageToUrl = (v: string) => {
    setPerPage(v);
    const next = new URLSearchParams(locationSearch);
    if (v === '48') next.delete('per_page');
    else next.set('per_page', v);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const setContinuousInUrl = (enabled: boolean) => {
    const next = new URLSearchParams(locationSearch);
    next.delete('page');
    if (enabled) next.set('continuous', '1');
    else next.delete('continuous');
    setSearchParams(next, { replace: true });
  };

  const copyListingUrl = (car: ListingDto, e: MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${listingPublicHref(car)}`;
    const applyCopied = () => {
      setCopiedListingId(car.id);
      if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
      copyFeedbackTimerRef.current = setTimeout(() => setCopiedListingId(null), 2000);
    };

    void navigator.clipboard.writeText(url).then(applyCopied).catch(() => {
      window.prompt(t('listingPage.copyLinkPrompt'), url);
      applyCopied();
    });
  };

  const goPage = (page: number) => {
    const next = new URLSearchParams(locationSearch);
    if (page <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(page));
    }
    setSearchParams(next, { replace: true });
  };

  const heading = useMemo(() => {
    if (listingType === 'used_bike') return t('listingPage.headingUsedBike');
    if (listingType === 'auto_part') return t('listingPage.headingAutoPart');
    if (listingType === 'new_car') return t('listingPage.headingNewCar');
    if (listingType === 'used_car') return t('listingPage.headingUsedCarBd');
    return t('listingPage.headingUsedCar');
  }, [listingType, t]);

  useEffect(() => {
    const sp = new URLSearchParams(locationSearch);
    const bits: string[] = [];
    const citySeo = sp.get('city')?.trim();
    if (citySeo) bits.push(citySeo);
    const qSeo = sp.get('q')?.trim();
    if (qSeo) bits.push(qSeo);
    const singleBrand =
      splitCsvParam(sp.get('brand_ids')).length === 1 ? splitCsvParam(sp.get('brand_ids'))[0] : null;
    if (singleBrand) {
      const bn = brands.find((b) => String(b.id) === singleBrand)?.name;
      if (bn) bits.push(bn);
    }
    const titleExtras = bits.length ? ` · ${bits.join(' · ')}` : '';
    const title = `${heading}${titleExtras}`;
    setPageSeo(t('innerUi.seoTitle', { title }), t('listingPage.seoBrowseDesc', { topic: heading }));
  }, [brands, heading, locationSearch, t]);

  const clearSidebarFilterErrors = useCallback((fields: Array<keyof PakFilterFieldErrors> | 'all') => {
    setSidebarFilterErrors((prev) => {
      if (!prev) return null;
      if (fields === 'all') return null;
      const next: PakFilterFieldErrors = { ...prev };
      for (const f of fields) delete next[f];
      return Object.keys(next).length > 0 ? next : null;
    });
  }, []);

  const scrollToTopSmooth = () => {
    const prefersReduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduce ? 'auto' : 'smooth' });
  };

  const commitFiltersToUrl = () => {
    const pakLayout = listingType === 'used_car' || listingType === 'used_bike';

    if (pakLayout) {
      const validated = validatePakListingSidebarInput(
        { keyword, minPrice, maxPrice, minYear, maxYear, minMileage, maxMileage, minEngineCc, maxEngineCc },
        t,
      );
      if (!validated.ok) {
        setSidebarFilterErrors(validated.errors);
        return;
      }
      setSidebarFilterErrors(null);
      const { normalized } = validated;
      const next = new URLSearchParams();
      if (listingType) next.set('type', listingType);
      if (city.trim()) next.set('city', city.trim());
      if (selectedBrandIds.length) {
        next.set('brand_ids', [...new Set(selectedBrandIds)].sort().join(','));
      } else if (brandId.trim()) {
        next.set('brand_id', brandId.trim());
      }
      if (selectedModelIds.length) next.set('vehicle_model_ids', [...new Set(selectedModelIds)].sort().join(','));
      if (categoryId) next.set('category_id', categoryId);
      if (sort && sort !== 'newest') next.set('sort', sort);
      if (normalized.keywordTrimmed) next.set('q', normalized.keywordTrimmed);
      if (normalized.minPrice) next.set('min_price', normalized.minPrice);
      if (normalized.maxPrice) next.set('max_price', normalized.maxPrice);
      if (normalized.minYear) next.set('min_year', normalized.minYear);
      if (normalized.maxYear) next.set('max_year', normalized.maxYear);
      if (normalized.minMileage) next.set('min_mileage', normalized.minMileage);
      if (normalized.maxMileage) next.set('max_mileage', normalized.maxMileage);

      const fuels = [...new Set(fuelTypes.map((x) => x.toLowerCase().trim()).filter(Boolean))];
      if (fuels.length === 1) next.set('fuel_types', fuels[0]);
      else if (fuels.length > 1) next.set('fuel_types', fuels.join(','));
      const trans = [...new Set(transmissionTypes.map((x) => x.toLowerCase().trim()).filter(Boolean))];
      if (listingType !== 'used_bike') {
        if (trans.length === 1) next.set('transmissions', trans[0]);
        else if (trans.length > 1) next.set('transmissions', trans.join(','));
      }

      const bodies = [...new Set(selectedBodyHints.map((x) => x.toLowerCase()).filter(Boolean))];
      if (bodies.length) next.set('body_hints', bodies.join(','));
      const paints = [...new Set(selectedPaintHints.filter(Boolean))];
      if (paints.length) next.set('paint_hints', paints.join(','));

      const variantTokens = variantHintsInput
        .split(/[,|]/u)
        .map((s) => s.trim())
        .filter(Boolean);
      if (variantTokens.length) {
        next.set('variant_hints', [...new Set(variantTokens.map((x) => x.toLowerCase()))].join(','));
      }

      const asm = [...new Set(selectedAssemblySlugs.map((x) => x.toLowerCase().trim()).filter(Boolean))];
      if (asm.length) next.set('assembly', asm.sort().join(','));

      const reg = [...new Set(selectedRegistrationSlugs.map((x) => x.toLowerCase().trim()).filter(Boolean))];
      if (reg.length) next.set('registration', reg.sort().join(','));

      const feats = [...new Set(selectedFeatureSlugs.map((x) => x.toLowerCase().trim()).filter(Boolean))];
      if (feats.length) next.set('feature_slugs', feats.sort().join(','));

      if (normalized.minEngineCc) next.set('min_engine_cc', normalized.minEngineCc);
      if (normalized.maxEngineCc) next.set('max_engine_cc', normalized.maxEngineCc);

      if (condition) next.set('condition', condition);
      if (featuredOnly) next.set('featured', '1');
      if (urgentOnly) next.set('urgent', '1');
      if (verifiedDealerOnly) next.set('verified_dealer_only', '1');
      if (individualOnly && !dealerOnly) next.set('individual_only', '1');
      if (dealerOnly && !individualOnly) next.set('dealer_only', '1');

      if (perPage !== '48') next.set('per_page', perPage);
      if (new URLSearchParams(locationSearch).get('continuous') === '1') {
        next.set('continuous', '1');
      }
      setSearchParams(next, { replace: true });
      if (typeof window !== 'undefined' && window.innerWidth < 1024) scrollToTopSmooth();
      return;
    }

    const validated = validatePakListingSidebarInput(
      {
        keyword,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        minMileage: '',
        maxMileage: '',
        minEngineCc: '',
        maxEngineCc: '',
      },
      t,
    );
    if (!validated.ok) {
      setSidebarFilterErrors(validated.errors);
      return;
    }
    setSidebarFilterErrors(null);
    const { normalized } = validated;
    const next = new URLSearchParams();
    if (listingType) next.set('type', listingType);
    if (city.trim()) next.set('city', city.trim());
    if (brandId) next.set('brand_id', brandId);
    if (categoryId) next.set('category_id', categoryId);
    if (sort && sort !== 'newest') next.set('sort', sort);
    if (normalized.keywordTrimmed) next.set('q', normalized.keywordTrimmed);
    if (normalized.minPrice) next.set('min_price', normalized.minPrice);
    if (normalized.maxPrice) next.set('max_price', normalized.maxPrice);
    if (normalized.minYear) next.set('min_year', normalized.minYear);
    if (normalized.maxYear) next.set('max_year', normalized.maxYear);
    if (fuelType) next.set('fuel_type', fuelType);
    if (listingType !== 'used_bike' && transmission) next.set('transmission', transmission);
    if (condition) next.set('condition', condition);
    if (verifiedDealerOnly) next.set('verified_dealer_only', '1');
    if (dealerOnly) next.set('dealer_only', '1');
    if (featuredOnly) next.set('featured', '1');
    if (perPage !== '48') next.set('per_page', perPage);
    if (new URLSearchParams(locationSearch).get('continuous') === '1') {
      next.set('continuous', '1');
    }
    setSearchParams(next, { replace: true });
    if (typeof window !== 'undefined' && window.innerWidth < 1024) scrollToTopSmooth();
  };

  const clearFiltersToUrl = () => {
    setSidebarFilterErrors(null);
    setPakMobileFiltersOpen(false);
    setSelectedBrandIds([]);
    setSelectedModelIds([]);
    setFuelTypes([]);
    setTransmissionTypes([]);
    setSelectedBodyHints([]);
    setSelectedPaintHints([]);
    setMinMileage('');
    setMaxMileage('');
    setBrandQueryPak('');
    setModelQueryPak('');
    setUrgentOnly(false);
    setIndividualOnly(false);
    setVariantHintsInput('');
    setMinEngineCc('');
    setMaxEngineCc('');
    setSelectedAssemblySlugs([]);
    setSelectedRegistrationSlugs([]);
    setSelectedFeatureSlugs([]);
    const next = new URLSearchParams();
    next.set('type', listingType);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {heading}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#233D7B]">{t('listingPage.home')}</Link>
            <span>›</span>
            <span className="text-gray-900">{heading}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-44 lg:pb-6">
        <ApiConnectionHint />

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex flex-col gap-1.5 border-t border-gray-200 bg-white/95 px-3 pt-2 shadow-[0_-4px_14px_rgba(0,0,0,0.07)] backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (listingType === 'used_car' || listingType === 'used_bike') {
                  setPakMobileFiltersOpen(true);
                } else {
                  setShowFilters((v) => !v);
                }
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('listingPage.filters')}
            </button>
            <select
              value={sort}
              onChange={(e) => applySortToUrl(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800"
              aria-label={t('listingPage.sortAria')}
            >
              <option value="newest">{t('listingPage.sortNewest')}</option>
              <option value="price_asc">{t('listingPage.sortPriceAsc')}</option>
              <option value="price_desc">{t('listingPage.sortPriceDesc')}</option>
              <option value="views">{t('listingPage.sortViews')}</option>
            </select>
            <div className="flex shrink-0 overflow-hidden rounded-md border border-gray-300">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#233D7B] text-white' : 'bg-white text-gray-600'}`}
                aria-label={t('listingPage.gridViewAria')}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#233D7B] text-white' : 'bg-white text-gray-600'}`}
                aria-label={t('listingPage.listViewAria')}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <select
              value={perPage}
              onChange={(e) => applyPerPageToUrl(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800"
              aria-label={t('listingPage.sortPerPageAria')}
            >
              <option value="24">{t('listingPage.perPageShort24')}</option>
              <option value="48">{t('listingPage.perPageShort48')}</option>
              <option value="72">{t('listingPage.perPageShort72')}</option>
            </select>
            <label className="flex shrink-0 cursor-pointer select-none items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={continuous}
                onChange={(e) => setContinuousInUrl(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('listingPage.autoLoad')}
            </label>
          </div>
        </div>

        <div className="mb-6 hidden flex-wrap items-center justify-between gap-4 lg:flex">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded hover:border-[#233D7B] hover:text-[#233D7B]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? t('listingPage.hideFilters') : t('listingPage.showFilters')}
            </button>
            <div className="text-sm text-gray-600">
              {continuous && listMeta && listMeta.total > 0 ? (
                <>
                  {t('listingPage.loadedOf', {
                    loaded: cars.length.toLocaleString(),
                    total: listMeta.total.toLocaleString(),
                  })}
                </>
              ) : listMeta && listMeta.total > 0 ? (
                <>
                  {t('listingPage.showingRange', {
                    from: ((listMeta.current_page - 1) * listMeta.per_page + 1).toLocaleString(),
                    to: Math.min(listMeta.total, listMeta.current_page * listMeta.per_page).toLocaleString(),
                    total: listMeta.total.toLocaleString(),
                  })}
                </>
              ) : (
                <>{t('listingPage.showingCount', { count: cars.length })}</>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => applySortToUrl(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="newest">{t('listingPage.sortDateNewest')}</option>
              <option value="price_asc">{t('listingPage.sortPriceLowHigh')}</option>
              <option value="price_desc">{t('listingPage.sortPriceHighLow')}</option>
              <option value="views">{t('listingPage.sortMostViewed')}</option>
            </select>

            <select
              value={perPage}
              onChange={(e) => applyPerPageToUrl(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
              aria-label={t('listingPage.sortPerPageAria')}
            >
              <option value="24">{t('listingPage.perPage24')}</option>
              <option value="48">{t('listingPage.perPage48')}</option>
              <option value="72">{t('listingPage.perPage72')}</option>
            </select>

            <label className="flex items-center gap-2 text-xs text-gray-700 whitespace-nowrap cursor-pointer select-none">
              <input
                type="checkbox"
                checked={continuous}
                onChange={(e) => setContinuousInUrl(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('listingPage.autoLoadScroll')}
            </label>

            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#233D7B] text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#233D7B] text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {(listingType === 'used_car' || listingType === 'used_bike') &&
        pakMobileFiltersOpen ? (
          <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label={t('listingPage.closeFilters')}
              onClick={() => setPakMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-[min(100%,420px)] flex-col bg-white shadow-2xl">
              <PakFiltersSidebar
                layout="overlay"
                locationSearch={locationSearch}
                setSearchParams={setSearchParams}
                brands={brands}
                city={city}
                setCity={setCity}
                keyword={keyword}
                setKeyword={setKeyword}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minYear={minYear}
                setMinYear={setMinYear}
                maxYear={maxYear}
                setMaxYear={setMaxYear}
                minMileage={minMileage}
                setMinMileage={setMinMileage}
                maxMileage={maxMileage}
                setMaxMileage={setMaxMileage}
                selectedBrandIds={selectedBrandIds}
                onToggleBrandId={(id) =>
                  setSelectedBrandIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                  )
                }
                brandQuery={brandQueryPak}
                setBrandQuery={setBrandQueryPak}
                selectedModelIds={selectedModelIds}
                onToggleModelId={(id) =>
                  setSelectedModelIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                  )
                }
                modelQuery={modelQueryPak}
                setModelQuery={setModelQueryPak}
                fuelTypes={fuelTypes}
                onToggleFuelType={(slug) =>
                  setFuelTypes((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                transmissionTypes={transmissionTypes}
                onToggleTransmission={(slug) =>
                  setTransmissionTypes((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                selectedBodyHints={selectedBodyHints}
                onToggleBodyHint={(slug) =>
                  setSelectedBodyHints((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                selectedPaintHints={selectedPaintHints}
                onTogglePaintHint={(slug) =>
                  setSelectedPaintHints((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                condition={condition}
                setCondition={setCondition}
                verifiedDealerOnly={verifiedDealerOnly}
                setVerifiedDealerOnly={setVerifiedDealerOnly}
                dealerOnly={dealerOnly}
                setDealerOnly={(v) => {
                  setDealerOnly(v);
                  if (v) setIndividualOnly(false);
                }}
                individualOnly={individualOnly}
                setIndividualOnly={(v) => {
                  setIndividualOnly(v);
                  if (v) setDealerOnly(false);
                }}
                featuredOnly={featuredOnly}
                setFeaturedOnly={setFeaturedOnly}
                urgentOnly={urgentOnly}
                setUrgentOnly={setUrgentOnly}
                facetBuckets={facetBuckets}
                variantHintsInput={variantHintsInput}
                setVariantHintsInput={setVariantHintsInput}
                minEngineCc={minEngineCc}
                setMinEngineCc={setMinEngineCc}
                maxEngineCc={maxEngineCc}
                setMaxEngineCc={setMaxEngineCc}
                selectedAssemblySlugs={selectedAssemblySlugs}
                onToggleAssemblySlug={(slug) =>
                  setSelectedAssemblySlugs((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                selectedRegistrationSlugs={selectedRegistrationSlugs}
                onToggleRegistrationSlug={(slug) =>
                  setSelectedRegistrationSlugs((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                selectedFeatureSlugs={selectedFeatureSlugs}
                onToggleFeatureSlug={(slug) =>
                  setSelectedFeatureSlugs((prev) =>
                    prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                  )
                }
                commitFiltersToUrl={commitFiltersToUrl}
                clearFiltersToUrl={clearFiltersToUrl}
                listingType={listingType}
                filterErrors={sidebarFilterErrors}
                onClearPakFilterErrors={clearSidebarFilterErrors}
                onAfterApplyOverlay={() => setPakMobileFiltersOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {showFilters && (
            <div className="lg:col-span-1 max-lg:relative max-lg:z-[35]">
              {listingType === 'used_car' || listingType === 'used_bike' ? (
                <div className="max-lg:hidden">
                  <PakFiltersSidebar
                    layout="desktop"
                    locationSearch={locationSearch}
                    setSearchParams={setSearchParams}
                    brands={brands}
                    city={city}
                    setCity={setCity}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    minYear={minYear}
                    setMinYear={setMinYear}
                    maxYear={maxYear}
                    setMaxYear={setMaxYear}
                    minMileage={minMileage}
                    setMinMileage={setMinMileage}
                    maxMileage={maxMileage}
                    setMaxMileage={setMaxMileage}
                    selectedBrandIds={selectedBrandIds}
                    onToggleBrandId={(id) =>
                      setSelectedBrandIds((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                      )
                    }
                    brandQuery={brandQueryPak}
                    setBrandQuery={setBrandQueryPak}
                    selectedModelIds={selectedModelIds}
                    onToggleModelId={(id) =>
                      setSelectedModelIds((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                      )
                    }
                    modelQuery={modelQueryPak}
                    setModelQuery={setModelQueryPak}
                    fuelTypes={fuelTypes}
                    onToggleFuelType={(slug) =>
                      setFuelTypes((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    transmissionTypes={transmissionTypes}
                    onToggleTransmission={(slug) =>
                      setTransmissionTypes((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    selectedBodyHints={selectedBodyHints}
                    onToggleBodyHint={(slug) =>
                      setSelectedBodyHints((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    selectedPaintHints={selectedPaintHints}
                    onTogglePaintHint={(slug) =>
                      setSelectedPaintHints((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    condition={condition}
                    setCondition={setCondition}
                    verifiedDealerOnly={verifiedDealerOnly}
                    setVerifiedDealerOnly={setVerifiedDealerOnly}
                    dealerOnly={dealerOnly}
                    setDealerOnly={(v) => {
                      setDealerOnly(v);
                      if (v) setIndividualOnly(false);
                    }}
                    individualOnly={individualOnly}
                    setIndividualOnly={(v) => {
                      setIndividualOnly(v);
                      if (v) setDealerOnly(false);
                    }}
                    featuredOnly={featuredOnly}
                    setFeaturedOnly={setFeaturedOnly}
                    urgentOnly={urgentOnly}
                    setUrgentOnly={setUrgentOnly}
                    facetBuckets={facetBuckets}
                    variantHintsInput={variantHintsInput}
                    setVariantHintsInput={setVariantHintsInput}
                    minEngineCc={minEngineCc}
                    setMinEngineCc={setMinEngineCc}
                    maxEngineCc={maxEngineCc}
                    setMaxEngineCc={setMaxEngineCc}
                    selectedAssemblySlugs={selectedAssemblySlugs}
                    onToggleAssemblySlug={(slug) =>
                      setSelectedAssemblySlugs((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    selectedRegistrationSlugs={selectedRegistrationSlugs}
                    onToggleRegistrationSlug={(slug) =>
                      setSelectedRegistrationSlugs((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    selectedFeatureSlugs={selectedFeatureSlugs}
                    onToggleFeatureSlug={(slug) =>
                      setSelectedFeatureSlugs((prev) =>
                        prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug],
                      )
                    }
                    commitFiltersToUrl={commitFiltersToUrl}
                    clearFiltersToUrl={clearFiltersToUrl}
                    listingType={listingType}
                    filterErrors={sidebarFilterErrors}
                    onClearPakFilterErrors={clearSidebarFilterErrors}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                  {sidebarFilterErrors && Object.keys(sidebarFilterErrors).length > 0 ? (
                    <div
                      role="alert"
                      className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-950"
                    >
                      <p className="font-semibold mb-1">{t('listingBrowse.filterErrSummaryTitle')}</p>
                      <ul className="list-disc pl-4 space-y-0.5 marker:text-red-300">
                        {[...new Set(Object.values(sidebarFilterErrors).filter(Boolean))].map((msg) => (
                          <li key={msg}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <h3 className="font-bold text-lg mb-4">{t('listingPage.filtersHeading')}</h3>
                  {listingType === 'new_car' && categoryId ? (
                    <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-950">
                      <span>{t('listingPage.categoryFilterActive')}</span>
                      <button
                        type="button"
                        className="shrink-0 font-semibold text-[#233D7B] underline"
                        onClick={() =>
                          setSearchParams(mergeListingParams(locationSearch, { category_id: null }), { replace: true })
                        }
                      >
                        {t('listingPage.categoryFilterClear')}
                      </button>
                    </div>
                  ) : null}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('listingPage.cityLabel')}</label>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('listingPage.cityPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('listingPage.makeLabel')}</label>
                      <select
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="">{t('listingPage.allMakes')}</option>
                        {brands.map((b) => (
                          <option value={String(b.id)} key={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('listingPage.keywordLabel')}</label>
                      <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t('listingPage.keywordPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('listingPage.minPrice')}</label>
                        <input
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="100000"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <PakPriceFilterHumanHint raw={minPrice} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('listingPage.maxPrice')}</label>
                        <input
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="8000000"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <PakPriceFilterHumanHint raw={maxPrice} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('listingPage.minYear')}</label>
                        <input
                          value={minYear}
                          onChange={(e) => setMinYear(e.target.value)}
                          placeholder="2015"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('listingPage.maxYear')}</label>
                        <input
                          value={maxYear}
                          onChange={(e) => setMaxYear(e.target.value)}
                          placeholder="2025"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('listingPage.fuelTypeLabel')}</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="">{t('listingBrowse.fuelAny')}</option>
                        <option value="petrol">{t('hero.petrol')}</option>
                        <option value="diesel">{t('hero.diesel')}</option>
                        <option value="hybrid">{t('hero.hybrid')}</option>
                        <option value="electric">{t('hero.electric')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('listingPage.transmissionLabel')}</label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="">{t('listingBrowse.fuelAny')}</option>
                        <option value="manual">{t('hero.manual')}</option>
                        <option value="automatic">{t('hero.automatic')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('listingPage.conditionLabel')}</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="">{t('listingBrowse.fuelAny')}</option>
                        <option value="used">{t('hero.used')}</option>
                        <option value="reconditioned">{t('hero.reconditioned')}</option>
                        <option value="new">{t('hero.new')}</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={verifiedDealerOnly}
                        onChange={(e) => setVerifiedDealerOnly(e.target.checked)}
                      />
                      {t('listingBrowse.verifiedDealersOnly')}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={dealerOnly}
                        onChange={(e) => setDealerOnly(e.target.checked)}
                      />
                      {t('listingBrowse.dealerListingsOnly')}
                    </label>

                    <button
                      type="button"
                      onClick={() => commitFiltersToUrl()}
                      className="w-full bg-[#C4161C] text-white py-2 rounded font-semibold hover:bg-red-700 transition"
                    >
                      {t('listingPage.apply')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCity('');
                        setBrandId('');
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
                        setSort('newest');
                        clearFiltersToUrl();
                      }}
                      className="w-full border border-gray-300 text-gray-700 py-2 rounded font-semibold hover:border-gray-400 transition"
                    >
                      {t('listingPage.clearAllFilters')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {(listingType === 'used_car' || listingType === 'used_bike') && (
              <PakActiveFilterChips
                brands={brands}
                listingType={listingType}
                locationSearch={locationSearch}
                setSearchParams={setSearchParams}
              />
            )}
            {loading && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {Array.from({ length: Math.min(Number(perPage) || 48, 9) }, (_, i) => (
                  <ListingCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            )}
            {!loading && fetchError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <p className="font-semibold">{t('listingPage.couldNotLoadTitle')}</p>
                <p className="mt-1">{fetchError}</p>
                <p className="mt-2 text-red-700">{t('listingPage.apiDevHint')}</p>
              </div>
            )}
            {!loading && !loadingMore && !fetchError && cars.length === 0 && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-600">
                <p className="font-semibold text-gray-900">{t('listingPage.noFiltersTitle')}</p>
                <p className="mt-2 text-sm">{t('listingPage.noFiltersHint')}</p>
                {(listingType === 'new_car' || listingType === 'new_bike') && (
                  <p className="mt-3 text-sm text-gray-700">
                    {t('listingPage.seedHint')}{' '}
                    <Link to="/listings?type=used_car" className="text-[#233D7B] font-semibold underline">
                      {t('nav.usedCars')}
                    </Link>{' '}
                    ·{' '}
                    <Link to="/used-bikes" className="text-[#233D7B] font-semibold underline">
                      {t('hero.usedBikes')}
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}
            {!loading && (
            <div
              className={
                pakUsedCarList
                  ? 'space-y-4'
                  : viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
              }
            >
              {cars.map((car) =>
                pakUsedCarList ? (
                  <PakListingRow
                    key={car.id}
                    car={car}
                    wishlistedIds={wishlistedIds}
                    setWishlistedIds={setWishlistedIds}
                    copiedListingId={copiedListingId}
                    copyListingUrl={copyListingUrl}
                    phoneRevealId={phoneRevealId}
                    setPhoneRevealId={setPhoneRevealId}
                  />
                ) : (
                  <ListingGridCard
                    key={car.id}
                    car={car}
                    onOpen={() => onOpenDetail?.(car.id)}
                    wishlisted={wishlistedIds.has(car.id)}
                    copied={copiedListingId === car.id}
                    onCopyLink={(e) => copyListingUrl(car, e)}
                    onToggleWishlist={(e) => {
                      e.stopPropagation();
                      if (!getAuthToken()) {
                        window.alert(t('listingPage.signInFavouritesBar'));
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
                        .catch((err) => window.alert(err instanceof Error ? err.message : t('listingBrowse.wishlistFailed')));
                    }}
                  />
                ),
              )}
            </div>
            )}

            {!loading && continuous && infiniteHasMore && (
              <>
                <div ref={sentinelRef} className="h-2 w-full shrink-0" aria-hidden />
                {loadingMore && (
                  <div className="text-center text-sm text-gray-500 py-4">{t('listingPage.loadingMore')}</div>
                )}
              </>
            )}

            {!loading && !continuous && listMeta && listMeta.last_page > 1 && (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-1 sm:gap-2"
                aria-label={t('listingPage.listingPagesAria')}
              >
                <button
                  type="button"
                  disabled={loading || listMeta.current_page <= 1}
                  onClick={() => goPage(listMeta.current_page - 1)}
                  className="px-3 sm:px-4 py-2 text-sm rounded border border-gray-300 bg-white hover:border-[#233D7B] hover:text-[#233D7B] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {t('listingPage.prevPage')}
                </button>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {listingPaginationPages(listMeta.current_page, listMeta.last_page).map((entry, idx) =>
                    entry === 'gap' ? (
                      <span key={`gap-${idx}`} className="px-2 text-gray-400 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={entry}
                        type="button"
                        disabled={loading}
                        onClick={() => goPage(entry)}
                        className={`min-w-[2.25rem] px-2 py-2 text-sm rounded border disabled:opacity-40 ${
                          entry === listMeta.current_page
                            ? 'border-[#233D7B] bg-[#233D7B] text-white'
                            : 'border-gray-300 bg-white hover:border-[#233D7B] hover:text-[#233D7B]'
                        }`}
                      >
                        {entry}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  disabled={loading || listMeta.current_page >= listMeta.last_page}
                  onClick={() => goPage(listMeta.current_page + 1)}
                  className="px-3 sm:px-4 py-2 text-sm rounded border border-gray-300 bg-white hover:border-[#233D7B] hover:text-[#233D7B] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {t('listingPage.nextPage')}
                </button>
              </nav>
            )}

            {listingType === 'used_car' && !continuous && <UsedCarsListingFooter />}
          </div>
        </div>
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTopSmooth}
          className="fixed bottom-[8.25rem] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[#233D7B] shadow-lg hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#233D7B] focus-visible:ring-offset-2 lg:bottom-8 lg:right-8"
          aria-label={t('listingPage.backToTopAria')}
        >
          <ChevronUp className="h-6 w-6" strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
}
