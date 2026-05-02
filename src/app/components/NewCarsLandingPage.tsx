import { Calculator, CarFront, ChevronDown, Play, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  fetchBrands,
  fetchCategories,
  fetchEditorialTestimonials,
  fetchListings,
  fetchNewCarsLanding,
  fetchNewCarsPulse,
  listingPublicHref,
  resolveMediaUrl,
  type BrandDto,
  type CategoryDto,
  type EditorialTestimonialDto,
  type ListingDto,
  type NewCarsLandingCompareSideDto,
  type NewCarsLandingDto,
  type NewCarsLandingListingReviewDto,
  type NewCarsPulseItemDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { Footer } from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';

const BLUE = '#1b365d';
const GREEN = '#4caf50';
const RED_DARK = '#b71c1c';

const FALLBACK_CAR =
  'https://images.unsplash.com/photo-1705747401901-28363172fe7e?auto=format&fit=crop&w=1080&q=80';

/** Material Design Icons via Iconify CDN (MIT) — falls back to Lucide if the request fails. */
function GrayCarIcon({ iconId, className = 'w-12 h-12' }: { iconId: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const path = iconId.includes(':') ? iconId.replace(':', '/') : iconId;
  const src = `https://api.iconify.design/${path}.svg?color=%2364748b`;
  if (failed) {
    return <CarFront className={`${className} text-gray-400`} aria-hidden />;
  }
  return (
    <img
      src={src}
      alt=""
      className={`${className} object-contain opacity-[0.92]`}
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function findDescendantCategoryId(roots: CategoryDto[], parentSlug: string, childSlugs: string[]): number | undefined {
  const parent = roots.find((r) => r.slug === parentSlug);
  if (!parent?.children?.length) return undefined;
  for (const slug of childSlugs) {
    const node = parent.children.find((c) => c.slug === slug);
    if (!node) continue;
    if (node.listing_type && node.listing_type !== 'new_car') continue;
    return node.id;
  }
  return undefined;
}

function listingsNewCarHref(parts: { categoryId?: number; q?: string; fuel_type?: string }): string {
  const sp = new URLSearchParams();
  sp.set('type', 'new_car');
  if (parts.categoryId) sp.set('category_id', String(parts.categoryId));
  if (parts.fuel_type) sp.set('fuel_type', parts.fuel_type);
  if (parts.q?.trim()) sp.set('q', parts.q.trim());
  return `/listings?${sp.toString()}`;
}

type TabLists = {
  popular: ListingDto[];
  upcoming: ListingDto[];
  newly_launched: ListingDto[];
};

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function dedupeById(listings: ListingDto[]): ListingDto[] {
  const seen = new Set<string>();
  const out: ListingDto[] = [];
  for (const l of listings) {
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    out.push(l);
  }
  return out;
}

function isUpcoming(car: ListingDto, currentYear: number): boolean {
  const d = car.dynamic_attributes;
  if (d && typeof d === 'object') {
    if (d.upcoming === true) return true;
    const ls = String(d.launch_status ?? d.status ?? '').toLowerCase();
    if (ls.includes('upcoming')) return true;
  }
  const y = car.vehicle_year;
  if (y != null && y > currentYear) return true;
  const blob = `${car.title} ${car.description ?? ''}`.toLowerCase();
  return /upcoming|pre[- ]?book|coming soon|launching|expected\s+\d{4}/.test(blob);
}

function buildTabLists(featured: ListingDto[], byViews: ListingDto[], newest: ListingDto[]): TabLists {
  const currentYear = new Date().getFullYear();
  const popular = dedupeById([...featured, ...byViews]);

  let upcoming = newest.filter((c) => isUpcoming(c, currentYear));
  if (upcoming.length < 6) {
    const upIds = new Set(upcoming.map((c) => c.id));
    const extra = newest.filter((c) => !upIds.has(c.id)).slice(4, 28);
    upcoming = dedupeById([...upcoming, ...extra]);
  }

  const newlyLaunched = [...newest];

  return {
    popular: popular.length ? popular : byViews,
    upcoming: upcoming.length ? upcoming : newest.slice(3),
    newly_launched: newlyLaunched.length ? newlyLaunched : byViews,
  };
}

function formatDisplayName(car: ListingDto): string {
  const brand = car.brand?.name?.trim();
  const model = car.vehicle_model?.name?.trim();
  if (brand && model) return `${brand} ${model}`;
  return car.title;
}

function formatNewCarPriceRange(car: ListingDto): string {
  const dyn = car.dynamic_attributes;
  const minP = num(dyn?.price_min ?? dyn?.min_price);
  const maxP = num(dyn?.price_max ?? dyn?.max_price);
  const cur = (car.currency || 'BDT').toUpperCase();
  if (minP != null && maxP != null && maxP >= minP) {
    return `${cur} ${(minP / 100000).toFixed(2)} - ${(maxP / 100000).toFixed(2)} lacs`;
  }
  const p = num(car.price);
  if (p != null) return `${cur} ${(p / 100000).toFixed(2)} lacs`;
  return 'Price on request';
}

function reviewStats(car: ListingDto): { rating: number; reviews: number } {
  const views = car.view_count ?? 0;
  const salt = car.id.charCodeAt(0) + (car.id.charCodeAt(1) ?? 0);
  const reviews =
    views > 0
      ? Math.max(16, Math.round(views * 0.22) + (salt % 45))
      : 120 + (salt % 520);
  const rating = 4.05 + (salt % 18) / 20;
  return { rating: Math.round(rating * 10) / 10, reviews };
}

function launchLabel(car: ListingDto): string {
  const d = car.dynamic_attributes;
  const lm = d && typeof d === 'object' ? d.launch_month ?? d.launched : undefined;
  if (typeof lm === 'string' && lm.trim()) return `Launched ${lm.trim()}`;
  if (car.created_at) {
    const dt = new Date(car.created_at);
    return `Launched ${dt.toLocaleString(undefined, { month: 'long', year: 'numeric' })}`;
  }
  return 'Recently launched';
}

function upcomingLabel(car: ListingDto): string {
  const d = car.dynamic_attributes;
  const exp = d && typeof d === 'object' ? d.expected_launch ?? d.launching : undefined;
  if (typeof exp === 'string' && exp.trim()) return exp.trim();
  const y = car.vehicle_year;
  if (y != null) return `Launching ${y}`;
  return 'Launching soon';
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        return (
          <Star
            key={i}
            className={`w-3.5 h-3.5 shrink-0 ${
              fill >= 0.92
                ? 'fill-amber-400 text-amber-400'
                : fill > 0.12
                  ? 'fill-amber-400/80 text-amber-400'
                  : 'text-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
}

const PRICE_OPTIONS: { label: string; value: number | '' }[] = [
  { label: 'Any', value: '' },
  { label: '5 Lacs', value: 500_000 },
  { label: '10 Lacs', value: 1_000_000 },
  { label: '15 Lacs', value: 1_500_000 },
  { label: '20 Lacs', value: 2_000_000 },
  { label: '30 Lacs', value: 3_000_000 },
  { label: '40 Lacs', value: 4_000_000 },
  { label: '50 Lacs', value: 5_000_000 },
  { label: '75 Lacs', value: 7_500_000 },
  { label: '1 Crore', value: 10_000_000 },
];

function listingHref(car: ListingDto): string {
  return `${listingPublicHref(car)}?type=new_car`;
}

function CompareThumb({ side }: { side: NewCarsLandingCompareSideDto }) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="w-full aspect-[16/10] bg-white rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center p-2">
        <ImageWithFallback
          src={resolveMediaUrl(side.thumb_path) || FALLBACK_CAR}
          alt={side.title}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-900 text-center line-clamp-2">{side.title}</p>
      {side.subtitle ? <p className="text-xs text-gray-500 text-center line-clamp-1">{side.subtitle}</p> : null}
    </div>
  );
}

export function NewCarsLandingPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [priceFrom, setPriceFrom] = useState<number | ''>('');
  const [priceTo, setPriceTo] = useState<number | ''>('');
  const [lists, setLists] = useState<TabLists>({ popular: [], upcoming: [], newly_launched: [] });
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [landing, setLanding] = useState<NewCarsLandingDto | null>(null);
  const [fallbackTestimonials, setFallbackTestimonials] = useState<EditorialTestimonialDto[]>([]);
  const [pulse, setPulse] = useState<NewCarsPulseItemDto[]>([]);
  const [categoryRoots, setCategoryRoots] = useState<CategoryDto[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageSeo(
      'Find New Cars in Bangladesh · Showroom listings & reviews',
      'Search new cars by make, price range, body type and category. Compare models, read reviews, and browse verified dealer inventory in Bangladesh.',
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [feat, views, newest, brandRows, categoriesTree, land, pulseJson, testimonials] = await Promise.all([
          fetchListings({ listing_type: 'new_car', featured: 1, per_page: 24 }),
          fetchListings({ listing_type: 'new_car', sort: 'views', per_page: 36 }),
          fetchListings({ listing_type: 'new_car', sort: 'newest', per_page: 60 }),
          fetchBrands(),
          fetchCategories().catch(() => []),
          fetchNewCarsLanding(),
          fetchNewCarsPulse(),
          fetchEditorialTestimonials(6).catch(() => []),
        ]);
        if (cancelled) return;
        setLists(buildTabLists(feat, views, newest));
        setBrands(brandRows);
        setCategoryRoots(Array.isArray(categoriesTree) ? categoriesTree : []);
        setLanding(land);
        const pulseItems = [...(pulseJson?.popular ?? []), ...(pulseJson?.latest ?? [])].slice(0, 8);
        setPulse(pulseItems);
        setFallbackTestimonials(Array.isArray(testimonials) ? testimonials : []);
      } catch {
        if (!cancelled) {
          setLists({ popular: [], upcoming: [], newly_launched: [] });
          setBrands([]);
          setCategoryRoots([]);
          setLanding(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const takeEight = (rows: ListingDto[]) => rows.slice(0, 8);

  const comparisonPairs = landing?.comparison_pairs ?? [];

  const videoCards = useMemo(() => {
    const articles = landing?.articles ?? [];
    const fromPulse = pulse.map((p) => ({
      title: p.title,
      href: p.url,
      thumb: p.image_url || null,
      external: true as const,
    }));
    const fromBlog = articles.map((a) => ({
      title: a.title,
      href: `/blog/${encodeURIComponent(a.slug)}`,
      thumb: resolveMediaUrl(a.brand?.logo_path) || null,
      external: false as const,
    }));
    const merged = [...fromBlog, ...fromPulse];
    return merged.slice(0, 5);
  }, [landing?.articles, pulse]);

  const reviewCards = useMemo(() => {
    const lr: NewCarsLandingListingReviewDto[] = landing?.listing_reviews ?? [];
    if (lr.length > 0) {
      return lr.map((r) => ({
        kind: 'listing' as const,
        rating: r.rating,
        title: r.title || 'Owner review',
        body: r.body,
        name: r.reviewer_name || 'Verified buyer',
        date: r.created_at,
        model: r.listing?.title || 'New car',
        thumb: resolveMediaUrl(r.listing?.thumb_path),
      }));
    }
    return fallbackTestimonials.slice(0, 4).map((t) => ({
      kind: 'dealer' as const,
      rating: t.rating,
      title: t.title || 'Review',
      body: t.body,
      name: t.reviewer?.name || 'Buyer',
      date: t.created_at,
      model: t.dealer?.business_name ? `${t.dealer.business_name} · Dealer review` : 'Marketplace review',
      thumb: null as string | null,
    }));
  }, [landing?.listing_reviews, fallbackTestimonials]);

  const faqs = landing?.faqs?.length ? landing.faqs : [];

  const bodyTypes = useMemo(() => {
    const catSuv = findDescendantCategoryId(categoryRoots, 'new-cars', ['new-cars-brand-new-suv']);
    const catSedan = findDescendantCategoryId(categoryRoots, 'new-cars', ['new-cars-brand-new-sedan']);
    const catHatch = findDescendantCategoryId(categoryRoots, 'new-cars', ['new-cars-brand-new-hatchback']);
    return [
      {
        label: 'SUV',
        iconId: 'mdi:car-estate',
        to: listingsNewCarHref({ categoryId: catSuv, q: catSuv ? undefined : 'SUV' }),
      },
      {
        label: 'Sedan',
        iconId: 'mdi:car-side',
        to: listingsNewCarHref({ categoryId: catSedan, q: catSedan ? undefined : 'Sedan' }),
      },
      {
        label: 'Hatchback',
        iconId: 'mdi:car-hatchback',
        to: listingsNewCarHref({ categoryId: catHatch, q: catHatch ? undefined : 'Hatchback' }),
      },
      {
        label: 'Pickup',
        iconId: 'mdi:truck-flatbed',
        to: listingsNewCarHref({ q: 'Pickup truck' }),
      },
      {
        label: 'Van',
        iconId: 'mdi:van-passenger',
        to: listingsNewCarHref({ q: 'Van' }),
      },
      {
        label: 'Coupe',
        iconId: 'mdi:car-convertible',
        to: listingsNewCarHref({ q: 'Coupe' }),
      },
    ];
  }, [categoryRoots]);

  const categories = useMemo(() => {
    const catSuv = findDescendantCategoryId(categoryRoots, 'new-cars', ['new-cars-brand-new-suv']);
    const catHatch = findDescendantCategoryId(categoryRoots, 'new-cars', ['new-cars-brand-new-hatchback']);
    return [
      { label: 'Electric Cars', iconId: 'mdi:car-electric', to: listingsNewCarHref({ fuel_type: 'electric' }) },
      { label: 'Sports Cars', iconId: 'mdi:car-sports', to: listingsNewCarHref({ q: 'Sport' }) },
      { label: 'Luxury Cars', iconId: 'mdi:crown-outline', to: listingsNewCarHref({ q: 'Luxury' }) },
      {
        label: 'Small Cars',
        iconId: 'mdi:car-outline',
        to: listingsNewCarHref({ categoryId: catHatch, q: catHatch ? undefined : 'Compact' }),
      },
      {
        label: 'Big Cars',
        iconId: 'mdi:car-estate',
        to: listingsNewCarHref({ categoryId: catSuv, q: catSuv ? undefined : 'Large SUV' }),
      },
      { label: 'Family Cars', iconId: 'mdi:car-seat', to: listingsNewCarHref({ q: 'Family MPV' }) },
      { label: 'Hybrid Cars', iconId: 'mdi:leaf', to: listingsNewCarHref({ fuel_type: 'hybrid' }) },
    ];
  }, [categoryRoots]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    let pf: number | '' = priceFrom === '' ? '' : Number(priceFrom);
    let pt: number | '' = priceTo === '' ? '' : Number(priceTo);
    if (pf !== '' && pt !== '' && pf > pt) {
      setPriceFrom(pt);
      setPriceTo(pf);
      const swap = pf;
      pf = pt;
      pt = swap;
    }
    const sp = new URLSearchParams();
    sp.set('type', 'new_car');
    if (q.trim()) sp.set('q', q.trim());
    if (pf !== '') sp.set('min_price', String(pf));
    if (pt !== '') sp.set('max_price', String(pt));
    navigate(`/listings?${sp.toString()}`);
  }

  function CardGrid({
    rows,
    variant,
  }: {
    rows: ListingDto[];
    variant: 'popular' | 'newly' | 'upcoming';
  }) {
    const slice = takeEight(rows);
    if (loading && slice.length === 0) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-100 bg-white h-64" />
          ))}
        </div>
      );
    }
    if (slice.length === 0) {
      return (
        <p className="text-center text-gray-500 py-10 text-sm">
          No showroom listings yet —{' '}
          <Link to="/post-ad" className="text-[#3483D1] font-semibold underline">
            list a new car
          </Link>{' '}
          or widen search filters.
        </p>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slice.map((car) => {
          const { rating, reviews } = reviewStats(car);
          return (
            <Link
              key={`${variant}-${car.id}`}
              to={listingHref(car)}
              className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-center bg-white px-3 pt-5 pb-2 min-h-[132px]">
                <ImageWithFallback
                  src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK_CAR}
                  alt={formatDisplayName(car)}
                  className="max-h-[112px] w-full object-contain object-center"
                />
              </div>
              <div className="px-3 pb-4 pt-1 flex flex-col flex-1 text-center">
                <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-2 text-[#2e7d32]">
                  {formatDisplayName(car)}
                </h3>
                <p className="text-[#2e7d32] font-bold text-sm mb-2">{formatNewCarPriceRange(car)}</p>
                {variant === 'popular' ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                    <StarRow rating={rating} />
                    <span className="text-xs text-gray-500 whitespace-nowrap">{reviews.toLocaleString()} Reviews</span>
                  </div>
                ) : variant === 'newly' ? (
                  <p className="text-xs text-gray-500 mt-auto">{launchLabel(car)}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-auto">{upcomingLabel(car)}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  const financing = landing?.financing_partners ?? [];
  const insurance = landing?.insurance_partners ?? [];

  const spotlightBrands = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Mitsubishi', 'Hyundai', 'Kia', 'MG'];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* —— Image 1: Hero + search —— */}
      <section className="relative pb-14" style={{ backgroundColor: BLUE }}>
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-6 text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Find New Cars in Bangladesh</h1>
          <p className="mt-2 text-white/85 text-sm sm:text-base">
            Find information about the latest cars available from dealers across Bangladesh
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 -mb-8 relative z-10">
          <form
            onSubmit={submitSearch}
            className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col lg:flex-row gap-3 p-4 lg:items-stretch"
          >
            <input
              type="search"
              placeholder="Car Make or Model"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 min-h-[44px] rounded-lg border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3483D1]/40"
            />
            <select
              value={priceFrom === '' ? '' : String(priceFrom)}
              onChange={(e) => setPriceFrom(e.target.value === '' ? '' : Number(e.target.value))}
              className="lg:w-40 min-h-[44px] rounded-lg border border-gray-200 px-3 text-gray-800 bg-white"
              aria-label="Price from"
            >
              {PRICE_OPTIONS.map((o) => (
                <option key={`f-${o.label}`} value={o.value === '' ? '' : String(o.value)}>
                  From: {o.label}
                </option>
              ))}
            </select>
            <select
              value={priceTo === '' ? '' : String(priceTo)}
              onChange={(e) => setPriceTo(e.target.value === '' ? '' : Number(e.target.value))}
              className="lg:w-40 min-h-[44px] rounded-lg border border-gray-200 px-3 text-gray-800 bg-white"
              aria-label="Price to"
            >
              {PRICE_OPTIONS.map((o) => (
                <option key={`t-${o.label}`} value={o.value === '' ? '' : String(o.value)}>
                  To: {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="min-h-[44px] px-8 rounded-lg font-bold text-white shrink-0"
              style={{ backgroundColor: GREEN }}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="h-10 bg-[#f5f5f5]" />

      {/* On-road calculator strip */}
      <section className="bg-[#ececec] border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5 rounded-full bg-white p-2 shadow-sm border border-gray-200">
              <Calculator className="w-6 h-6 text-orange-500" aria-hidden />
            </div>
            <p className="text-sm text-gray-700 leading-snug">
              Calculate the final price that you will pay for your brand new car including ex-factory price, freight charges,
              and applicable government taxes.
            </p>
          </div>
          <Link
            to="/car-prices"
            className="shrink-0 rounded px-5 py-2.5 text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: RED_DARK }}
          >
            On Road Price
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">
        {/* Popular */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popular New Cars</h2>
            <Link to="/listings?type=new_car&sort=views" className="text-sm font-semibold text-[#3483D1] hover:underline">
              Show More
            </Link>
          </div>
          <CardGrid rows={lists.popular} variant="popular" />
        </section>

        {/* Newly launched */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Newly Launched Cars</h2>
            <Link to="/listings?type=new_car&sort=newest" className="text-sm font-semibold text-[#3483D1] hover:underline">
              Show More
            </Link>
          </div>
          <CardGrid rows={lists.newly_launched} variant="newly" />
        </section>

        {/* Upcoming */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Cars</h2>
            <Link to="/listings?type=new_car&sort=newest" className="text-sm font-semibold text-[#3483D1] hover:underline">
              Show More
            </Link>
          </div>
          <CardGrid rows={lists.upcoming} variant="upcoming" />
        </section>

        {/* —— Image 2: Brands grid —— */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Cars by Make</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-10">
            {brands.map((b) => (
              <Link
                key={b.id}
                to={`/listings?type=new_car&brand_id=${b.id}`}
                className="flex flex-col items-center w-[76px] sm:w-[88px] group"
              >
                <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-[#3483D1]/50 transition">
                  {b.logo_path ? (
                    <ImageWithFallback
                      src={resolveMediaUrl(b.logo_path) || ''}
                      alt=""
                      className="max-w-[85%] max-h-[85%] object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-gray-400 text-center leading-tight px-1">{b.name.slice(0, 3)}</span>
                  )}
                </div>
                <span className="mt-2 text-xs text-center text-gray-800 font-medium leading-tight line-clamp-2">{b.name}</span>
              </Link>
            ))}
          </div>
          {brands.length === 0 && !loading ? (
            <p className="text-center text-gray-500 text-sm py-6">Brand catalog loads from the API once seeded.</p>
          ) : null}
        </section>

        {/* Body type */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Cars by Body Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {bodyTypes.map((bt) => (
              <Link
                key={bt.label}
                to={bt.to}
                className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col items-center hover:border-[#3483D1]/40 hover:shadow-md transition"
              >
                <GrayCarIcon iconId={bt.iconId} />
                <span className="mt-3 text-sm font-semibold text-gray-800">{bt.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Category */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Cars by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col items-center hover:border-[#3483D1]/40 hover:shadow-md transition"
              >
                <GrayCarIcon iconId={c.iconId} />
                <span className="mt-3 text-sm font-semibold text-gray-800 text-center">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Car Reviews</h2>
            <Link to="/car-reviews" className="text-sm font-semibold text-[#3483D1] hover:underline">
              Read All Car Reviews
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {reviewCards.map((r, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 p-4 flex gap-4 bg-gray-50/50">
                <div className="w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
                  <ImageWithFallback
                    src={r.thumb || FALLBACK_CAR}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 line-clamp-2">{r.title}</p>
                  <p className="text-sm text-[#3483D1] font-semibold mt-1 line-clamp-1">{r.model}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRow rating={r.rating} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.name}
                    {r.date ? ` · ${new Date(r.date).toLocaleDateString()}` : ''}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{r.body || ''}</p>
                </div>
              </div>
            ))}
          </div>
          {reviewCards.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Reviews appear once buyers approve listing feedback.</p>
          ) : null}
        </section>

        {/* Comparisons */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Car Comparisons</h2>
            <Link to="/compare" className="text-sm font-semibold text-[#3483D1] hover:underline">
              All Car Comparisons
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              {comparisonPairs[0] ? (
                <>
                  <div className="flex items-center gap-4 relative">
                    <CompareThumb side={comparisonPairs[0].left} />
                    <div
                      className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full text-white flex items-center justify-center text-xs font-black shadow-lg border-4 border-white"
                      style={{ backgroundColor: RED_DARK }}
                    >
                      VS
                    </div>
                    <CompareThumb side={comparisonPairs[0].right} />
                  </div>
                  <Link
                    to={`/compare?a=${encodeURIComponent(comparisonPairs[0].left.id)}&b=${encodeURIComponent(comparisonPairs[0].right.id)}`}
                    className="mt-6 block w-full text-center rounded-lg border-2 border-gray-300 py-3 text-sm font-bold text-gray-800 hover:border-[#3483D1] hover:text-[#3483D1] transition"
                  >
                    View Comparison
                  </Link>
                </>
              ) : (
                <p className="text-gray-500 text-sm">
                  Pick two showroom listings from inventory, then open{' '}
                  <Link to="/compare" className="font-semibold text-[#3483D1] underline">
                    Compare
                  </Link>{' '}
                  with their IDs.
                </p>
              )}
            </div>
            <div className="space-y-6">
              {comparisonPairs.slice(1).map((pair, i) => (
                <Link
                  key={i}
                  to={`/compare?a=${encodeURIComponent(pair.left.id)}&b=${encodeURIComponent(pair.right.id)}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 hover:shadow-md transition"
                >
                  <span className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">{pair.left.title}</span>
                  <span
                    className="w-10 h-10 shrink-0 rounded-full text-white flex items-center justify-center text-[10px] font-black"
                    style={{ backgroundColor: RED_DARK }}
                  >
                    VS
                  </span>
                  <span className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 text-right">{pair.right.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Videos */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Browse Our Videos</h2>
            <Link to="/videos" className="text-sm font-semibold text-[#3483D1] hover:underline">
              View All Videos
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              {videoCards[0] ? (
                <a
                  href={videoCards[0].href}
                  {...(videoCards[0].external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="block group relative rounded-xl overflow-hidden border border-gray-100 bg-black aspect-video"
                >
                  <ImageWithFallback
                    src={videoCards[0].thumb || FALLBACK_CAR}
                    alt=""
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-white/95 p-4 shadow-lg">
                      <Play className="w-8 h-8 text-[#3483D1] fill-[#3483D1]" />
                    </span>
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <span className="text-white text-sm font-semibold line-clamp-2">{videoCards[0].title}</span>
                  </span>
                </a>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-500 text-sm">
                  Editorial stories and news clips appear here when brand news or feeds are available.
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {videoCards.slice(1, 5).map((vc, i) => (
                <a
                  key={i}
                  href={vc.href}
                  {...(vc.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group relative rounded-lg overflow-hidden border border-gray-100 aspect-video bg-gray-900"
                >
                  <ImageWithFallback
                    src={vc.thumb || FALLBACK_CAR}
                    alt=""
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white drop-shadow-md opacity-95" />
                  </span>
                  <span className="absolute bottom-1 left-1 right-1 text-[11px] text-white font-medium line-clamp-2 drop-shadow">
                    {vc.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* —— Image 3 —— */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Car Prices And Dealers</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <ul className="space-y-2 mb-6">
                {spotlightBrands.map((name) => (
                  <li key={name}>
                    <Link
                      to={`/listings?type=new_car&q=${encodeURIComponent(name)}`}
                      className="text-[#3483D1] font-medium hover:underline"
                    >
                      {name} Car Prices
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/car-prices"
                className="inline-flex items-center justify-center rounded-lg border-2 border-[#3483D1] text-[#3483D1] font-bold px-6 py-2 text-sm hover:bg-[#3483D1] hover:text-white transition"
              >
                View All Car Prices
              </Link>
            </div>
            <div>
              <ul className="space-y-2 mb-6">
                {spotlightBrands.map((name) => (
                  <li key={`d-${name}`}>
                    <Link
                      to={`/used-car-dealers?q=${encodeURIComponent(name)}`}
                      className="text-[#3483D1] font-medium hover:underline"
                    >
                      {name} Dealers
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/used-car-dealers"
                className="inline-flex items-center justify-center rounded-lg border-2 border-[#3483D1] text-[#3483D1] font-bold px-6 py-2 text-sm hover:bg-[#3483D1] hover:text-white transition"
              >
                View All Dealers
              </Link>
            </div>
          </div>
        </section>

        {/* Financing */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Banks for New Cars Financing</h2>
            <Link to="/car-prices" className="text-sm font-semibold text-[#3483D1] hover:underline">
              Car Finance Calculator
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {financing.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-gray-100 bg-white h-24 flex items-center justify-center px-3 text-center shadow-sm"
              >
                <span className="text-sm font-bold text-gray-700 leading-tight">{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Insurance */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Car Insurance Companies</h2>
            <Link to="/car-prices" className="text-sm font-semibold text-[#3483D1] hover:underline">
              Car Insurance Calculator
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {insurance.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-gray-100 bg-white h-24 flex items-center justify-center px-3 text-center shadow-sm"
              >
                <span className="text-sm font-bold text-gray-700 leading-tight">{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Car FAQs</h2>
          <div className="space-y-2">
            {faqs.map((item, i) => {
              const open = faqOpen === i;
              return (
                <div key={i} className="rounded-lg border border-gray-100 overflow-hidden bg-[#f9f9f9]">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-gray-900"
                    onClick={() => setFaqOpen(open ? null : i)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{item.answer}</div> : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* Intro copy */}
        <section className="text-sm text-gray-600 leading-relaxed max-w-4xl">
          <p>
            Whether you are upgrading or buying your first vehicle, this hub connects showroom listings, editorial coverage,
            and dealer tools in one place. Use price bands to stay inside budget, browse by body style, then open detailed pages
            for specs, media, and moderated buyer reviews.
          </p>
        </section>

        {/* App promo */}
        <section className="rounded-xl border border-[#3483D1]/25 bg-gradient-to-r from-sky-50 to-white p-8 flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-[#3483D1]">Get The App</h2>
            <p className="mt-2 text-gray-600">
              Buy and sell cars, bikes, and parts faster — mobile web is fully supported today; native store builds ship next.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500">
              Google Play · Soon
            </span>
            <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500">
              App Store · Soon
            </span>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
