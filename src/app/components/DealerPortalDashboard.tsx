import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Building2, ExternalLink, Megaphone, Package, PencilLine, Store, Users, Warehouse } from 'lucide-react';
import { dp } from '@/app/components/dealerPortalTheme';
import {
  addDealerStaff,
  createDealerAccount,
  createDealerBranch,
  createDealerInventory,
  createDealerWarehouse,
  deleteDealerBranch,
  deleteDealerWarehouse,
  fetchDealerAccount,
  fetchDealerBranches,
  fetchDealerInventories,
  fetchDealerStaff,
  fetchDealerWarehouses,
  removeDealerStaff,
  updateDealerAccount,
  updateDealerInventory,
  type DealerBranchDto,
  type DealerInventoryDto,
  type DealerProfileDto,
  type DealerStaffDto,
  type DealerWarehouseDto,
} from '@/lib/dealerPortal';
import {
  formatMoney,
  listingPublicHref,
  listingCoverMediaPath,
  resolveMediaUrl,
  type ListingDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';

const LISTING_THUMB_FALLBACK =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=640&q=70';

function listingShowroomBadge(listing: ListingDto): { label: string; className: string } {
  const approved = Boolean(listing.approved_at);
  const onShowroom =
    approved && (listing.status === 'active' || listing.status === 'sold');
  if (onShowroom) {
    return { label: 'On showroom', className: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' };
  }
  if (!approved) {
    return { label: 'Pending review', className: 'bg-amber-50 text-amber-900 ring-1 ring-amber-100' };
  }
  return {
    label: listing.status?.replace(/_/g, ' ') ?? 'Not public',
    className: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  };
}

export function DealerPortalDashboard() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<DealerProfileDto | null>(null);
  const [branches, setBranches] = useState<DealerBranchDto[]>([]);
  const [staff, setStaff] = useState<DealerStaffDto[]>([]);
  const [warehouses, setWarehouses] = useState<DealerWarehouseDto[]>([]);
  const [inventories, setInventories] = useState<DealerInventoryDto[]>([]);

  const [businessName, setBusinessName] = useState('');
  const [about, setAbout] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');

  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRoleTitle, setStaffRoleTitle] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseBranchId, setWarehouseBranchId] = useState('');

  const [inventoryWarehouseId, setInventoryWarehouseId] = useState('');
  const [inventoryListingId, setInventoryListingId] = useState('');
  const [inventorySku, setInventorySku] = useState('');
  const [inventoryQty, setInventoryQty] = useState('1');
  const [inventoryLowStock, setInventoryLowStock] = useState('0');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, b, s, w, i] = await Promise.all([
        fetchDealerAccount(),
        fetchDealerBranches().catch(() => []),
        fetchDealerStaff().catch(() => []),
        fetchDealerWarehouses().catch(() => []),
        fetchDealerInventories().catch(() => []),
      ]);
      setProfile(p);
      setBranches(b);
      setStaff(s);
      setWarehouses(w);
      setInventories(i);

      if (p) {
        setBusinessName(p.business_name || '');
        setAbout(p.about || '');
        setWhatsapp(p.whatsapp || '');
        setWebsite(p.website || '');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load dealer portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageSeo('Dealer portal · BanglarChaka', 'Branches, staff, warehouses, and inventory linked to your showroom.');
  }, []);

  useEffect(() => {
    loadAll().catch(() => undefined);
  }, []);

  const adsCount = profile?.listings?.length ?? 0;

  const summary = useMemo(
    () => ({
      branches: branches.length,
      staff: staff.length,
      warehouses: warehouses.length,
      inventories: inventories.length,
      ads: adsCount,
    }),
    [adsCount, branches.length, staff.length, warehouses.length, inventories.length],
  );
  const featuredQuota = profile?.featured_quota;
  const featuredUsed = featuredQuota?.used ?? 0;
  const featuredSlots = featuredQuota?.slots;
  const warningThreshold = Math.max(1, Math.min(100, featuredQuota?.warning_threshold_percent ?? 80));
  const featuredLabel = featuredSlots == null ? `${featuredUsed} / Unlimited` : `${featuredUsed} / ${featuredSlots}`;
  const featuredPercent =
    featuredSlots && featuredSlots > 0
      ? Math.max(0, Math.min(100, Math.round((featuredUsed / featuredSlots) * 100)))
      : null;
  const featuredFull = featuredSlots != null && featuredSlots > 0 && featuredUsed >= featuredSlots;
  const featuredNearLimit = featuredPercent != null && featuredPercent >= warningThreshold;

  const saveProfile = async () => {
    try {
      if (!profile) {
        await createDealerAccount({
          business_name: businessName,
          about,
          whatsapp,
          website,
        });
        setMessage('Dealer profile created');
      } else {
        await updateDealerAccount({
          business_name: businessName,
          about,
          whatsapp,
          website,
        });
        setMessage('Dealer profile updated');
      }
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Profile save failed');
    }
  };

  const addBranch = async () => {
    try {
      await createDealerBranch({ name: branchName, city: branchCity, address_line: branchAddress });
      setBranchName('');
      setBranchCity('');
      setBranchAddress('');
      setMessage('Branch added');
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Branch add failed');
    }
  };

  const addStaff = async () => {
    try {
      await addDealerStaff({ email: staffEmail, role_title: staffRoleTitle || undefined });
      setStaffEmail('');
      setStaffRoleTitle('');
      setMessage('Staff linked');
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Staff add failed');
    }
  };

  const addWarehouse = async () => {
    try {
      await createDealerWarehouse({
        name: warehouseName,
        branch_id: warehouseBranchId ? Number(warehouseBranchId) : undefined,
      });
      setWarehouseName('');
      setWarehouseBranchId('');
      setMessage('Warehouse created');
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Warehouse add failed');
    }
  };

  const addInventory = async () => {
    try {
      await createDealerInventory({
        warehouse_id: Number(inventoryWarehouseId),
        listing_id: inventoryListingId ? Number(inventoryListingId) : undefined,
        sku: inventorySku || undefined,
        quantity_on_hand: Number(inventoryQty),
        low_stock_threshold: Number(inventoryLowStock || 0),
      });
      setInventoryWarehouseId('');
      setInventoryListingId('');
      setInventorySku('');
      setInventoryQty('1');
      setInventoryLowStock('0');
      setMessage('Inventory created');
      await loadAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Inventory add failed');
    }
  };

  const stats = [
    { label: 'Branches', value: summary.branches, icon: Building2, tint: 'bg-slate-100 text-[#233D7B] ring-slate-200' },
    { label: 'Team', value: summary.staff, icon: Users, tint: 'bg-violet-50 text-violet-700 ring-violet-100' },
    { label: 'Ads', value: summary.ads, icon: Megaphone, tint: 'bg-amber-50 text-amber-800 ring-amber-100' },
    { label: 'Warehouses', value: summary.warehouses, icon: Warehouse, tint: 'bg-slate-100 text-slate-800 ring-slate-200' },
    { label: 'Stock lines', value: summary.inventories, icon: Package, tint: 'bg-emerald-50 text-emerald-800 ring-emerald-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className={dp.sectionTitle}>Operations overview</h2>
        <p className={dp.sectionHint}>
          Branding, locations, team, and warehouse stock. Chat with buyers in{' '}
          <Link to="/messages" className="font-semibold text-[#233D7B] hover:underline">
            Messages
          </Link>
          . Run payroll in{' '}
          <Link to="/dealer/portal/hr" className="font-semibold text-[#233D7B] hover:underline">
            HR
          </Link>{' '}
          and books in{' '}
          <Link to="/dealer/portal/finance" className="font-semibold text-[#233D7B] hover:underline">
            Finance
          </Link>
          .
        </p>
      </div>

      {message ? <div className={dp.alert}>{message}</div> : null}

      {loading ? (
        <div className={`${dp.card} ${dp.cardPad} flex items-center gap-4 animate-pulse`}>
          <div className="h-12 w-12 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-3 w-full max-w-md rounded bg-slate-100" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map(({ label, value, icon: Icon, tint }) => (
              <div key={label} className={dp.statCard}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={dp.statLabel}>{label}</div>
                    <div className={dp.statValue}>{value}</div>
                  </div>
                  <div className={`rounded-xl p-2.5 ring-1 ${tint}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <section className={`${dp.card} border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/70`}>
            <div className={dp.cardPad}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-900">Featured quota</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {featuredQuota?.plan_name
                      ? `${featuredQuota.plan_name} plan: ${featuredLabel} featured cars this month`
                      : 'No active dealer plan. Buy featured packages or activate a premium plan.'}
                  </p>
                  {featuredQuota?.period_end ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Resets at: {new Date(featuredQuota.period_end).toLocaleString()}
                    </p>
                  ) : null}
                  {featuredPercent != null ? (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-slate-600">Usage</span>
                        <span className={`font-semibold ${featuredFull ? 'text-red-700' : featuredNearLimit ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {featuredPercent}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            featuredFull ? 'bg-red-600' : featuredNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${featuredPercent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">Warning starts at {warningThreshold}%</p>
                    </div>
                  ) : null}
                </div>
                <div className={`rounded-2xl px-4 py-2 text-white shadow-sm ${featuredFull ? 'bg-red-700' : 'bg-[#C4161C]'}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/85">Featured used</div>
                  <div className="text-2xl font-bold leading-tight">{featuredLabel}</div>
                </div>
              </div>
              {featuredFull ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
                  Featured quota reached. Upgrade plan or use paid packages for more featured ads.
                </div>
              ) : null}
            </div>
          </section>

          <section className={`${dp.card}`}>
            <div className={`${dp.cardPad} border-b border-slate-100`}>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#233D7B]/10 p-2.5 text-[#233D7B]">
                  <Store className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className={dp.sectionTitle}>Public showroom profile</h3>
                  <p className={dp.sectionHint}>What buyers see on your dealer page — keep it sharp.</p>
                </div>
              </div>
            </div>
            <div className={dp.cardPad}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Business name</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Horizon Motors Dhaka" className={dp.input} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp</label>
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+880…" className={dp.input} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Website</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={dp.input} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">URL slug</label>
                  <input
                    value={profile?.slug ?? ''}
                    disabled
                    readOnly
                    placeholder="Generated after first save"
                    className={`${dp.input} cursor-not-allowed bg-slate-50 text-slate-500`}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">About your showroom</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Authorized dealer, financing, service bay…" className={dp.textarea} rows={4} />
              </div>
              <button type="button" onClick={saveProfile} className={`mt-6 ${dp.btnPrimary}`}>
                {profile ? 'Save profile changes' : 'Create dealer profile'}
              </button>
            </div>
          </section>

          {profile ? (
            <section className={dp.card}>
              <div className={`${dp.cardPad} border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4`}>
                <div>
                  <h3 className={dp.sectionTitle}>Inventory & ads</h3>
                  <p className={dp.sectionHint}>Approved listings surface on your public dealer page. Pending items stay internal.</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link to={`/dealers/${profile.slug}`} className={`${dp.btnPrimary}`}>
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Public showroom
                  </Link>
                  <Link to="/my-listings" className={dp.btnSecondary}>
                    My listings
                  </Link>
                  <Link to="/post-ad" className={`${dp.btnSecondary} border-dashed border-slate-300`}>
                    Post ad
                  </Link>
                </div>
              </div>
              <div className={dp.cardPad}>
                {!profile.listings?.length ? (
                  <p className="text-sm text-slate-600 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center">
                    No vehicles yet. Publish an ad — once moderated, it appears here and on your showroom.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {profile.listings.map((listing) => {
                      const badge = listingShowroomBadge(listing);
                      const href = listingPublicHref(listing);
                      return (
                        <article
                          key={listing.id}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-transparent transition-all hover:shadow-lg hover:ring-[#233D7B]/15"
                        >
                          <div className="aspect-[16/10] bg-slate-100">
                            <img
                              src={resolveMediaUrl(listingCoverMediaPath(listing.media)) || LISTING_THUMB_FALLBACK}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-2 p-4">
                            <span className={`self-start rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${badge.className}`}>
                              {badge.label}
                            </span>
                            <h4 className="line-clamp-2 font-semibold leading-snug text-slate-900">{listing.title}</h4>
                            <p className="text-base font-bold text-[#C4161C]">{formatMoney(listing.price, listing.currency)}</p>
                            <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                              <Link to={href} className={`${dp.btnGhost} text-xs`}>
                                View listing
                              </Link>
                              <Link to={`/my-listings/${listing.id}/edit`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#233D7B]">
                                <PencilLine className="h-3.5 w-3.5" aria-hidden />
                                Edit
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className={dp.card}>
              <div className={`${dp.cardPad} border-b border-slate-100`}>
                <h3 className={dp.sectionTitle}>Branches</h3>
                <p className={dp.sectionHint}>Physical locations — shown on your public profile.</p>
              </div>
              <div className={dp.cardPad}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="Branch name" className={dp.input} />
                  <input value={branchCity} onChange={(e) => setBranchCity(e.target.value)} placeholder="City" className={dp.input} />
                  <input value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} placeholder="Address line" className={dp.input} />
                </div>
                <button type="button" onClick={addBranch} className={dp.btnPrimary}>
                  Add branch
                </button>
                <ul className="mt-5 space-y-2">
                  {branches.map((b) => (
                    <li key={b.id} className={dp.listRow}>
                      <span className="text-sm font-medium text-slate-800">
                        {b.name}
                        <span className="font-normal text-slate-500"> · {b.city || 'City N/A'}</span>
                      </span>
                      <button type="button" onClick={() => deleteDealerBranch(b.id).then(loadAll)} className={dp.btnDanger}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={dp.card}>
              <div className={`${dp.cardPad} border-b border-slate-100`}>
                <h3 className={dp.sectionTitle}>Team access</h3>
                <p className={dp.sectionHint}>Portal staff — link existing BanglarChaka accounts by email.</p>
              </div>
              <div className={dp.cardPad}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="colleague@email.com" className={dp.input} />
                  <input value={staffRoleTitle} onChange={(e) => setStaffRoleTitle(e.target.value)} placeholder="Role e.g. Sales lead" className={dp.input} />
                </div>
                <button type="button" onClick={addStaff} className={dp.btnPrimary}>
                  Invite / link staff
                </button>
                <ul className="mt-5 space-y-2">
                  {staff.map((s) => (
                    <li key={s.id} className={dp.listRow}>
                      <span className="text-sm text-slate-800">
                        <span className="font-semibold">{s.user?.name || 'User'}</span>
                        <span className="block text-xs text-slate-500">{s.user?.email}</span>
                        <span className="text-xs text-slate-600">{s.role_title || 'Staff'}</span>
                      </span>
                      <button type="button" onClick={() => removeDealerStaff(s.user_id).then(loadAll)} className={dp.btnDanger}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className={dp.card}>
              <div className={`${dp.cardPad} border-b border-slate-100`}>
                <h3 className={dp.sectionTitle}>Warehouses</h3>
                <p className={dp.sectionHint}>Stock locations — optionally tied to a branch.</p>
              </div>
              <div className={dp.cardPad}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} placeholder="Warehouse name" className={dp.input} />
                  <select value={warehouseBranchId} onChange={(e) => setWarehouseBranchId(e.target.value)} className={dp.select}>
                    <option value="">No branch link</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={addWarehouse} className={dp.btnPrimary}>
                  Add warehouse
                </button>
                <ul className="mt-5 space-y-2">
                  {warehouses.map((w) => (
                    <li key={w.id} className={dp.listRow}>
                      <span className="text-sm font-medium text-slate-800">
                        {w.name}
                        <span className="font-normal text-slate-500"> · {w.branch?.name || 'Unassigned'}</span>
                      </span>
                      <button type="button" onClick={() => deleteDealerWarehouse(w.id).then(loadAll)} className={dp.btnDanger}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={dp.card}>
              <div className={`${dp.cardPad} border-b border-slate-100`}>
                <h3 className={dp.sectionTitle}>New stock line</h3>
                <p className={dp.sectionHint}>Optional link to a listing record for unified inventory.</p>
              </div>
              <div className={dp.cardPad}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <select value={inventoryWarehouseId} onChange={(e) => setInventoryWarehouseId(e.target.value)} className={dp.select}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <input value={inventoryListingId} onChange={(e) => setInventoryListingId(e.target.value)} placeholder="Listing ID (optional)" className={dp.input} />
                  <input value={inventorySku} onChange={(e) => setInventorySku(e.target.value)} placeholder="SKU / internal code" className={dp.input} />
                  <input value={inventoryQty} onChange={(e) => setInventoryQty(e.target.value)} placeholder="Quantity on hand" className={dp.input} />
                  <input value={inventoryLowStock} onChange={(e) => setInventoryLowStock(e.target.value)} placeholder="Low-stock alert threshold" className={`${dp.input} md:col-span-2`} />
                </div>
                <button type="button" onClick={addInventory} className={dp.btnAccent}>
                  Create inventory row
                </button>
              </div>
            </section>
          </div>

          <section className={dp.card}>
            <div className={`${dp.cardPad} border-b border-slate-100`}>
              <h3 className={dp.sectionTitle}>Stock ledger</h3>
              <p className={dp.sectionHint}>Quick quantity tweaks — detailed costing lives in Finance.</p>
            </div>
            <div className={`${dp.cardPad} space-y-2`}>
              {inventories.map((inv) => (
                <div key={inv.id} className={dp.listRow}>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{inv.listing?.title || 'Unlinked SKU'}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {inv.warehouse?.name ?? 'Warehouse'} · on hand {inv.quantity_on_hand} · reserved {inv.quantity_reserved} ·{' '}
                      <span className="font-medium uppercase tracking-wide">{inv.stock_status}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const qty = window.prompt('New quantity on hand', String(inv.quantity_on_hand));
                      if (qty === null) return;
                      const parsed = Number(qty);
                      if (Number.isNaN(parsed)) return;
                      updateDealerInventory(inv.id, { quantity_on_hand: parsed }).then(loadAll).catch(() => undefined);
                    }}
                    className={dp.btnSecondary}
                  >
                    Adjust qty
                  </button>
                </div>
              ))}
              {!inventories.length ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">No stock rows yet.</p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
