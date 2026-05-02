import { apiFetch, setAuthToken } from './api';
import type { ListingDto } from './marketplace';

function listingsFromPayload(payload: unknown): ListingDto[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as { data?: unknown; meta?: unknown };
  if (Array.isArray(root.data)) return root.data as ListingDto[];
  const inner = root.data as { data?: ListingDto[] } | undefined;
  if (inner && Array.isArray(inner.data)) return inner.data;
  return [];
}

export async function fetchWishlistListings(): Promise<ListingDto[]> {
  const json = await apiFetch<unknown>('/wishlists?per_page=100');
  return listingsFromPayload(json);
}

export async function addToWishlist(listingPublicId: string): Promise<void> {
  await apiFetch('/wishlists', {
    method: 'POST',
    body: JSON.stringify({ listing_public_id: listingPublicId }),
  });
}

export async function removeFromWishlist(listingPublicId: string): Promise<void> {
  await apiFetch(`/wishlists/${listingPublicId}`, { method: 'DELETE' });
}

export async function sendLoginOtp(phone: string): Promise<{ debugCode?: string }> {
  const payload = await apiFetch<{ debug_code?: string }>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ channel: 'sms', phone, purpose: 'login' }),
  });
  return { debugCode: payload.debug_code };
}

export async function loginWithPhoneOtp(phone: string, otp: string): Promise<{ token: string }> {
  const payload = await apiFetch<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
  setAuthToken(payload.token);
  return { token: payload.token };
}

export type ConversationSummaryDto = {
  id: number;
  subject?: string | null;
  listing_id?: number | null;
  last_message_at?: string | null;
  listing?: { title?: string; public_id?: string };
  participants?: Array<{ user?: { id: number; name: string } }>;
};

export type MessageDto = {
  id: number;
  body?: string | null;
  created_at?: string;
  sender_user_id?: number | null;
  sender?: { id: number; name: string };
};

function parseConversationPage(payload: unknown): { rows: ConversationSummaryDto[]; meta: { last_page: number; total: number } } {
  if (!payload || typeof payload !== 'object') return { rows: [], meta: { last_page: 1, total: 0 } };
  const root = payload as { data?: { data?: ConversationSummaryDto[]; last_page?: number; total?: number } };
  const inner = root.data;
  if (!inner || typeof inner !== 'object') return { rows: [], meta: { last_page: 1, total: 0 } };
  return {
    rows: inner.data || [],
    meta: { last_page: inner.last_page || 1, total: inner.total || 0 },
  };
}

function parseMessagesPage(payload: unknown): MessageDto[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as { data?: MessageDto[] | { data?: MessageDto[] } };
  if (!root.data) return [];
  if (Array.isArray(root.data)) return root.data;
  return root.data.data || [];
}

export async function fetchConversations(): Promise<ConversationSummaryDto[]> {
  const json = await apiFetch<unknown>('/conversations');
  return parseConversationPage(json).rows;
}

export async function openOrCreateConversation(listingPublicId: string): Promise<ConversationSummaryDto> {
  const payload = await apiFetch<{ data: ConversationSummaryDto }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ listing_public_id: listingPublicId }),
  });
  return payload.data;
}

/** Buyer ↔ dealer showroom thread (no specific listing). */
export async function openOrCreateDealerConversation(dealerSlug: string): Promise<ConversationSummaryDto> {
  const payload = await apiFetch<{ data: ConversationSummaryDto }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ dealer_slug: dealerSlug }),
  });
  return payload.data;
}

export async function fetchConversationMessages(conversationId: number): Promise<MessageDto[]> {
  const json = await apiFetch<unknown>(`/conversations/${conversationId}/messages`);
  return parseMessagesPage(json);
}

export async function sendConversationMessage(conversationId: number, body: string): Promise<void> {
  await apiFetch(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}
