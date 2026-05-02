import {
  Armchair,
  Bookmark,
  Calendar,
  Car,
  ChevronRight,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  Share2,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getAuthToken } from '@/lib/api';
import { addToWishlist, fetchWishlistListings, removeFromWishlist } from '@/lib/engagement';
import {
  fetchListingById,
  fetchListings,
  formatMoney,
  listingPublicHref,
  resolveMediaUrl,
  type ListingDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { ListingMediaGallery } from './ListingMediaGallery';
import { ListingReviewsSection } from './ListingReviewsSection';
import { PromoteListingPanel } from './PromoteListingPanel';
import { ImageWithFallback } from './figma/ImageWithFallback';

const GREEN = '#3EB549';
const BLUE = '#3483D1';

function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatMemberSince(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

function inspectionScoreFromDyn(d: Record<string, unknown> | undefined): string | null {
  if (!d) return null;
  const raw =
    d.inspection_score ?? d.car_inspection_score ?? d.pw_inspection_score ?? d.inspection_rating;
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (Number.isFinite(n)) return String(Math.min(10, Math.max(0, Math.round(n * 10) / 10)));
  return String(raw);
}

function FeatureSectionIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (t.includes('exterior')) return <Car className="h-5 w-5 shrink-0 text-[#3483D1]" aria-hidden />;
  if (t.includes('interior')) return <Armchair className="h-5 w-5 shrink-0 text-[#3483D1]" aria-hidden />;
  if (t.includes('safety')) return <Shield className="h-5 w-5 shrink-0 text-[#3483D1]" aria-hidden />;
  if (t.includes('comfort')) return <Sparkles className="h-5 w-5 shrink-0 text-[#3483D1]" aria-hidden />;
  return <Car className="h-5 w-5 shrink-0 text-[#3483D1]" aria-hidden />;
}

function strAttr(d: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!d) return '—';
  for (const k of keys) {
    const v = d[k];
    if (v != null && String(v).trim()) return String(v);
  }
  return '—';
}

function maskPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length <= 3) return 'XXXXXXX';
  return `${d.slice(0, 4)}XXXXXXX`;
}

/** Rough indicative EMI for sidebar promo line (not a financing offer). */
function indicativeMonthlyPayment(price: string | number | null | undefined): number | null {
  if (price === null || price === undefined || price === '') return null;
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n / 60);
}

function featureSections(d: Record<string, unknown> | undefined): { title: string; items: string[] }[] {
  if (!d) return [];
  const pairs: [string, string][] = [
    ['exterior_features', 'Exterior'],
    ['interior_features', 'Interior'],
    ['safety_features', 'Safety & security'],
    ['comfort_features', 'Comfort & convenience'],
    ['features_exterior', 'Exterior'],
    ['features_interior', 'Interior'],
  ];
  const out: { title: string; items: string[] }[] = [];
  const seenTitle = new Set<string>();
  for (const [key, title] of pairs) {
    if (seenTitle.has(title)) continue;
    const v = d[key];
    if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      const items = (v as string[]).filter(Boolean);
      if (items.length) {
        out.push({ title, items });
        seenTitle.add(title);
      }
    } else if (typeof v === 'string' && v.trim()) {
      const items = v.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
      if (items.length) {
        out.push({ title, items });
        seenTitle.add(title);
      }
    }
  }
  return out;
}

export function CarDetailPage({ listingId, onBack }: { listingId?: string; onBack?: () => void }) {
  const navigate = useNavigate();
  const [car, setCar] = useState<ListingDto | null>(null);
  const [similar, setSimilar] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [phoneReveal, setPhoneReveal] = useState(false);
  const fallback =
    'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1080&q=80';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPhoneReveal(false);
    (async () => {
      try {
        const row = listingId ? await fetchListingById(listingId) : null;
        if (mounted) setCar(row);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    if (!car) {
      setSimilar([]);
      return;
    }
    fetchListings({ listing_type: car.listing_type, sort: 'newest', per_page: 12 })
      .then((rows) => setSimilar(rows.filter((r) => r.id !== car.id).slice(0, 4)))
      .catch(() => setSimilar([]));
  }, [car]);

  useEffect(() => {
    if (!car) return;
    const desc =
      typeof car.description === 'string' && car.description.trim()
        ? car.description.trim().slice(0, 160)
        : `${formatMoney(car.price, car.currency)} · ${car.location_city || 'Bangladesh'}`;
    setPageSeo(`${car.title} · BanglarChaka`, desc);
  }, [car]);

  useEffect(() => {
    if (!car || !getAuthToken()) {
      setWishlisted(false);
      return;
    }
    fetchWishlistListings()
      .then((rows) => setWishlisted(rows.some((r) => r.id === car.id)))
      .catch(() => setWishlisted(false));
  }, [car]);

  const canBoostListing = !!(car && (car.can_manage ?? false));

  const dyn = car?.dynamic_attributes as Record<string, unknown> | undefined;
  const feats = useMemo(() => featureSections(dyn), [dyn]);

  const toggleWishlist = () => {
    if (!car || !getAuthToken()) {
      window.alert('Sign in to use wishlist.');
      return;
    }
    (wishlisted ? removeFromWishlist(car.id) : addToWishlist(car.id))
      .then(() => setWishlisted(!wishlisted))
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Wishlist failed'));
  };

  const shareListing = async () => {
    if (!car) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: car.title, text: car.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        window.alert('Link copied to clipboard.');
      }
    } catch {
      /* dismissed share sheet */
    }
  };

  const galleryFeaturedBadge = car?.featured ? (
    <span className="rounded bg-[#C4161C] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
      Featured
    </span>
  ) : null;

  const galleryOverlay = car ? (
    <>
      <button
        type="button"
        aria-label={wishlisted ? 'Remove from saved' : 'Save listing'}
        title="Save"
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist();
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white"
      >
        <Bookmark className={`h-5 w-5 ${wishlisted ? 'fill-[#233D7B] text-[#233D7B]' : ''}`} />
      </button>
      <button
        type="button"
        aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
        title="Favorite"
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist();
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white"
      >
        <Heart className={`h-5 w-5 ${wishlisted ? 'fill-[#C4161C] text-[#C4161C]' : ''}`} />
      </button>
      <button
        type="button"
        aria-label="Share listing"
        onClick={(e) => {
          e.preventDefault();
          shareListing();
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </>
  ) : null;

  const listingsQueryHref =
    car?.listing_type === 'new_car'
      ? '/listings?type=new_car'
      : `/listings?type=${encodeURIComponent(car?.listing_type || 'used_car')}`;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Back to results
          </button>
          {car ? (
            <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 text-[11px] text-gray-500 sm:flex sm:text-sm" aria-label="Breadcrumb">
              <Link to="/" className="shrink-0 hover:text-[#233D7B]">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              <Link to={listingsQueryHref} className="shrink-0 hover:text-[#233D7B]">
                {car.listing_type === 'used_car' ? 'Used Cars' : 'Listings'}
              </Link>
              {car.location_city ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                  <Link to={listingsQueryHref} className="shrink-0 hover:text-[#233D7B]">
                    Cars {car.location_city}
                  </Link>
                </>
              ) : null}
              {car.brand?.name ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                  <span className="shrink-0 text-gray-700">
                    {car.brand.name}
                    {car.location_city ? ` ${car.location_city}` : ''}
                  </span>
                </>
              ) : null}
              {car.vehicle_model?.name ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                  <span className="hidden text-gray-700 md:inline">
                    {car.vehicle_model.name}
                    {car.vehicle_year ? ` ${car.vehicle_year}` : ''}
                    {car.location_city ? ` ${car.location_city}` : ''}
                  </span>
                </>
              ) : null}
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              <span className="max-w-[160px] truncate font-medium text-gray-900 sm:max-w-[280px] lg:max-w-md">{car.title}</span>
            </nav>
          ) : (
            <span className="text-sm text-gray-400">{loading ? 'Loading…' : ''}</span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-600 shadow-sm">
            Loading vehicle details…
          </div>
        ) : !car ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-800 shadow-sm">
            No listing found.
          </div>
        ) : (
          (() => {
            const inspectionScore = inspectionScoreFromDyn(dyn);
            const ringScore = inspectionScore && inspectionScore !== '—' ? inspectionScore : '—';
            const monthly = indicativeMonthlyPayment(car.price);
            const memberSince = formatMemberSince(car.created_at);
            const specPairs: [string, string][] = [
              [
                'Registered in',
                strAttr(dyn, 'registered_in', 'registration') !== '—'
                  ? strAttr(dyn, 'registered_in', 'registration')
                  : car.condition
                    ? car.condition.replace(/_/g, ' ')
                    : '—',
              ],
              ['Color', strAttr(dyn, 'color', 'body_color', 'exterior_color')],
              ['Assembly', strAttr(dyn, 'assembly', 'import_status')],
              ['Engine capacity', strAttr(dyn, 'engine_cc', 'engine_capacity', 'engine')],
              ['Body type', car.category?.name || strAttr(dyn, 'body_type')],
              ['Last updated', formatUpdated(car.updated_at)],
              ['Ad Ref #', car.id.length > 12 ? `${car.id.slice(0, 12)}…` : car.id],
            ];
            const specRows: [string, string][][] = [];
            for (let i = 0; i < specPairs.length; i += 2) {
              specRows.push([specPairs[i], specPairs[i + 1] ?? ['', '']]);
            }

            const sectionLinks = [
              { id: 'detail-car-info', label: 'Car Info' },
              { id: 'detail-car-details', label: 'Car Details' },
              { id: 'detail-seller-comments', label: "Seller's Comments" },
              { id: 'detail-similar-ads', label: 'Similar Ads' },
            ] as const;

            const sectionNavClass =
              'block rounded-r border-l-[3px] border-transparent py-1.5 pl-3 text-sm text-gray-600 transition hover:border-[#3EB549] hover:bg-gray-50 hover:text-[#233D7B]';

            return (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[148px_minmax(0,1fr)_min(340px,100%)] lg:items-start lg:gap-8">
                <nav
                  className="scrollbar-thin hidden max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain lg:block lg:sticky lg:top-6 lg:self-start"
                  aria-label="On this page"
                >
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">On this page</p>
                  <ul className="space-y-0.5 border-r border-gray-200 pr-2">
                    {sectionLinks.map(({ id, label }) => (
                      <li key={id}>
                        <a href={`#${id}`} className={sectionNavClass}>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="min-w-0 space-y-6">
                  <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {sectionLinks.map(({ id, label }) => (
                      <a
                        key={id}
                        href={`#${id}`}
                        className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
                      >
                        {label}
                      </a>
                    ))}
                  </div>

                  <section id="detail-car-info" className="scroll-mt-6 space-y-6">
                    <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                      <h1 className="text-2xl font-bold leading-tight text-[#233D7B] md:text-[28px]">{car.title}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                          {car.location_city || 'Location not specified'}
                        </span>
                        <span className="hidden text-gray-300 sm:inline">·</span>
                        <span className="text-xs text-gray-500">Added via listing</span>
                      </div>
                    </header>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
                      <ListingMediaGallery
                        media={car.media}
                        title={car.title}
                        fallbackSrc={fallback}
                        topLeftSlot={galleryFeaturedBadge}
                        topRightSlot={galleryOverlay}
                      />
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm md:grid-cols-4">
                      {[
                        { icon: Calendar, label: 'Year', value: car.vehicle_year != null ? String(car.vehicle_year) : '—' },
                        {
                          icon: Gauge,
                          label: 'Mileage',
                          value: car.mileage_km != null ? `${Number(car.mileage_km).toLocaleString()} km` : '—',
                        },
                        { icon: Fuel, label: 'Fuel', value: car.fuel_type || '—' },
                        { icon: Settings, label: 'Transmission', value: car.transmission || '—' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex flex-col items-center gap-2 px-3 py-5 text-center">
                          <Icon className="h-6 w-6 text-gray-400" aria-hidden />
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</div>
                          <div className="text-base font-bold text-gray-900">{value}</div>
                        </div>
                      ))}
                    </div>

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex md:flex-row md:items-center md:justify-between md:gap-6 md:p-6">
                      <div className="flex flex-wrap items-center gap-4">
                        <div
                          className="flex h-[72px] w-[100px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-50 to-orange-50 text-3xl shadow-inner"
                          aria-hidden
                        >
                          🚗
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Car Inspection</h2>
                          <p className="mt-1 text-sm text-gray-500">Engine · Suspension · Exterior · Interior</p>
                        </div>
                        <div
                          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] text-sm font-bold tabular-nums text-emerald-800 shadow-inner"
                          style={{ borderColor: GREEN, backgroundColor: '#ecfdf5' }}
                          aria-label={ringScore === '—' ? 'Inspection score not available' : `Inspection score ${ringScore} out of 10`}
                        >
                          {ringScore === '—' ? '—' : `${ringScore}/10`}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-4 w-full rounded-lg px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 md:mt-0 md:w-auto md:shrink-0"
                        style={{ backgroundColor: GREEN }}
                      >
                        Schedule Inspection
                      </button>
                    </section>
                  </section>

                  <section id="detail-car-details" className="scroll-mt-6 space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Car className="h-5 w-5 text-[#233D7B]" aria-hidden />
                        Detailed specifications
                      </h2>
                      <div className="space-y-0">
                        {specRows.map((pair, rowIdx) => (
                          <div
                            key={`spec-row-${rowIdx}`}
                            className="grid gap-4 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-2 sm:gap-8"
                          >
                            {pair.map(([label, val], colIdx) =>
                              label ? (
                                <div key={`${label}-${colIdx}`} className="flex justify-between gap-4 text-sm">
                                  <dt className="text-gray-500">{label}</dt>
                                  <dd className="max-w-[55%] text-right font-medium text-gray-900">{val}</dd>
                                </div>
                              ) : (
                                <div key={`empty-${colIdx}`} />
                              ),
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {feats.length > 0 ? (
                      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 md:px-6">
                          <h2 className="text-lg font-bold text-gray-900">Car features</h2>
                          <p className="mt-1 text-sm text-gray-500">Tap a category to expand.</p>
                        </div>
                        <div className="divide-y divide-gray-100 px-2 pb-2 md:px-4">
                          {feats.map((sec) => (
                            <details key={sec.title} className="group rounded-lg px-3 py-1 open:bg-gray-50/80">
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
                                <span className="flex items-center gap-3 font-semibold text-gray-900">
                                  <FeatureSectionIcon title={sec.title} />
                                  {sec.title}
                                </span>
                                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-open:rotate-90" aria-hidden />
                              </summary>
                              <ul className="grid gap-2 pb-4 pl-1 sm:grid-cols-2">
                                {sec.items.map((item) => (
                                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3EB549]" aria-hidden />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </section>

                  <section id="detail-seller-comments" className="scroll-mt-6 space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                      <h2 className="mb-3 text-lg font-bold text-gray-900">Seller&apos;s comments</h2>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-gray-700">
                        {car.description?.trim()
                          ? car.description
                          : 'The seller has not added a detailed description yet.'}
                      </div>
                    </section>

                    <ListingReviewsSection listingPublicId={car.id} />
                  </section>

                  <section id="detail-similar-ads" className="scroll-mt-6 space-y-6">
                    {similar.length > 0 ? (
                      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="mb-4 flex items-center justify-between gap-2">
                          <h2 className="text-lg font-bold text-gray-900">Similar ads</h2>
                          <Link
                            to={`/listings?type=${encodeURIComponent(car.listing_type)}`}
                            className="text-sm font-semibold hover:underline"
                            style={{ color: BLUE }}
                          >
                            View all →
                          </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {similar.map((s) => (
                            <Link
                              key={s.id}
                              to={listingPublicHref(s)}
                              className="w-[140px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-[#233D7B]/40 hover:shadow-md sm:w-[160px]"
                            >
                              <div className="aspect-[4/3] bg-gray-100">
                                <ImageWithFallback
                                  src={resolveMediaUrl(s.media?.[0]?.path) || fallback}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="p-2">
                                <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900">{s.title}</p>
                                <p className="mt-1 text-xs font-bold" style={{ color: GREEN }}>
                                  {formatMoney(s.price, s.currency)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl" aria-hidden>
                          🚙
                        </span>
                        <div>
                          <p className="font-bold text-gray-900">Post an ad for FREE</p>
                          <p className="text-sm text-gray-500">Reach buyers across the marketplace.</p>
                        </div>
                      </div>
                      <Link
                        to="/post-ad?type=used_car#post-ad-form"
                        className="inline-flex w-full items-center justify-center rounded-lg px-8 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 sm:w-auto"
                        style={{ backgroundColor: GREEN }}
                      >
                        Sell Your Car
                      </Link>
                    </div>
                  </section>
                </div>

                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md sm:p-5">
                      <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Price</p>
                      <p className="mt-1 text-center text-3xl font-bold tabular-nums md:text-[34px]" style={{ color: GREEN }}>
                        {formatMoney(car.price, car.currency)}
                      </p>
                      {monthly != null ? (
                        <p className="mt-2 text-center text-sm font-semibold" style={{ color: BLUE }}>
                          Financing starts from {car.currency} {monthly.toLocaleString()}/month
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-md">
                      {car.seller?.phone ? (
                        phoneReveal ? (
                          <a
                            href={`tel:${car.seller.phone}`}
                            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-base font-bold text-white shadow-sm transition hover:opacity-95"
                            style={{ backgroundColor: GREEN }}
                          >
                            <Phone className="h-5 w-5 shrink-0" aria-hidden />
                            {car.seller.phone}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPhoneReveal(true)}
                            className="flex w-full flex-col items-center justify-center gap-0.5 rounded-lg py-3 text-white shadow-sm transition hover:opacity-95"
                            style={{ backgroundColor: GREEN }}
                          >
                            <span className="flex items-center gap-2 text-base font-bold">
                              <Phone className="h-5 w-5 shrink-0" aria-hidden />
                              {maskPhoneDisplay(car.seller.phone)}
                            </span>
                            <span className="text-xs font-semibold opacity-95">Show Phone Number</span>
                          </button>
                        )
                      ) : (
                        <p className="rounded-lg bg-gray-50 py-3 text-center text-sm text-gray-500">Phone not listed</p>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!car) return;
                          if (!getAuthToken()) {
                            const next = `${window.location.pathname}${window.location.search}`;
                            navigate(`/login?next=${encodeURIComponent(next)}`);
                            return;
                          }
                          navigate(`/messages?listing=${encodeURIComponent(car.id)}`);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 bg-white py-3 text-base font-bold shadow-sm transition hover:bg-blue-50/80"
                        style={{ borderColor: BLUE, color: BLUE }}
                      >
                        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                        Send Message
                      </button>

                      {!getAuthToken() ? (
                        <p className="text-center text-xs text-gray-500">Sign in to message — we&apos;ll take you to login, then you can open Messages.</p>
                      ) : null}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-md">
                      <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">Seller Details</h3>
                      <div className="mt-4 flex min-w-0 gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200">
                          <User className="h-7 w-7 text-gray-400" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate font-bold text-gray-900">{car.seller?.name || 'Private seller'}</p>
                          {memberSince ? (
                            <p className="mt-1 text-xs text-gray-500">Member since {memberSince}</p>
                          ) : null}
                          {car.seller?.email ? (
                            <a
                              href={`mailto:${car.seller.email}`}
                              className="mt-2 block w-full min-w-0 text-sm font-medium leading-snug break-all hover:underline"
                              style={{ color: BLUE }}
                            >
                              {car.seller.email}
                            </a>
                          ) : (
                            <p className="mt-2 text-xs text-gray-400">Connect via call or message</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/90 p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-950">
                        <Shield className="h-4 w-4 shrink-0" aria-hidden />
                        Safety tips
                      </div>
                      <ul className="space-y-2 text-xs leading-relaxed text-amber-950/90">
                        <li>Meet in a safe, public place for viewings.</li>
                        <li>Inspect documents and chassis before payment.</li>
                        <li>Avoid advance payments to unknown accounts.</li>
                      </ul>
                      <button type="button" className="mt-3 text-xs font-bold hover:underline" style={{ color: BLUE }}>
                        Learn more
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => window.alert('Thanks — we will follow up if needed.')}
                        className="rounded-lg border border-gray-300 bg-white py-2.5 text-center text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                      >
                        Notify As Sold
                      </button>
                      <button
                        type="button"
                        onClick={() => window.alert('Thank you — moderators will review this report.')}
                        className="rounded-lg border border-gray-300 bg-white py-2.5 text-center text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                      >
                        Report This Ad
                      </button>
                    </div>

                    {canBoostListing ? (
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md">
                        <PromoteListingPanel listingPublicId={car.id} listingTitle={car.title} />
                      </div>
                    ) : null}
                  </div>
                </aside>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
