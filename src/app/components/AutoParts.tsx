import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { BD_POPULAR_USED_CAR_MODELS } from '@/app/data/bdPopularCars';
import {
  fetchBrands,
  fetchListings,
  listingCoverMediaPath,
  resolveMediaUrl,
  type BrandDto,
  type ListingDto,
} from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

const ACCENT = '#00236f';

/** Curated Unsplash assets — car-care / parts aesthetic, consistent crop */
const IMG = {
  cleaner: 'https://images.unsplash.com/photo-1585421514738-029ba42739d0?auto=format&fit=crop&w=320&q=80',
  cloth: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=320&q=80',
  mats: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=320&q=80',
  cover: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=320&q=80',
  gps: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=320&q=80',
  freshener: 'https://images.unsplash.com/photo-1595425979367-5ca34b918617?auto=format&fit=crop&w=320&q=80',
  tyres: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=320&q=80',
  coolant: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=320&q=80',
  washer: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=320&q=80',
  shade: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=320&q=80',
  glass: 'https://images.unsplash.com/photo-1525609004558-c2365715209e?auto=format&fit=crop&w=320&q=80',
  shampoo: 'https://images.unsplash.com/photo-1607860108855-64acf3518c95?auto=format&fit=crop&w=320&q=80',
  filter: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?auto=format&fit=crop&w=320&q=80',
  brakes: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=320&q=80',
  battery: 'https://images.unsplash.com/photo-1628837144688-69803d0fcf23?auto=format&fit=crop&w=320&q=80',
  spark: 'https://images.unsplash.com/photo-1563720223185-11003d516eef?auto=format&fit=crop&w=320&q=80',
  wiper: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=320&q=80',
  led: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=320&q=80',
  horn: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=320&q=80',
  seat: 'https://images.unsplash.com/photo-1507139983759-d8b71921f1cc?auto=format&fit=crop&w=320&q=80',
  steering: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=320&q=80',
  dashcam: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=320&q=80',
  jump: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=320&q=80',
  polish: 'https://images.unsplash.com/photo-1601362840460-51e4d0012fbc?auto=format&fit=crop&w=320&q=80',
  oil: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=320&q=80',
  tools: 'https://images.unsplash.com/photo-1530124568052-01504382b584?auto=format&fit=crop&w=320&q=80',
};

const GENERIC_PART_IMAGES = [
  IMG.tools,
  IMG.brakes,
  IMG.filter,
  IMG.oil,
  IMG.battery,
  IMG.tyres,
  IMG.led,
  IMG.cleaner,
];

function firstListingPhoto(l: ListingDto): string | null {
  const u = resolveMediaUrl(listingCoverMediaPath(l.media));
  return u || null;
}

function dedupeListings(rows: ListingDto[]): ListingDto[] {
  const seen = new Set<string>();
  const out: ListingDto[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

/** Pull ?q= from /listings?… links for keyword matching against live listings. */
function extractListingQuery(to: string): string {
  const qm = to.indexOf('?');
  if (qm === -1) return '';
  return new URLSearchParams(to.slice(qm + 1)).get('q')?.trim() || '';
}

function poolForUrl(pool: ListingDto[], listingUrl: string): ListingDto[] {
  if (listingUrl.includes('type=accessory')) {
    const only = pool.filter((l) => l.listing_type === 'accessory');
    return only.length ? only : pool;
  }
  if (listingUrl.includes('type=auto_part')) {
    const only = pool.filter((l) => l.listing_type === 'auto_part' || l.listing_type === 'tyre_rim');
    return only.length ? only : pool;
  }
  return pool;
}

/**
 * Prefer a marketplace listing photo that matches search intent; otherwise rotate through real listing shots.
 */
function pickListingMedia(
  pool: ListingDto[],
  query: string,
  fallback: string,
  saltIndex: number,
  listingUrl: string,
): string {
  const scoped = poolForUrl(pool, listingUrl);
  const tokens = query
    .toLowerCase()
    .split(/[\s+,]+/)
    .filter((t) => t.length > 1);

  const scored = scoped
    .map((l) => {
      const hay = `${l.title} ${l.description ?? ''} ${JSON.stringify(l.dynamic_attributes ?? {})}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += 3;
      }
      const brand = l.brand?.name?.toLowerCase();
      if (brand && tokens.some((t) => brand.includes(t))) score += 2;
      const url = firstListingPhoto(l);
      return { score, url };
    })
    .filter((x): x is { score: number; url: string } => !!x.url);

  const best = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score)[0];
  if (best) return best.url;

  const anyPhoto = scoped.map(firstListingPhoto).filter(Boolean) as string[];
  if (anyPhoto.length) return anyPhoto[saltIndex % anyPhoto.length];

  const global = pool.map(firstListingPhoto).filter(Boolean) as string[];
  if (global.length) return global[saltIndex % global.length];

  return fallback;
}

function pickByBrandId(pool: ListingDto[], brandId: number, fallback: string, salt: number): string {
  const brandRows = pool.filter((l) => l.brand?.id === brandId);
  const photos = brandRows.map(firstListingPhoto).filter(Boolean) as string[];
  if (photos.length) return photos[salt % photos.length];

  const anyPhoto = pool.map(firstListingPhoto).filter(Boolean) as string[];
  if (anyPhoto.length) return anyPhoto[salt % anyPhoto.length];

  return fallback;
}

function listingsPartQs(extra: Record<string, string>) {
  const p = new URLSearchParams({ type: 'auto_part', ...extra });
  return `/listings?${p.toString()}`;
}

function listingsAccessoryQs(extra: Record<string, string>) {
  const p = new URLSearchParams({ type: 'accessory', ...extra });
  return `/listings?${p.toString()}`;
}

type PartCard = { label: string; to: string; image: string };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const PER_SLIDE = 12;

const SUB_CATEGORY_SLIDES: PartCard[][] = [
  [
    { label: 'All Purpose Cleaner', to: listingsPartQs({ q: 'all purpose cleaner' }), image: IMG.cleaner },
    { label: 'Microfiber Cloth', to: listingsPartQs({ q: 'microfiber cloth' }), image: IMG.cloth },
    { label: 'Car Mats', to: listingsAccessoryQs({ q: 'car mats floor mat' }), image: IMG.mats },
    { label: 'Car Cover', to: listingsAccessoryQs({ q: 'car cover' }), image: IMG.cover },
    { label: 'GPS Tracker', to: listingsAccessoryQs({ q: 'GPS tracker' }), image: IMG.gps },
    { label: 'Car Air Freshener', to: listingsAccessoryQs({ q: 'air freshener' }), image: IMG.freshener },
    { label: 'Tyres', to: listingsPartQs({ q: 'tyre tire' }), image: IMG.tyres },
    { label: 'Coolants', to: listingsPartQs({ q: 'coolant antifreeze' }), image: IMG.coolant },
    { label: 'Car Washers', to: listingsPartQs({ q: 'car washer pressure' }), image: IMG.washer },
    { label: 'Car Shades', to: listingsAccessoryQs({ q: 'sun shade car' }), image: IMG.shade },
    { label: 'Glass Cleaner', to: listingsPartQs({ q: 'glass cleaner' }), image: IMG.glass },
    { label: 'Car Shampoo', to: listingsPartQs({ q: 'car shampoo wash' }), image: IMG.shampoo },
  ],
  [
    { label: 'Oil Filter', to: listingsPartQs({ q: 'oil filter' }), image: IMG.filter },
    { label: 'Brake Pads', to: listingsPartQs({ q: 'brake pads' }), image: IMG.brakes },
    { label: 'Battery', to: listingsPartQs({ q: 'car battery' }), image: IMG.battery },
    { label: 'Spark Plugs', to: listingsPartQs({ q: 'spark plug' }), image: IMG.spark },
    { label: 'Wiper Blades', to: listingsPartQs({ q: 'wiper blade' }), image: IMG.wiper },
    { label: 'LED Lights', to: listingsPartQs({ q: 'LED light bulb' }), image: IMG.led },
    { label: 'Horn', to: listingsPartQs({ q: 'horn' }), image: IMG.horn },
    { label: 'Seat Covers', to: listingsAccessoryQs({ q: 'seat cover' }), image: IMG.seat },
    { label: 'Steering Cover', to: listingsAccessoryQs({ q: 'steering cover' }), image: IMG.steering },
    { label: 'Dash Cam', to: listingsAccessoryQs({ q: 'dash cam' }), image: IMG.dashcam },
    { label: 'Jump Starter', to: listingsAccessoryQs({ q: 'jump starter' }), image: IMG.jump },
    { label: 'Polish & Wax', to: listingsPartQs({ q: 'polish wax' }), image: IMG.polish },
  ],
];

const POPULAR_MODELS: Array<{ label: string; q: string }> = [
  ...BD_POPULAR_USED_CAR_MODELS.map(({ label, q }) => ({ label: `${label} parts`, q })),
  { label: 'Hiace parts', q: 'Toyota Hiace' },
  { label: 'Premio parts', q: 'Toyota Premio' },
  { label: 'Axela parts', q: 'Mazda Axela' },
  { label: 'Vitz parts', q: 'Toyota Vitz' },
  { label: 'Prado parts', q: 'Toyota Prado' },
  { label: 'Harrier parts', q: 'Toyota Harrier' },
  { label: 'March parts', q: 'Nissan March' },
  { label: 'Jimny parts', q: 'Suzuki Jimny' },
  { label: 'WR-V parts', q: 'Honda WR-V' },
  { label: 'Yaris parts', q: 'Toyota Yaris' },
];

const PART_BRANDS: Array<{ label: string; q: string }> = [
  { label: 'Bosch', q: 'Bosch' },
  { label: 'Denso', q: 'Denso' },
  { label: 'Mobil 1', q: 'Mobil 1' },
  { label: 'Castrol', q: 'Castrol' },
  { label: 'Shell Helix', q: 'Shell Helix' },
  { label: 'Bridgestone', q: 'Bridgestone' },
  { label: 'Michelin', q: 'Michelin' },
  { label: 'Monroe', q: 'Monroe' },
  { label: 'KYB', q: 'KYB' },
  { label: 'Mann Filter', q: 'Mann Filter' },
  { label: 'TRW', q: 'TRW' },
  { label: 'NGK', q: 'NGK' },
  { label: 'ACDelco', q: 'ACDelco' },
  { label: 'Valeo', q: 'Valeo' },
  { label: 'Febi', q: 'Febi' },
  { label: 'Liqui Moly', q: 'Liqui Moly' },
  { label: 'Motul', q: 'Motul' },
  { label: 'Yokohama', q: 'Yokohama' },
  { label: 'Continental', q: 'Continental' },
  { label: 'Goodyear', q: 'Goodyear' },
  { label: 'Osram', q: 'Osram' },
  { label: 'Philips Auto', q: 'Philips automotive' },
  { label: '3M Auto', q: '3M automotive' },
  { label: 'PIAA', q: 'PIAA' },
];

type TabKey = 'sub' | 'make' | 'model' | 'brand';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'sub', label: 'Sub Category' },
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'brand', label: 'Brand' },
];

function PartTileSkeleton() {
  return (
    <div className="flex flex-col items-stretch rounded-lg sm:rounded-xl border border-gray-200/90 bg-white shadow-sm overflow-hidden animate-pulse min-h-[132px] sm:min-h-[156px]">
      <div className="relative flex min-h-[76px] sm:min-h-[104px] flex-1 w-full items-center justify-center px-2 pt-2 pb-1.5 bg-gradient-to-b from-slate-50/95 via-white to-white">
        <div className="h-[64px] sm:h-[88px] w-[70%] rounded-md bg-gray-200" />
      </div>
      <div className="border-t border-gray-100/80 bg-white px-2 pb-2 sm:pb-3 pt-2 flex justify-center">
        <div className="h-3 w-[72%] rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

function PartTile({ label, to, image }: PartCard) {
  const isMarketplacePhoto =
    typeof image === 'string' && image.length > 0 && !image.includes('images.unsplash.com');

  return (
    <Link
      to={to}
      className="flex flex-col items-stretch rounded-lg sm:rounded-xl border border-gray-200/90 bg-white shadow-sm transition hover:border-[#3483D1]/45 hover:shadow-md overflow-hidden group min-h-[132px] sm:min-h-[156px] active:scale-[0.99]"
    >
      <div className="relative flex min-h-[76px] sm:min-h-[104px] flex-1 w-full items-center justify-center px-1.5 pt-2 pb-1.5 sm:px-2 sm:pt-3 sm:pb-2 bg-gradient-to-b from-slate-50/95 via-white to-white">
        <ImageWithFallback
          src={image}
          alt={label}
          loading="lazy"
          decoding="async"
          className={`max-h-[64px] sm:max-h-[88px] w-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.04] ${
            isMarketplacePhoto ? 'drop-shadow-[0_2px_8px_rgba(15,23,42,0.08)]' : ''
          }`}
        />
        {isMarketplacePhoto ? (
          <span className="pointer-events-none absolute right-1 top-1 sm:right-2 sm:top-2 rounded bg-emerald-600/90 px-1 py-0.5 sm:px-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
            Live
          </span>
        ) : null}
      </div>
      <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-800 text-center px-1.5 sm:px-2 pb-2 sm:pb-3 pt-1 sm:pt-1.5 leading-snug border-t border-gray-100/80 bg-white line-clamp-2">
        {label}
      </span>
    </Link>
  );
}

export function AutoParts() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('sub');
  const [page, setPage] = useState(0);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [listingPool, setListingPool] = useState<ListingDto[]>([]);
  const [poolLoading, setPoolLoading] = useState(true);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchListings({ listing_type: 'auto_part', sort: 'newest', per_page: 100 }),
      fetchListings({ listing_type: 'accessory', sort: 'newest', per_page: 90 }),
      fetchListings({ listing_type: 'tyre_rim', sort: 'newest', per_page: 40 }),
    ])
      .then(([parts, accessories, tyres]) => {
        if (cancelled) return;
        setListingPool(dedupeListings([...parts, ...accessories, ...tyres]));
      })
      .catch(() => {
        if (!cancelled) setListingPool([]);
      })
      .finally(() => {
        if (!cancelled) setPoolLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(0);
  }, [tab]);

  const resolvedSubSlides = useMemo(() => {
    let salt = 0;
    return SUB_CATEGORY_SLIDES.map((slide) =>
      slide.map((card) => {
        const q = extractListingQuery(card.to) || card.label;
        const img = pickListingMedia(listingPool, q, card.image, salt++, card.to);
        return { ...card, image: img };
      }),
    );
  }, [listingPool]);

  const makeSlides = useMemo(() => {
    const cards: PartCard[] = brands.map((b, i) => ({
      label: b.name,
      to: listingsPartQs({ brand_id: String(b.id) }),
      image: pickByBrandId(listingPool, b.id, GENERIC_PART_IMAGES[i % GENERIC_PART_IMAGES.length], i),
    }));
    return chunk(cards.length ? cards : [{ label: 'All makes', to: '/listings?type=auto_part', image: GENERIC_PART_IMAGES[0] }], PER_SLIDE);
  }, [brands, listingPool]);

  const modelSlides = useMemo(() => {
    let salt = 0;
    const cards: PartCard[] = POPULAR_MODELS.map(({ label, q }, i) => ({
      label,
      to: listingsPartQs({ q }),
      image: pickListingMedia(listingPool, q, GENERIC_PART_IMAGES[i % GENERIC_PART_IMAGES.length], salt++, listingsPartQs({ q })),
    }));
    return chunk(cards, PER_SLIDE);
  }, [listingPool]);

  const brandSlides = useMemo(() => {
    let salt = 0;
    const cards: PartCard[] = PART_BRANDS.map(({ label, q }, i) => ({
      label,
      to: listingsPartQs({ q }),
      image: pickListingMedia(listingPool, q, GENERIC_PART_IMAGES[i % GENERIC_PART_IMAGES.length], salt++, listingsPartQs({ q })),
    }));
    return chunk(cards, PER_SLIDE);
  }, [listingPool]);

  const slides = useMemo(() => {
    switch (tab) {
      case 'sub':
        return resolvedSubSlides;
      case 'make':
        return makeSlides;
      case 'model':
        return modelSlides;
      case 'brand':
        return brandSlides;
      default:
        return resolvedSubSlides;
    }
  }, [tab, resolvedSubSlides, makeSlides, modelSlides, brandSlides]);

  useEffect(() => {
    const maxIdx = Math.max(0, slides.length - 1);
    setPage((p) => Math.min(p, maxIdx));
  }, [slides.length, brands.length]);

  const pageCount = Math.max(1, slides.length);
  const safePage = Math.min(page, pageCount - 1);
  const canPrev = safePage > 0;
  const canNext = safePage < pageCount - 1;

  return (
    <section className="border-y border-slate-100 bg-[#f8f9fa] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <PremiumSectionHeading
          eyebrow={t('homePremiumHeading.autoPartsEyebrow')}
          title={t('homePremiumHeading.autoPartsTitle')}
          subtitle={t('homePremiumHeading.autoPartsSubtitle')}
          action={
            <Link
              to="/listings?type=auto_part"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#00236f]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#ba0035] shadow-sm transition hover:bg-slate-50 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:hover:bg-transparent"
            >
              View all parts →
            </Link>
          }
        />

        <div className="mb-6 flex gap-1 overflow-x-auto overscroll-x-contain border-b border-slate-200 pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-8 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative shrink-0 snap-start whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold transition-colors sm:px-4 sm:py-3 sm:text-sm ${
                tab === key ? 'text-[#00236f]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
              {tab === key ? (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#ba0035]" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={`hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 ${
              canPrev ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className={`hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 ${
              canNext ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div className="overflow-hidden px-0 md:px-12 lg:px-14">
            <div
              className="flex transition-transform duration-300 ease-out touch-pan-y"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {poolLoading ? (
                <div key="pool-skeleton" className="min-w-full shrink-0">
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
                    role="status"
                    aria-busy="true"
                    aria-label="Loading parts"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <PartTileSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : (
                slides.map((slide, si) => (
                  <div key={`${tab}-${si}`} className="min-w-full shrink-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                      {slide.map((c) => (
                        <PartTile key={`${c.label}-${si}`} {...c} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex md:hidden items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous page"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`flex h-11 min-w-[44px] flex-1 max-w-[140px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 shadow-sm ${
                canPrev ? 'active:bg-gray-50' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
              Back
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={!canNext}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className={`flex h-11 min-w-[44px] flex-1 max-w-[140px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 shadow-sm ${
                canNext ? 'active:bg-gray-50' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-8 flex-wrap max-w-full overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Page ${i + 1}`}
              aria-current={i === safePage ? 'true' : undefined}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all ${i === safePage ? 'w-8' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              style={i === safePage ? { backgroundColor: ACCENT } : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
