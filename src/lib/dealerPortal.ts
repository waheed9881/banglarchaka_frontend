import { apiFetch } from './api';
import type { ListingDto } from './marketplace';

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
  branches?: DealerBranchDto[];
  listings?: ListingDto[];
  staff?: Array<{
    user_id: number;
    email: string;
    name: string;
    role_title?: string | null;
  }>;
  featured_quota?: {
    plan_name?: string | null;
    slots?: number | null;
    used?: number;
    can_enable_more?: boolean;
    period_end?: string | null;
    warning_threshold_percent?: number;
  };
};

export type DealerBranchDto = {
  id: number;
  name: string;
  city?: string | null;
  address_line?: string | null;
  is_primary?: boolean;
};

export type DealerStaffDto = {
  id: number;
  user_id: number;
  role_title?: string | null;
  user?: { id: number; name: string; email: string };
};

export type DealerWarehouseDto = {
  id: number;
  name: string;
  branch_id?: number | null;
  branch?: { id: number; name: string };
};

export type DealerInventoryDto = {
  id: number;
  warehouse_id: number;
  listing_id?: number | null;
  sku?: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  stock_status: string;
  listing?: { id: number; public_id?: string; title: string };
  warehouse?: { id: number; name: string };
};

export async function fetchDealerAccount(): Promise<DealerProfileDto | null> {
  try {
    const payload = await apiFetch<{ data: DealerProfileDto }>('/account/dealer');
    return payload.data;
  } catch {
    return null;
  }
}

export async function createDealerAccount(body: {
  business_name: string;
  about?: string;
  whatsapp?: string;
  website?: string;
}): Promise<void> {
  await apiFetch('/account/dealer', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateDealerAccount(body: Partial<DealerProfileDto>): Promise<void> {
  await apiFetch('/account/dealer', { method: 'PATCH', body: JSON.stringify(body) });
}

export async function fetchDealerBranches(): Promise<DealerBranchDto[]> {
  const payload = await apiFetch<{ data: DealerBranchDto[] }>('/account/dealer/branches');
  return payload.data || [];
}

export async function createDealerBranch(body: {
  name: string;
  city?: string;
  address_line?: string;
  is_primary?: boolean;
}): Promise<void> {
  await apiFetch('/account/dealer/branches', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteDealerBranch(id: number): Promise<void> {
  await apiFetch(`/account/dealer/branches/${id}`, { method: 'DELETE' });
}

export async function fetchDealerStaff(): Promise<DealerStaffDto[]> {
  const payload = await apiFetch<{ data: DealerStaffDto[] }>('/account/dealer/staff');
  return payload.data || [];
}

export async function addDealerStaff(body: { email: string; role_title?: string }): Promise<void> {
  await apiFetch('/account/dealer/staff', { method: 'POST', body: JSON.stringify(body) });
}

export async function removeDealerStaff(userId: number): Promise<void> {
  await apiFetch(`/account/dealer/staff/${userId}`, { method: 'DELETE' });
}

export async function fetchDealerWarehouses(): Promise<DealerWarehouseDto[]> {
  const payload = await apiFetch<{ data: DealerWarehouseDto[] }>('/account/dealer/warehouses');
  return payload.data || [];
}

export async function createDealerWarehouse(body: { name: string; branch_id?: number }): Promise<void> {
  await apiFetch('/account/dealer/warehouses', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteDealerWarehouse(id: number): Promise<void> {
  await apiFetch(`/account/dealer/warehouses/${id}`, { method: 'DELETE' });
}

export async function fetchDealerInventories(): Promise<DealerInventoryDto[]> {
  const payload = await apiFetch<{ data?: { data?: DealerInventoryDto[] } | DealerInventoryDto[] }>(
    '/account/dealer/inventories?per_page=100',
  );
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
}

export async function createDealerInventory(body: {
  warehouse_id: number;
  listing_id?: number;
  sku?: string;
  quantity_on_hand: number;
  low_stock_threshold?: number;
}): Promise<void> {
  await apiFetch('/account/dealer/inventories', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateDealerInventory(
  id: number,
  body: {
    sku?: string;
    quantity_on_hand?: number;
    low_stock_threshold?: number;
    auto_hide_when_oos?: boolean;
    auto_pause_when_oos?: boolean;
    mark_sold_when_oos?: boolean;
  },
): Promise<void> {
  await apiFetch(`/account/dealer/inventories/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}
