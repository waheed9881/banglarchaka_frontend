import { apiFetch } from './api';

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
};

export type CategoryDto = {
  id: number;
  slug: string;
  name: string;
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

/** Paginated listings (reads Laravel `meta` for totals — use on the main listings grid). */
export async function fetchListingsPaged(
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<{ items: ListingDto[]; meta: ListingsPageMeta | null }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') {
      return;
    }
    query.set(k, String(v));
  });

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

export async function fetchListings(params: Record<string, string | number | boolean | undefined> = {}): Promise<ListingDto[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    query.set(k, String(v));
  });

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
  return `${currency} ${new Intl.NumberFormat().format(Math.round(n))}`;
}

export function resolveMediaUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `/storage/${path}`;
}
