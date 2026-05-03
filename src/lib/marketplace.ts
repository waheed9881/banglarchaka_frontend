import { apiFetch } from './api';
import { readStoredMarketPrefs } from './marketPrefs';

export type ListingDto = {
  id: string;
  title: string;
  price: string | number | null;
  currency: string;
  listing_type: string;
  status?: string | null;
  approved_at?: string | null;
  /** From API when authenticated — mirrors listing update policy (seller / dealer staff / moderators). */
  can_manage?: boolean;
  description?: string | null;
  condition?: string | null;
  fuel_type?: string | null;
  location_city?: string | null;
  vehicle_year?: number | null;
  mileage_km?: number | null;
  transmission?: string | null;
  dynamic_attributes?: Record<string, unknown>;
  featured?: boolean;
  featured_until?: string | null;
  view_count?: number;
  wishlist_count?: number;
  media?: Array<{ path: string; type: string }>;
  category?: { id: number; slug?: string; name?: string } | null;
  brand?: { id?: number; name: string; slug: string } | null;
  vehicle_model?: { id: number; slug?: string; name?: string } | null;
  seller?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    avatar_path?: string | null;
    status?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
  urgent?: boolean;
  /** Present when this listing has a scheduled or active timed auction (see GET listing show). */
  /** True when catalog row has a scheduled/active auction (GET /listings index). */
  has_live_auction?: boolean;
  sold_to_user_id?: number | null;
  /** Seller-only: buyer account email linked when marking sold. */
  sold_buyer_email?: string | null;
  /** Public listing detail: reviews block is shown only for sold vehicles. */
  reviews_enabled?: boolean;
  /** True when the signed-in user is the recorded buyer (may submit one listing review). */
  can_submit_listing_review?: boolean;
  open_auction?: {
    id: string;
    display_status: string;
    accepting_bids: boolean;
    ends_at: string;
    starts_at?: string | null;
    current_high_amount?: string | number | null;
    minimum_next_bid: string | number;
    bid_count: number;
  } | null;
};

export function listingPublicHref(listing: Pick<ListingDto, 'id' | 'listing_type'>): string {
  return listing.listing_type === 'new_car' ? `/new-cars/${listing.id}` : `/listings/${listing.id}`;
}

/** Compact page list: 1 … 4 5 6 … 200 */
export function listingPaginationPages(current: number, last: number): (number | 'gap')[] {
  if (last <= 9) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const anchor = new Set<number>([1, last, current, current - 1, current + 1]);
  for (const n of [...anchor]) {
    if (n < 1 || n > last) {
      anchor.delete(n);
    }
  }
  const sorted = [...anchor].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) {
      out.push('gap');
    }
    out.push(n);
    prev = n;
  }
  return out;
}

export type BrandDto = {
  id: number;
  slug: string;
  name: string;
  logo_path?: string | null;
};

export type CategoryDto = {
  id: number;
  slug: string;
  name: string;
  /** Present when API returns catalog roots / children */
  listing_type?: string;
  children?: CategoryDto[];
};

export type DealerDto = {
  id: number;
  slug: string;
  business_name: string;
  logo_path?: string | null;
  whatsapp?: string | null;
  verified_at?: string | null;
  response_rate_percent?: number | null;
  avg_response_time_seconds?: number | null;
  listings_count?: number;
  branches?: Array<{ city?: string | null }>;
};

export type DealerProfileDto = {
  slug: string;
  business_name: string;
  about?: string | null;
  logo_path?: string | null;
  banner_path?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  verified_at?: string | null;
  avg_response_time_seconds?: number | null;
  response_rate_percent?: number | null;
  branches?: Array<{ id?: number; name?: string | null; city?: string | null; address_line?: string | null }>;
  listings?: ListingDto[];
};

type Paginated<T> = {
  data: T[];
};

function toArray<T>(payload: unknown): T[] {
  if (payload === null || payload === undefined) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (typeof payload !== 'object') {
    return [];
  }

  const top = payload as { data?: unknown };
  if (!top.data) {
    return [];
  }

  if (Array.isArray(top.data)) {
    return top.data as T[];
  }

  const nested = top.data as Paginated<T>;
  if (nested && Array.isArray(nested.data)) {
    return nested.data;
  }

  return [];
}

export type ListingsPageMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function parseListingsMeta(payload: unknown): ListingsPageMeta | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const raw = (payload as { meta?: unknown }).meta;
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const m = raw as Record<string, unknown>;
  const total = Number(m.total);
  const current_page = Number(m.current_page);
  const last_page = Number(m.last_page);
  const per_page = Number(m.per_page);
  if (!Number.isFinite(total) || !Number.isFinite(current_page)) {
    return null;
  }

  return {
    total,
    current_page,
    last_page: Number.isFinite(last_page) ? last_page : current_page,
    per_page: Number.isFinite(per_page) ? per_page : 20,
  };
}

export type ListingsHttpParams = Record<string, string | number | boolean | string[] | undefined | null>;

/** Serialize listing query params — arrays become comma-separated (matches Laravel CSV parsing). */
export function appendListingsQueryParams(query: URLSearchParams, params: ListingsHttpParams): void {
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') {
      return;
    }
    if (Array.isArray(v)) {
      const parts = v.map(String).filter((s) => s.trim() !== '');
      if (!parts.length) return;
      query.set(k, parts.join(','));
      return;
    }
    if (typeof v === 'boolean') {
      if (v) query.set(k, '1');
      return;
    }
    query.set(k, String(v));
  });
}

export type ListingFacetRow = { key: string | number | null; count: number };

export type ListingFacetBuckets = {
  brands: ListingFacetRow[];
  vehicle_models: ListingFacetRow[];
  fuel_types: ListingFacetRow[];
  transmissions: ListingFacetRow[];
  assembly_types?: ListingFacetRow[];
  registration_regions?: ListingFacetRow[];
  feature_tags?: ListingFacetRow[];
};

/** Marginal facet counts for sidebar (GET /listings/filter-facets). */
export async function fetchListingFilterFacets(
  params: ListingsHttpParams,
): Promise<ListingFacetBuckets | null> {
  const query = new URLSearchParams();
  appendListingsQueryParams(query, params);

  query.delete('page');
  query.delete('per_page');

  const suffix = query.toString() ? `?${query.toString()}` : '';
  try {
    const json = await apiFetch<unknown>(`/listings/filter-facets${suffix}`);
    if (!json || typeof json !== 'object' || !('data' in json)) {
      return null;
    }
    const d = (json as { data: unknown }).data;
    if (!d || typeof d !== 'object') return null;
    const o = d as Record<string, unknown>;
    const parseBucket = (x: unknown): ListingFacetRow[] => {
      if (!Array.isArray(x)) return [];
      return x
        .map((row) => {
          if (!row || typeof row !== 'object') return null;
          const r = row as Record<string, unknown>;
          const count = Number(r.count);
          if (!Number.isFinite(count)) return null;
          return { key: (r.key as string | number | null) ?? null, count };
        })
        .filter(Boolean) as ListingFacetRow[];
    };
    return {
      brands: parseBucket(o.brands),
      vehicle_models: parseBucket(o.vehicle_models),
      fuel_types: parseBucket(o.fuel_types),
      transmissions: parseBucket(o.transmissions),
      assembly_types: parseBucket(o.assembly_types),
      registration_regions: parseBucket(o.registration_regions),
      feature_tags: parseBucket(o.feature_tags),
    };
  } catch {
    return null;
  }
}

/** Paginated listings (reads Laravel `meta` for totals — use on the main listings grid). */
export async function fetchListingsPaged(params: ListingsHttpParams = {}): Promise<{
  items: ListingDto[];
  meta: ListingsPageMeta | null;
}> {
  const query = new URLSearchParams();
  appendListingsQueryParams(query, params);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const json = await apiFetch<unknown>(`/listings${suffix}`);
  if (Array.isArray(json)) {
    return { items: json as ListingDto[], meta: null };
  }
  if (!json || typeof json !== 'object' || !('data' in json)) {
    throw new Error('Unexpected listings response (missing data). Confirm GET /api/v1/listings reaches Laravel.');
  }

  return {
    items: toArray<ListingDto>(json),
    meta: parseListingsMeta(json),
  };
}

export async function fetchListings(params: ListingsHttpParams = {}): Promise<ListingDto[]> {
  const query = new URLSearchParams();
  appendListingsQueryParams(query, params);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const json = await apiFetch<unknown>(`/listings${suffix}`);
  if (Array.isArray(json)) {
    return json as ListingDto[];
  }
  if (!json || typeof json !== 'object' || !('data' in json)) {
    throw new Error('Unexpected listings response (missing data). Confirm GET /api/v1/listings reaches Laravel.');
  }
  return toArray<ListingDto>(json);
}

export async function updateListing(
  listingPublicId: string,
  body: Record<string, string | number | boolean | null | undefined>,
): Promise<ListingDto | null> {
  const json = await apiFetch<{ data?: ListingDto }>(
    `/listings/${encodeURIComponent(listingPublicId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
  return json.data ?? null;
}

export async function fetchListingById(id: string): Promise<ListingDto | null> {
  try {
    const payload = await apiFetch<{ data?: ListingDto } | ListingDto>(`/listings/${id}`);
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as { data?: ListingDto }).data || null;
    }
    return payload as ListingDto;
  } catch {
    return null;
  }
}

export type FeaturedBoostPackageDto = {
  slug: string;
  name: string;
  duration_days: number;
  price: string | number;
  currency: string;
};

export type FeaturedListingOptionsDto = {
  packages: FeaturedBoostPackageDto[];
  dealer_subscription: {
    plan_name: string | null;
    featured_slots: number | null;
    featured_slots_used: number;
    can_enable_via_plan: boolean;
    featured_until_plan: string | null;
  } | null;
  listing: { featured: boolean; featured_until: string | null };
};

export async function fetchFeaturedListingOptions(listingPublicId: string): Promise<FeaturedListingOptionsDto> {
  return apiFetch<FeaturedListingOptionsDto>(`/listings/${encodeURIComponent(listingPublicId)}/featured-options`);
}

/** Public catalog (no auth) — same rows as edit-page packages. */
export async function fetchPublicFeaturedBoostPackages(): Promise<FeaturedBoostPackageDto[]> {
  const json = await apiFetch<{ data?: FeaturedBoostPackageDto[] }>('/featured-boost-packages');
  return Array.isArray(json.data) ? json.data : [];
}

export async function setListingFeaturedFromPlan(
  listingPublicId: string,
  featured: boolean,
): Promise<ListingDto | null> {
  const json = await apiFetch<{ data?: ListingDto }>(
    `/listings/${encodeURIComponent(listingPublicId)}/featured-from-plan`,
    {
      method: 'POST',
      body: JSON.stringify({ featured }),
    },
  );
  return json.data ?? null;
}

export async function fetchBrands(): Promise<BrandDto[]> {
  const json = await apiFetch<unknown>('/brands?per_page=100');
  return toArray<BrandDto>(json);
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  const json = await apiFetch<unknown>('/categories');
  return toArray<CategoryDto>(json);
}

export type SubscriptionPlanDto = {
  id: number;
  slug: string;
  name: string;
  billing_interval: string;
  price: number | string;
  currency: string;
  trial_days: number | null;
  listing_quota: number | null;
  feature_matrix?: Record<string, unknown> | unknown[] | null;
};

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
  const json = await apiFetch<{ data?: SubscriptionPlanDto[] }>('/subscription-plans');
  return Array.isArray(json.data) ? json.data : [];
}

export async function fetchDealers(): Promise<DealerDto[]> {
  const json = await apiFetch<unknown>('/dealers?per_page=50');
  return toArray<DealerDto>(json);
}

export type BrandNewsArticleDto = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  brand: { name: string; slug: string; logo_path?: string | null } | null;
};

export type BrandNewsArticleDetailDto = BrandNewsArticleDto & {
  body: string | null;
};

export type BrandNewsMetaDto = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export async function fetchBrandNews(page = 1, perPage = 12): Promise<{
  items: BrandNewsArticleDto[];
  meta: BrandNewsMetaDto | null;
}> {
  const json = await apiFetch<{ data?: BrandNewsArticleDto[]; meta?: BrandNewsMetaDto }>(
    `/editorial/brand-news?page=${page}&per_page=${perPage}`,
  );
  return {
    items: Array.isArray(json.data) ? json.data : [],
    meta: json.meta ?? null,
  };
}

/** Bangladesh automotive headlines (Google News RSS via Laravel proxy — free, no user API key). */
export type NewCarsPulseItemDto = {
  title: string;
  url: string;
  image_url?: string | null;
  published_at?: string | null;
  source_name?: string | null;
};

export type NewCarsPulseDto = {
  latest: NewCarsPulseItemDto[];
  popular: NewCarsPulseItemDto[];
  upcoming: NewCarsPulseItemDto[];
};

export async function fetchNewCarsPulse(): Promise<NewCarsPulseDto | null> {
  try {
    const json = await apiFetch<{ data?: NewCarsPulseDto }>('/editorial/new-cars-pulse');
    const d = json.data;
    if (!d || !Array.isArray(d.latest) || !Array.isArray(d.popular) || !Array.isArray(d.upcoming)) {
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

export type NewCarsLandingArticleDto = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  brand: { name: string; slug: string; logo_path?: string | null } | null;
};

export type NewCarsLandingCompareSideDto = {
  id: string;
  title: string;
  thumb_path: string | null;
  subtitle: string;
};

export type NewCarsLandingListingReviewDto = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  created_at?: string;
  reviewer_name?: string | null;
  listing: { public_id: string; title: string; thumb_path?: string | null } | null;
};

export type NewCarsLandingDto = {
  articles: NewCarsLandingArticleDto[];
  comparison_pairs: Array<{ left: NewCarsLandingCompareSideDto; right: NewCarsLandingCompareSideDto }>;
  listing_reviews: NewCarsLandingListingReviewDto[];
  faqs: Array<{ question: string; answer: string }>;
  financing_partners: Array<{ name: string }>;
  insurance_partners: Array<{ name: string }>;
};

export async function fetchNewCarsLanding(): Promise<NewCarsLandingDto | null> {
  try {
    const json = await apiFetch<{ data?: NewCarsLandingDto }>('/editorial/new-cars-landing');
    const d = json.data;
    if (!d || !Array.isArray(d.faqs)) {
      return null;
    }
    return {
      articles: Array.isArray(d.articles) ? d.articles : [],
      comparison_pairs: Array.isArray(d.comparison_pairs) ? d.comparison_pairs : [],
      listing_reviews: Array.isArray(d.listing_reviews) ? d.listing_reviews : [],
      faqs: d.faqs,
      financing_partners: Array.isArray(d.financing_partners) ? d.financing_partners : [],
      insurance_partners: Array.isArray(d.insurance_partners) ? d.insurance_partners : [],
    };
  } catch {
    return null;
  }
}

export async function fetchBrandNewsArticle(slug: string): Promise<BrandNewsArticleDetailDto | null> {
  try {
    const json = await apiFetch<{ data?: BrandNewsArticleDetailDto }>(
      `/editorial/brand-news/${encodeURIComponent(slug)}`,
    );
    return json.data ?? null;
  } catch {
    return null;
  }
}

export type VehicleModelDto = {
  id: number;
  slug: string;
  name: string;
  brand_id: number;
};

export async function fetchVehicleModelsForBrand(brandSlug: string): Promise<VehicleModelDto[]> {
  const json = await apiFetch<unknown>(`/brands/${encodeURIComponent(brandSlug)}/vehicle-models`);
  if (!json || typeof json !== 'object' || !('data' in json)) {
    return [];
  }
  const d = (json as { data: unknown }).data;
  return Array.isArray(d) ? (d as VehicleModelDto[]) : [];
}

export type ListingReviewDto = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase?: boolean;
  created_at?: string;
  reviewer?: { id?: number; name?: string | null };
};

export type ListingReviewsPage = {
  items: ListingReviewDto[];
  total: number;
  current_page: number;
  last_page: number;
};

export async function fetchListingReviews(listingPublicId: string, page = 1): Promise<ListingReviewsPage> {
  const json = await apiFetch<unknown>(
    `/listings/${encodeURIComponent(listingPublicId)}/reviews?page=${page}&per_page=20`,
  );
  if (!json || typeof json !== 'object' || !('data' in json)) {
    return { items: [], total: 0, current_page: 1, last_page: 1 };
  }
  const payload = (json as { data: unknown }).data;
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    const p = payload as {
      data: ListingReviewDto[];
      total?: number;
      current_page?: number;
      last_page?: number;
    };
    return {
      items: p.data,
      total: Number(p.total) || p.data.length,
      current_page: Number(p.current_page) || 1,
      last_page: Number(p.last_page) || 1,
    };
  }
  if (Array.isArray(payload)) {
    const arr = payload as ListingReviewDto[];
    return { items: arr, total: arr.length, current_page: 1, last_page: 1 };
  }
  return { items: [], total: 0, current_page: 1, last_page: 1 };
}

export async function submitListingReview(input: {
  listingPublicId: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<void> {
  await apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      reviewable_type: 'listing',
      reviewable_id: input.listingPublicId,
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body?.trim() || null,
    }),
  });
}

export type EditorialTestimonialDto = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase?: boolean;
  reviewer: { name?: string | null };
  dealer: { slug: string; business_name: string } | null;
};

export async function fetchEditorialTestimonials(limit = 12): Promise<EditorialTestimonialDto[]> {
  const json = await apiFetch<{ data?: EditorialTestimonialDto[] }>(
    `/editorial/testimonials?limit=${limit}`,
  );
  return Array.isArray(json.data) ? json.data : [];
}

export async function fetchDealerProfile(slug: string): Promise<DealerProfileDto | null> {
  try {
    const payload = await apiFetch<{ data?: DealerProfileDto } | DealerProfileDto>(
      `/dealers/${encodeURIComponent(slug)}`,
    );
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as { data?: DealerProfileDto }).data ?? null;
    }
    return payload as DealerProfileDto;
  } catch {
    return null;
  }
}

export function formatMoney(value: string | number | null | undefined, currency = 'BDT'): string {
  if (value === null || value === undefined || value === '') return `${currency} N/A`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `${currency} ${String(value)}`;
  const code = (currency || 'BDT').toUpperCase();
  const locale =
    typeof window !== 'undefined'
      ? readStoredMarketPrefs().localeTag
      : undefined;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  } catch {
    return `${code} ${new Intl.NumberFormat(locale).format(Math.round(n))}`;
  }
}

export function resolveMediaUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `/storage/${path}`;
}

/**
 * Bikroy-style CDNs encode thumb size as `/WxH/cropped.` in the path (e.g. 72×54 vs 142×107).
 * CSV imports often list the smallest variant first — using it as the card cover looks blurry upscaled.
 */
export function embeddedListingImagePixelScore(path: string | undefined | null): number {
  if (!path) return 0;
  const m = path.match(/\/(\d+)\/(\d+)\/cropped\./i);
  if (!m) return 0;
  const w = Number(m[1]);
  const h = Number(m[2]);
  return Number.isFinite(w) && Number.isFinite(h) ? w * h : 0;
}

/** Best thumbnail path for grids/cards — prefers largest Bikroy-style variant when ties exist at score 0, keeps first URL. */
export function listingCoverMediaPath(
  media: Array<{ path: string }> | undefined | null,
): string | undefined {
  if (!media?.length) return undefined;
  let best = media[0]!.path;
  let score = embeddedListingImagePixelScore(best);
  for (let i = 1; i < media.length; i++) {
    const path = media[i]!.path;
    const s = embeddedListingImagePixelScore(path);
    if (s > score) {
      score = s;
      best = path;
    }
  }
  return best;
}

/** Carousels/galleries: show highest‑res variant first; stable for local `/storage/` paths (all score 0). */
export function sortListingMediaByCoverPreference<T extends { path: string }>(media: T[] | undefined | null): T[] {
  if (!media?.length) return [];
  return [...media].sort((a, b) => {
    const db = embeddedListingImagePixelScore(b.path) - embeddedListingImagePixelScore(a.path);
    return db !== 0 ? db : 0;
  });
}
