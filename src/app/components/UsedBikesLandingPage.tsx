import { ChevronDown, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import {
  BIKE_BODY_TYPE_TILES,
  BIKE_BUDGET_BANDS,
  BIKE_CATEGORY_TILES,
  BIKE_ENGINE_CC_TILES,
  POPULAR_USED_BIKES,
  USED_BIKE_MAKE_MODELS,
} from '@/app/data/usedBikesBrowse';
import { BD_CITIES } from '@/i18n/bdCities';
import {
  USED_BIKE_MAKE_FALLBACK_ICON,
  USED_BIKE_MAKE_LOGO_URLS,
  USED_BIKES_STRIP_ICON_URLS,
  tablerIconOutline,
} from '@/app/data/usedBikesIconUrls';
import {
  fetchListings,
  fetchListingsPaged,
  formatMoney,
  listingPublicHref,
  resolveMediaUrl,
  type ListingDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { Footer } from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK_BIKE =
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1080&q=80';

function listingsBikeQs(extra: Record<string, string>) {
  const p = new URLSearchParams({ type: 'used_bike', ...extra });
  return `/listings?${p.toString()}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const PRICE_PRESETS: Array<{ labelKey: string; max_price?: string; min_price?: string }> = [
  { labelKey: 'usedBikesLanding.priceAny' },
  { labelKey: 'usedBikesLanding.priceUnder1', max_price: '100000' },
  { labelKey: 'usedBikesLanding.priceUnder2', max_price: '200000' },
  { labelKey: 'usedBikesLanding.priceUnder3', max_price: '300000' },
  { labelKey: 'usedBikesLanding.priceUnder5', max_price: '500000' },
  { labelKey: 'usedBikesLanding.priceUnder10', max_price: '1000000' },
];

type PopularBlock = { label: string; q: string; listings: ListingDto[]; total: number };

function TileIcon({ name, className = 'h-9 w-9 opacity-[0.92]' }: { name: string; className?: string }) {
  return (
    <img
      src={tablerIconOutline(name)}
      alt=""
      className={`object-contain shrink-0 ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}

export function UsedBikesLandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const featuredRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [priceKey, setPriceKey] = useState('0');
  const [moreOpts, setMoreOpts] = useState(false);
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minPriceCustom, setMinPriceCustom] = useState('');
  const [maxPriceCustom, setMaxPriceCustom] = useState('');

  const [featured, setFeatured] = useState<ListingDto[]>([]);
  const [featuredHint, setFeaturedHint] = useState<string | null>(null);
  const [popularBlocks, setPopularBlocks] = useState<PopularBlock[]>([]);
  const [citySlide, setCitySlide] = useState(0);

  useEffect(() => {
    setPageSeo(t('usedBikesLanding.seoTitle'), t('usedBikesLanding.seoDesc'));
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchListings({ listing_type: 'used_bike', featured: 1, per_page: 14 });
        if (cancelled) return;
        if (rows.length > 0) {
          setFeatured(rows);
          setFeaturedHint(null);
          return;
        }
        const fallback = await fetchListings({ listing_type: 'used_bike', sort: 'views', per_page: 14 });
        if (!cancelled) {
          setFeatured(fallback);
          setFeaturedHint(t('usedBikesLanding.featuredFallbackHint'));
        }
      } catch {
        if (!cancelled) setFeatured([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const topPopular = useMemo(() => POPULAR_USED_BIKES.slice(0, 6), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const blocks = await Promise.all(
        topPopular.map(async ({ label, q }) => {
          const [listings, paged] = await Promise.all([
            fetchListings({ listing_type: 'used_bike', q, per_page: 4 }),
            fetchListingsPaged({ listing_type: 'used_bike', q, per_page: 1 }),
          ]);
          return {
            label,
            q,
            listings,
            total: paged.meta?.total ?? listings.length,
          };
        }),
      );
      if (!cancelled) setPopularBlocks(blocks);
    })();
    return () => {
      cancelled = true;
    };
  }, [topPopular]);

  const cityPages = useMemo(() => chunk([...BD_CITIES], 16), []);
  const cityPageCount = Math.max(1, cityPages.length);
  const safeCitySlide = Math.min(citySlide, cityPageCount - 1);

  const submitSearch = () => {
    const preset = PRICE_PRESETS[Number(priceKey)] ?? PRICE_PRESETS[0];
    const params = new URLSearchParams();
    params.set('type', 'used_bike');
    if (keyword.trim()) params.set('q', keyword.trim());
    if (city) params.set('city', city);
    if (preset?.max_price) params.set('max_price', preset.max_price);
    if (preset?.min_price) params.set('min_price', preset.min_price);
    if (moreOpts) {
      if (minYear) params.set('min_year', minYear);
      if (maxYear) params.set('max_year', maxYear);
      if (minPriceCustom) params.set('min_price', minPriceCustom);
      if (maxPriceCustom) params.set('max_price', maxPriceCustom);
    }
    navigate(`/listings?${params.toString()}`);
  };

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * Math.min(360, ref.current.clientWidth * 0.85), behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] text-white pb-10 pt-10 sm:pt-14">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{t('usedBikesLanding.heroTitle')}</h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100">{t('usedBikesLanding.heroSubtitle')}</p>

          <div className="mt-8 max-w-5xl mx-auto rounded-xl bg-white p-4 sm:p-5 text-gray-900 shadow-2xl text-left">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <label className="flex-1 block">
                <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.fieldKeyword')}</span>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t('usedBikesLanding.placeholderKeyword')}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#233D7B]/40"
                />
              </label>
              <label className="lg:w-52 block">
                <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.fieldCity')}</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#233D7B]/40"
                >
                  <option value="">{t('usedBikesLanding.allCities')}</option>
                  {BD_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="lg:w-52 block">
                <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.fieldPrice')}</span>
                <select
                  value={priceKey}
                  onChange={(e) => setPriceKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#233D7B]/40"
                >
                  {PRICE_PRESETS.map((p, i) => (
                    <option key={p.labelKey} value={String(i)}>
                      {t(p.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={submitSearch}
                className="lg:w-36 shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#3EB549] px-4 py-3 text-sm font-bold text-white hover:bg-[#35a340] transition shadow-md"
              >
                <Search className="w-4 h-4" />
                {t('usedBikesLanding.search')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMoreOpts((v) => !v)}
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#233D7B] hover:underline"
            >
              {t('usedBikesLanding.moreOptions')}
              <ChevronDown className={`w-4 h-4 transition-transform ${moreOpts ? 'rotate-180' : ''}`} />
            </button>

            {moreOpts ? (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-gray-100 pt-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.minYear')}</span>
                  <input
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="2015"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.maxYear')}</span>
                  <input
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="2026"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.minPrice')}</span>
                  <input
                    value={minPriceCustom}
                    onChange={(e) => setMinPriceCustom(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder={t('usedBikesLanding.optional')}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">{t('usedBikesLanding.maxPrice')}</span>
                  <input
                    value={maxPriceCustom}
                    onChange={(e) => setMaxPriceCustom(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder={t('usedBikesLanding.optional')}
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-[#f5f6f8] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid gap-6 md:grid-cols-4 md:items-center">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                <img src={USED_BIKES_STRIP_ICON_URLS.ad} alt="" className="w-6 h-6 object-contain" loading="lazy" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{t('usedBikesLanding.stripFreeTitle')}</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{t('usedBikesLanding.stripFreeBody')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                <img src={USED_BIKES_STRIP_ICON_URLS.buyers} alt="" className="w-6 h-6 object-contain" loading="lazy" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{t('usedBikesLanding.stripBuyersTitle')}</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{t('usedBikesLanding.stripBuyersBody')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                <img src={USED_BIKES_STRIP_ICON_URLS.fast} alt="" className="w-6 h-6 object-contain" loading="lazy" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{t('usedBikesLanding.stripFastTitle')}</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{t('usedBikesLanding.stripFastBody')}</p>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                to="/used-bikes/sell"
                className="inline-flex items-center justify-center rounded-xl bg-[#C4161C] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#a91218] transition"
              >
                {t('usedBikesLanding.sellCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('usedBikesLanding.featuredTitle')}</h2>
              {featuredHint ? <p className="text-sm text-gray-600 mt-1">{featuredHint}</p> : null}
            </div>
            <Link to={listingsBikeQs({ featured: '1' })} className="text-[#233D7B] font-semibold text-sm hover:underline shrink-0">
              {t('usedBikesLanding.viewAllFeatured')}
            </Link>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label={t('browseUsed.ariaPrev')}
              onClick={() => scrollCarousel(featuredRef, -1)}
              className="hidden sm:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              aria-label={t('browseUsed.ariaNext')}
              onClick={() => scrollCarousel(featuredRef, 1)}
              className="hidden sm:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div
              ref={featuredRef}
              className="flex gap-4 overflow-x-auto pb-2 px-0 sm:px-12 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {featured.map((bike) => (
                <Link
                  key={bike.id}
                  to={listingPublicHref(bike)}
                  className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:ring-[#233D7B]/30 transition block"
                >
                  <div className="relative h-40 bg-gray-50">
                    <ImageWithFallback
                      src={resolveMediaUrl(bike.media?.[0]?.path) || FALLBACK_BIKE}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {bike.featured ? (
                      <span className="absolute top-2 left-2 rounded bg-[#C4161C] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                        {t('homeFeatured.badge')}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">{bike.title}</h3>
                    <p className="text-[#3EB549] font-bold mt-1">{formatMoney(bike.price, bike.currency)}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {bike.location_city || '—'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-[#f5f6f8] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.popularTitle')}</h2>

          <div className="relative">
            <button
              type="button"
              aria-label={t('browseUsed.ariaPrev')}
              onClick={() => scrollCarousel(popularRef, -1)}
              className="hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              aria-label={t('browseUsed.ariaNext')}
              onClick={() => scrollCarousel(popularRef, 1)}
              className="hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div
              ref={popularRef}
              className="flex gap-4 overflow-x-auto pb-2 px-0 md:px-12 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {popularBlocks.map((block) => {
                const main = block.listings[0];
                const thumbs = block.listings.slice(1, 4);
                const href = listingsBikeQs({ q: block.q });
                return (
                  <Link
                    key={block.q}
                    to={href}
                    className="min-w-[260px] sm:min-w-[280px] snap-start shrink-0 rounded-xl bg-white p-3 ring-1 ring-gray-200 shadow-sm hover:shadow-md transition block"
                  >
                    <div className="relative h-36 rounded-lg bg-gray-50 overflow-hidden mb-2">
                      {main ? (
                        <ImageWithFallback
                          src={resolveMediaUrl(main.media?.[0]?.path) || FALLBACK_BIKE}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <TileIcon name="motorbike" className="h-12 w-12 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      {thumbs.map((row) => (
                        <div key={row.id} className="h-10 flex-1 rounded overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                          <ImageWithFallback
                            src={resolveMediaUrl(row.media?.[0]?.path) || FALLBACK_BIKE}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 3 - thumbs.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-10 flex-1 rounded bg-gray-100 ring-1 ring-gray-100" />
                      ))}
                    </div>
                    <p className="text-[#233D7B] font-semibold text-sm">{block.label}</p>
                    <p className="text-[#3EB549] text-xs font-semibold mt-1">
                      {t('usedBikesLanding.listingsCount', { count: block.total })}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.byMakeTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(USED_BIKE_MAKE_MODELS).map(([make, models]) => {
              const logo = USED_BIKE_MAKE_LOGO_URLS[make] ?? null;
              return (
              <div key={make} className="rounded-xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="h-14 w-14 rounded-full bg-white ring-2 ring-gray-200 flex items-center justify-center mb-2 overflow-hidden p-1.5">
                    {logo ? (
                      <ImageWithFallback src={logo} alt="" className="max-h-10 max-w-[88%] object-contain" />
                    ) : (
                      <img src={USED_BIKE_MAKE_FALLBACK_ICON} alt="" className="h-9 w-9 object-contain opacity-80" loading="lazy" />
                    )}
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{make}</p>
                </div>
                <ul className="space-y-1 border-t border-gray-200 pt-3">
                  {models.map((m) => {
                    const q = `${make} ${m}`;
                    return (
                      <li key={q}>
                        <Link to={listingsBikeQs({ q })} className="text-xs text-gray-700 hover:text-[#C4161C] block py-0.5">
                          {m}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-[#f5f6f8] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.byCcTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BIKE_ENGINE_CC_TILES.map((item) => (
              <Link
                key={item.labelKey}
                to={listingsBikeQs({ q: item.q })}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-4 px-2 text-center shadow-sm hover:border-[#233D7B]/50 hover:shadow transition min-h-[88px]"
              >
                <TileIcon name={item.icon} className="h-8 w-8 mb-1 opacity-85" />
                <span className="text-sm font-bold text-gray-900">{t(item.labelKey)}</span>
                <span className="text-[11px] text-gray-500 mt-1">{t('usedBikesLanding.bikesSuffix')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.byCategoryTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {BIKE_CATEGORY_TILES.map((item) => (
              <Link
                key={item.labelKey}
                to={listingsBikeQs({ q: item.q })}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-[#fafafa] px-2 py-5 text-center hover:bg-white hover:border-[#233D7B]/40 hover:shadow-sm transition min-h-[104px]"
              >
                <TileIcon name={item.icon} className="h-9 w-9 mb-2 opacity-[0.88]" />
                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-snug">{t(item.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-[#f5f6f8] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.byBodyTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {BIKE_BODY_TYPE_TILES.map((item) => (
              <Link
                key={item.labelKey}
                to={listingsBikeQs({ q: item.q })}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-2 py-5 text-center hover:border-[#233D7B]/40 hover:shadow-sm transition min-h-[104px]"
              >
                <TileIcon name={item.icon} className="h-9 w-9 mb-2 opacity-[0.88]" />
                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-snug">{t(item.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.byCityTitle')}</h2>
          <div className="relative">
            <button
              type="button"
              aria-label={t('browseUsed.ariaPrev')}
              disabled={safeCitySlide <= 0}
              onClick={() => setCitySlide((p) => Math.max(0, p - 1))}
              className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow hidden sm:flex ${
                safeCitySlide <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label={t('browseUsed.ariaNext')}
              disabled={safeCitySlide >= cityPageCount - 1}
              onClick={() => setCitySlide((p) => Math.min(cityPageCount - 1, p + 1))}
              className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow hidden sm:flex ${
                safeCitySlide >= cityPageCount - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="overflow-hidden px-0 sm:px-11">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${safeCitySlide * 100}%)` }}
              >
                {cityPages.map((page, pi) => (
                  <div key={pi} className="min-w-full shrink-0">
                    <div className="columns-2 sm:columns-3 md:columns-4 gap-x-6 gap-y-1">
                      {page.map((c) => (
                        <Link
                          key={c}
                          to={listingsBikeQs({ city: c })}
                          className="block py-1.5 text-sm text-[#233D7B] hover:text-[#C4161C] hover:underline break-inside-avoid"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-[#f5f6f8] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t('usedBikesLanding.byBudgetTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {BIKE_BUDGET_BANDS.map((b) => (
              <Link
                key={b.labelKey}
                to={listingsBikeQs({ max_price: b.max_price })}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#233D7B] text-center hover:border-[#233D7B]/50 hover:shadow-sm transition"
              >
                <TileIcon name="coin" className="h-6 w-6 mb-1 opacity-85" />
                {t(b.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 prose prose-sm sm:prose-base prose-headings:text-gray-900 prose-a:text-[#233D7B]">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('usedBikesLanding.seoHeading')}</h2>
          <p className="text-gray-700 leading-relaxed">{t('usedBikesLanding.seoP1')}</p>
          <h3 className="text-lg font-bold mt-6 mb-2">{t('usedBikesLanding.seoSub1')}</h3>
          <p className="text-gray-700 leading-relaxed">{t('usedBikesLanding.seoP2')}</p>
          <h3 className="text-lg font-bold mt-6 mb-2">{t('usedBikesLanding.seoSub2')}</h3>
          <p className="text-gray-700 leading-relaxed">{t('usedBikesLanding.seoP3')}</p>
          <p className="text-gray-700 leading-relaxed mt-4">{t('usedBikesLanding.seoP4')}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
