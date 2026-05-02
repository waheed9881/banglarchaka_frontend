import { apiFetch } from './api';
import type { ListingDto, ListingsPageMeta } from './marketplace';

export type AuctionBidDto = {
  id: number;
  amount: string | number;
  created_at?: string | null;
  bidder_label?: string | null;
  is_mine?: boolean;
};

export type DealerSummaryNested = {
  slug: string;
  business_name: string;
  logo_path?: string | null;
  verified_at?: string | null;
};

export type AuctionSummaryDto = {
  id: string;
  status: string;
  display_status: string;
  starting_bid: string | number;
  bid_increment: string | number;
  current_high_amount?: string | number | null;
  minimum_next_bid: string | number;
  bid_count: number;
  starts_at?: string | null;
  ends_at: string;
  accepting_bids: boolean;
  auction_sheet_url?: string | null;
  reserve_met?: boolean | null;
  sale_completed?: boolean;
  closed_by_reserve?: boolean;
  winning_bid_amount?: string | number | null;
  reserve_price?: string | number | null;
  listing?: ListingDto | null;
  dealer?: DealerSummaryNested | null;
  can_manage?: boolean;
};

export type AuctionDetailDto = AuctionSummaryDto & {
  recent_bids?: AuctionBidDto[];
  listing?: ListingDto | null;
  leading_bid_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function parseMeta(payload: unknown): ListingsPageMeta | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw = (payload as { meta?: unknown }).meta;
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  const total = Number(m.total);
  const current_page = Number(m.current_page);
  const last_page = Number(m.last_page);
  const per_page = Number(m.per_page);
  if (!Number.isFinite(total) || !Number.isFinite(current_page)) return null;
  return {
    total,
    current_page,
    last_page: Number.isFinite(last_page) ? last_page : current_page,
    per_page: Number.isFinite(per_page) ? per_page : 20,
  };
}

function toAuctionArray(payload: unknown): AuctionSummaryDto[] {
  if (payload === null || payload === undefined) return [];
  if (Array.isArray(payload)) return payload as AuctionSummaryDto[];
  if (typeof payload !== 'object') return [];
  const top = payload as { data?: unknown };
  if (!top.data) return [];
  if (Array.isArray(top.data)) return top.data as AuctionSummaryDto[];
  const nested = top.data as { data?: unknown };
  if (nested && Array.isArray(nested.data)) return nested.data as AuctionSummaryDto[];
  return [];
}

export async function fetchAuctionsPaged(
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<{ items: AuctionSummaryDto[]; meta: ListingsPageMeta | null }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    query.set(k, String(v));
  });
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const json = await apiFetch<unknown>(`/auctions${suffix}`);
  return {
    items: toAuctionArray(json),
    meta: parseMeta(json),
  };
}

export async function fetchAuctionDetail(id: string): Promise<AuctionDetailDto> {
  const json = await apiFetch<{ data: AuctionDetailDto }>(`/auctions/${encodeURIComponent(id)}`);
  return json.data;
}

export async function placeAuctionBid(auctionId: string, amount: number): Promise<{ data: AuctionBidDto; message?: string }> {
  return apiFetch<{ data: AuctionBidDto; message?: string }>(`/auctions/${encodeURIComponent(auctionId)}/bids`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function fetchDealerAuctionsPaged(
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<{ items: AuctionSummaryDto[]; meta: ListingsPageMeta | null }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    query.set(k, String(v));
  });
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const json = await apiFetch<unknown>(`/account/dealer/auctions${suffix}`);
  return {
    items: toAuctionArray(json),
    meta: parseMeta(json),
  };
}

export async function createDealerAuction(body: {
  listing_public_id: string;
  starting_bid: number;
  bid_increment?: number;
  reserve_price?: number | null;
  auction_sheet_url?: string | null;
  starts_at?: string | null;
  ends_at?: string;
  duration_minutes?: number;
}): Promise<AuctionDetailDto> {
  const json = await apiFetch<{ data: AuctionDetailDto }>('/account/dealer/auctions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return json.data;
}

export async function cancelDealerAuction(auctionPublicId: string): Promise<AuctionDetailDto> {
  const json = await apiFetch<{ data: AuctionDetailDto }>(
    `/account/dealer/auctions/${encodeURIComponent(auctionPublicId)}/cancel`,
    { method: 'POST' },
  );
  return json.data;
}
