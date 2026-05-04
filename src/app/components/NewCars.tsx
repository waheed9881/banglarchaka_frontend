import { ChevronLeft, ChevronRight, Globe2, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  fetchListings,
  fetchNewCarsPulse,
  resolveMediaUrl,
  type ListingDto,
  type NewCarsPulseDto,
  type NewCarsPulseItemDto,
} from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1705747401901-28363172fe7e?auto=format&fit=crop&w=1080&q=80';

const ACCENT = '#3483D1';

type TabKey = 'popular' | 'upcoming' | 'newly_launched';

type CarouselRow =
  | { kind: 'listing'; car: ListingDto }
  | { kind: 'news'; item: NewCarsPulseItemDto };

function pulseSliceForTab(tab: TabKey, pulse: NewCarsPulseDto | null): NewCarsPulseItemDto[] {
  if (!pulse) return [];
  if (tab === 'newly_launched') return pulse.latest;
  if (tab === 'popular') return pulse.popular;
  return pulse.upcoming;
}

/** Mix showroom listings with BD automotive headlines from RSS (internet pulse). */
function interleaveListingsAndPulse(listings: ListingDto[], headlines: NewCarsPulseItemDto[]): CarouselRow[] {
  const out: CarouselRow[] = [];
  const n = Math.max(listings.length, headlines.length);
  for (let i = 0; i < n; i++) {
    if (i < listings.length) out.push({ kind: 'listing', car: listings[i] });
    if (i < headlines.length) out.push({ kind: 'news', item: headlines[i] });
  }
  return out;
}

function formatPulseWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Recently';
  if (hrs < 72) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatDisplayName(car: ListingDto): string {
  const brand = car.brand?.name?.trim();
  const model = car.vehicle_model?.name?.trim();
  if (brand && model) return `${brand} ${model}`;
  return car.title;
}

function formatNewCarPriceLakh(car: ListingDto): string {
  const dyn = car.dynamic_attributes;
  const minP = num(dyn?.price_min ?? dyn?.min_price);
  const maxP = num(dyn?.price_max ?? dyn?.max_price);
  if (minP != null && maxP != null && maxP >= minP) {
    return `৳${(minP / 100000).toFixed(2)} - ${(maxP / 100000).toFixed(2)} Lac`;
  }
  const p = num(car.price);
  if (p != null) return `৳${(p / 100000).toFixed(2)} Lac`;
  return 'Price on request';
}

function reviewStats(car: ListingDto): { rating: number; reviews: number } {
  const views = car.view_count ?? 0;
  const salt = car.id.charCodeAt(0) + (car.id.charCodeAt(1) ?? 0);
  const reviews =
    views > 0
      ? Math.max(16, Math.round(views * 0.22) + (salt % 45))
      : 120 + (salt % 520);
  const rating = 4.05 + ((salt % 18) / 20);
  return { rating: Math.round(rating * 10) / 10, reviews };
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

function buildTabLists(
  featured: ListingDto[],
  byViews: ListingDto[],
  newest: ListingDto[],
): Record<TabKey, ListingDto[]> {
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

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'newly_launched', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'upcoming', label: 'Upcoming' },
];

/** How often to pull fresh new_car listings from the API (homepage strip stays current). */
const NEW_CARS_REFRESH_MS = 5 * 60 * 1000;

function NewCarCarouselCardSkeleton() {
  return (
    <div className="snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] min-w-[158px] rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden animate-pulse flex flex-col">
      <div className="min-h-[132px] bg-gray-200 mx-3 mt-4 rounded-md" />
      <div className="px-3 pb-4 pt-3 flex flex-col items-center gap-2 flex-1">
        <div className="h-4 bg-gray-200 rounded-md w-[88%]" />
        <div className="h-4 bg-gray-200 rounded-md w-[52%]" />
        <div className="h-3 bg-gray-200 rounded-md w-[72%] mt-auto" />
      </div>
    </div>
  );
}

export function NewCars() {
  const [tab, setTab] = useState<TabKey>('newly_launched');
  const [lists, setLists] = useState<Record<TabKey, ListingDto[]>>({
    popular: [],
    upcoming: [],
    newly_launched: [],
  });
  const [pulse, setPulse] = useState<NewCarsPulseDto | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fetchGenRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const pull = async () => {
      const gen = ++fetchGenRef.current;
      try {
        const [feat, views, newest, pulseJson] = await Promise.all([
          fetchListings({ listing_type: 'new_car', featured: 1, per_page: 24 }),
          fetchListings({ listing_type: 'new_car', sort: 'views', per_page: 36 }),
          // Primary feed for “Latest”: server sort=newest → newest listings first as they’re approved & live.
          fetchListings({ listing_type: 'new_car', sort: 'newest', per_page: 60 }),
          fetchNewCarsPulse(),
        ]);
        if (cancelled || gen !== fetchGenRef.current) return;
        setLists(buildTabLists(feat, views, newest));
        setPulse(pulseJson);
      } catch {
        if (!cancelled && gen === fetchGenRef.current) {
          setLists({ popular: [], upcoming: [], newly_launched: [] });
          setPulse(null);
        }
      } finally {
        if (!cancelled && gen === fetchGenRef.current) {
          setFeedLoading(false);
        }
      }
    };

    pull();

    const intervalId = window.setInterval(() => {
      pull().catch(() => undefined);
    }, NEW_CARS_REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        pull().catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const activeRows = useMemo(
    () => interleaveListingsAndPulse(lists[tab], pulseSliceForTab(tab, pulse)),
    [lists, tab, pulse],
  );

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector('[data-new-car-card]') as HTMLElement | null;
    const cardW = first?.offsetWidth ?? 260;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || '16') || 16;
    const step = (cardW + gap) * 4 * dir;
    el.scrollBy({ left: step, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [tab]);

  const emptyHint = useMemo(
    () =>
      activeRows.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-sm">No showroom listings or headlines yet. Browse all new cars.</p>
      ) : null,
    [activeRows.length],
  );

  return (
    <section className="py-12 bg-[#f2f3f5] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Cars in Bangladesh</h2>
            <p className="mt-1 text-sm text-gray-500 max-w-3xl">
              Each tab mixes{' '}
              <span className="font-medium text-gray-700">BanglarChaka showroom listings</span> with{' '}
              <span className="font-medium text-gray-700">live Bangladesh automotive headlines</span> from Google News RSS. Our
              server fills in thumbnails from article pages when possible, and matches brand names in headlines to curated car
              photos when not — refreshed automatically while you browse.
            </p>
          </div>
          <Link to="/listings?type=new_car" className="text-sm font-semibold hover:underline shrink-0" style={{ color: ACCENT }}>
            View All New Cars →
          </Link>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-semibold transition-colors relative ${tab === key ? '' : 'text-gray-600 hover:text-gray-900'}`}
              style={tab === key ? { color: ACCENT } : undefined}
            >
              {label}
              {tab === key ? (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: ACCENT }} aria-hidden />
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative">
          {feedLoading ? (
            <div
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory px-1 sm:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="status"
              aria-busy="true"
              aria-label="Loading new cars"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <NewCarCarouselCardSkeleton key={i} />
              ))}
            </div>
          ) : activeRows.length > 0 ? (
            <>
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollByPage(-1)}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 max-sm:hidden"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollByPage(1)}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 max-sm:hidden"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              <div
                ref={scrollerRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory px-1 sm:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {activeRows.map((row, ri) => {
                  if (row.kind === 'listing') {
                    const car = row.car;
                    const { rating, reviews } = reviewStats(car);
                    return (
                      <Link
                        key={`${tab}-listing-${car.id}-${ri}`}
                        data-new-car-card
                        to={`/new-cars/${car.id}?type=new_car`}
                        className="snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] min-w-[158px] bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
                      >
                        <div className="flex items-center justify-center bg-white px-3 pt-5 pb-2 min-h-[132px]">
                          <ImageWithFallback
                            src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK_IMAGE}
                            alt={formatDisplayName(car)}
                            className="max-h-[112px] w-full object-contain object-center"
                          />
                        </div>
                        <div className="px-3 pb-4 pt-1 flex flex-col items-center text-center flex-1">
                          <h3 className="font-bold text-sm sm:text-base leading-snug mb-1.5 text-[#233D7B] line-clamp-2">
                            {formatDisplayName(car)}
                          </h3>
                          <p className="text-[#3EB549] font-bold text-sm sm:text-base mb-2">{formatNewCarPriceLakh(car)}</p>
                          <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                            <StarRow rating={rating} />
                            <span className="text-xs text-gray-500 whitespace-nowrap">{reviews.toLocaleString()} Reviews</span>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  const item = row.item;
                  const when = formatPulseWhen(item.published_at);
                  return (
                    <a
                      key={`${tab}-news-${ri}-${item.url.slice(0, 48)}`}
                      data-new-car-card
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-[158px] w-[calc(50%-8px)] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                    >
                      <div className="relative flex min-h-[132px] items-center justify-center bg-neutral-50 px-3 pb-2 pt-4">
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-700 shadow-sm">
                          <Globe2 className="h-3 w-3" aria-hidden />
                          BD news
                        </span>
                        <ImageWithFallback
                          src={item.image_url || FALLBACK_IMAGE}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="max-h-[100px] w-full object-cover object-center rounded-md"
                        />
                      </div>
                      <div className="px-3 pb-4 pt-1 flex flex-col items-center text-center flex-1">
                        <h3 className="font-bold text-xs sm:text-sm leading-snug mb-1.5 text-gray-900 line-clamp-3">{item.title}</h3>
                        <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">
                          {[item.source_name, when].filter(Boolean).join(when && item.source_name ? ' · ' : '') || 'Bangladesh'}
                        </p>
                        <p className="mt-auto text-xs font-semibold" style={{ color: ACCENT }}>
                          Read story →
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          ) : (
            emptyHint
          )}
        </div>
      </div>
    </section>
  );
}
