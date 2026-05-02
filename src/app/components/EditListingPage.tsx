import { Camera, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { apiFetch, getAuthToken } from '@/lib/api';
import { createPaymentIntent } from '@/lib/payments';
import {
  fetchBrands,
  fetchFeaturedListingOptions,
  fetchListingById,
  fetchVehicleModelsForBrand,
  formatMoney,
  listingPublicHref,
  setListingFeaturedFromPlan,
  updateListing,
  type BrandDto,
  type FeaturedListingOptionsDto,
  type ListingDto,
  type VehicleModelDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';

const LISTING_TYPES = [
  { value: 'used_car', label: 'Used car' },
  { value: 'new_car', label: 'New car' },
  { value: 'used_bike', label: 'Used bike' },
  { value: 'new_bike', label: 'New bike' },
  { value: 'auto_part', label: 'Auto part' },
  { value: 'tyre_rim', label: 'Tyre / rim' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'service', label: 'Service' },
] as const;

export function EditListingPage({ listingPublicId }: { listingPublicId?: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDto | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [models, setModels] = useState<VehicleModelDto[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandSlug, setBrandSlug] = useState('');
  const [vehicleModelId, setVehicleModelId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [transmission, setTransmission] = useState('manual');
  const [fuelType, setFuelType] = useState('petrol');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('used');
  const [listingStatus, setListingStatus] = useState('pending_review');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [featuredOpts, setFeaturedOpts] = useState<FeaturedListingOptionsDto | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredErr, setFeaturedErr] = useState('');
  const [boostMethod, setBoostMethod] = useState<'cash' | 'bank_transfer' | 'rocket'>('cash');
  const [planBusy, setPlanBusy] = useState(false);
  const [boostBusy, setBoostBusy] = useState(false);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (!brandSlug) {
      setModels([]);
      return;
    }
    fetchVehicleModelsForBrand(brandSlug)
      .then(setModels)
      .catch(() => setModels([]));
  }, [brandSlug]);

  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  useEffect(() => {
    if (!listingPublicId) {
      setLoading(false);
      setForbidden(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchListingById(listingPublicId).then((row) => {
      if (cancelled) return;
      if (!row) {
        setListing(null);
        setLoading(false);
        return;
      }
      setListing(row);
      setCategoryId(row.category?.id ?? null);
      setTitle(row.title || '');
      setCity(row.location_city || 'Dhaka');
      setYear(row.vehicle_year != null ? String(row.vehicle_year) : '2020');
      setMileage(row.mileage_km != null ? String(row.mileage_km) : '');
      setTransmission(row.transmission || 'manual');
      setFuelType(row.fuel_type || 'petrol');
      setPrice(row.price != null && row.price !== '' ? String(row.price) : '');
      setDescription(row.description || '');
      setCondition(row.condition || 'used');
      setBrandSlug(row.brand?.slug || '');
      setVehicleModelId(row.vehicle_model?.id != null ? String(row.vehicle_model.id) : '');
      setListingStatus(row.status || 'pending_review');
      setPageSeo(`Edit: ${row.title} · BanglarChaka`, (row.description || row.title || '').slice(0, 160));
      if (!getAuthToken() || row.can_manage === false) {
        setForbidden(true);
      } else {
        setForbidden(false);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [listingPublicId]);

  useEffect(() => {
    if (!listingPublicId || !listing || forbidden || listing.can_manage === false) return;
    let cancelled = false;
    setFeaturedLoading(true);
    setFeaturedErr('');
    fetchFeaturedListingOptions(listingPublicId)
      .then((opts) => {
        if (!cancelled) setFeaturedOpts(opts);
      })
      .catch(() => {
        if (!cancelled) setFeaturedErr(t('listingFeatured.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingPublicId, listing, forbidden, t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#featured-ad-panel') return;
    if (!listing || forbidden) return;
    const timer = window.setTimeout(() => {
      document.getElementById('featured-ad-panel')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [listing, forbidden]);

  const listingType = listing?.listing_type || 'used_car';

  const conditionDefault = useMemo(() => {
    return listingType === 'new_car' || listingType === 'new_bike' ? 'new' : 'used';
  }, [listingType]);

  const showVehicleFields =
    listingType === 'used_car' ||
    listingType === 'new_car' ||
    listingType === 'used_bike' ||
    listingType === 'new_bike';

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next: File[] = [];
    const urls: string[] = [];
    const cap = 12 - files.length;
    for (let i = 0; i < Math.min(list.length, cap); i++) {
      const f = list.item(i);
      if (!f || !f.type.startsWith('image/')) continue;
      next.push(f);
      urls.push(URL.createObjectURL(f));
    }
    if (!next.length) return;
    setFiles((prev) => [...prev, ...next]);
    setPreviews((prev) => [...prev, ...urls]);
  };

  const formatFeaturedEnd = (iso: string | null | undefined) => {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat(i18n.language || 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(iso),
      );
    } catch {
      return iso;
    }
  };

  const refreshFeaturedOpts = () => {
    if (!listingPublicId) return;
    fetchFeaturedListingOptions(listingPublicId).then(setFeaturedOpts).catch(() => undefined);
  };

  const canBoostListing = listing?.status === 'active' && !!listing?.approved_at;

  const onTogglePlanFeatured = async (next: boolean) => {
    if (!listingPublicId) return;
    setPlanBusy(true);
    setFeaturedErr('');
    try {
      const row = await setListingFeaturedFromPlan(listingPublicId, next);
      if (row) setListing(row);
      refreshFeaturedOpts();
    } catch (e) {
      setFeaturedErr(e instanceof Error ? e.message : t('listingFeatured.loadFailed'));
    } finally {
      setPlanBusy(false);
    }
  };

  const onBuyBoostPackage = async (slug: string, currency: string, price: string | number) => {
    if (!listingPublicId || !listing) return;
    setBoostBusy(true);
    setFeaturedErr('');
    try {
      const origin = window.location.origin;
      const ret = `${origin}/my-listings/${listingPublicId}/edit`;
      const intent = await createPaymentIntent({
        amount: Number(price),
        currency,
        method: boostMethod,
        payable_type: 'listing',
        payable_id: listing.id,
        listing_boost_package_slug: slug,
        return_url: ret,
      });
      window.location.href = intent.redirect_url || ret;
    } catch (e) {
      setFeaturedErr(e instanceof Error ? e.message : t('listingFeatured.loadFailed'));
      setBoostBusy(false);
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!listingPublicId || !getAuthToken()) {
      setSaveFeedback('Sign in first.');
      return;
    }
    if (!categoryId) {
      setSaveFeedback('Listing category missing — contact support.');
      return;
    }

    setSaveFeedback('Saving…');
    try {
      const brand = brandSlug ? brands.find((b) => b.slug === brandSlug) : undefined;
      const body: Record<string, unknown> = {
        category_id: categoryId,
        title: title.trim(),
        description: description.trim() || null,
        price: Number(price),
        currency: 'BDT',
        condition: showVehicleFields ? condition : conditionDefault,
        location_city: city.trim(),
        transmission: showVehicleFields ? transmission : null,
        fuel_type: showVehicleFields ? fuelType : null,
      };

      if (brand?.id) body.brand_id = brand.id;
      else body.brand_id = null;
      if (vehicleModelId) body.vehicle_model_id = Number(vehicleModelId);
      else body.vehicle_model_id = null;

      if (showVehicleFields && year) body.vehicle_year = Number(year);
      if (showVehicleFields) body.mileage_km = mileage === '' ? null : Number(mileage);

      body.status = listingStatus;

      await updateListing(listingPublicId, body as Record<string, string | number | boolean | null | undefined>);

      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append('files[]', f));
        await apiFetch(`/listings/${listingPublicId}/media`, { method: 'POST', body: fd });
      }

      setSaveFeedback('Saved.');
      setFiles([]);
      previews.forEach((u) => URL.revokeObjectURL(u));
      setPreviews([]);
      navigate('/my-listings');
    } catch (err) {
      setSaveFeedback(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 text-center text-gray-600">
        Loading listing…
      </div>
    );
  }

  if (!listing || forbidden || listing.can_manage === false) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-800">You can’t edit this listing.</p>
          <Link to="/my-listings" className="mt-4 inline-block font-semibold text-[#233D7B] underline">
            My listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] py-10 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold">Edit listing</h1>
          <p className="mt-1 text-blue-100">{listing.title}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex gap-4 text-sm">
          <Link to="/my-listings" className="font-semibold text-[#233D7B] underline">
            ← My listings
          </Link>
          <Link to={listingPublicHref(listing)} className="font-semibold text-[#233D7B] underline">
            View live page
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <form className="space-y-6" onSubmit={submit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Listing type</label>
                <select
                  disabled
                  value={listingType}
                  className="w-full cursor-not-allowed rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3"
                >
                  {LISTING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={listingStatus}
                  onChange={(e) => setListingStatus(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending review</option>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="rejected" disabled={listing.status !== 'rejected'}>
                    Rejected
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3"
                >
                  <option value="used">Used</option>
                  <option value="new">New</option>
                  <option value="reconditioned">Reconditioned</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Make</label>
                <select
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3"
                >
                  <option value="">—</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Model</label>
                <select
                  value={vehicleModelId}
                  onChange={(e) => setVehicleModelId(e.target.value)}
                  disabled={!brandSlug || models.length === 0}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 disabled:bg-gray-100"
                >
                  <option value="">—</option>
                  {models.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3">
                  <option>Dhaka</option>
                  <option>Chattogram</option>
                  <option>Rajshahi</option>
                  <option>Khulna</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Price (BDT) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3"
                />
              </div>
              {showVehicleFields ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Year</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3">
                      {Array.from({ length: 36 }, (_, i) => 2026 - i).map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Mileage (KM)</label>
                    <input value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Transmission</label>
                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3">
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Fuel</label>
                    <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3">
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                </>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full resize-none rounded-lg border-2 border-gray-300 px-4 py-3" />
            </div>

            <div id="featured-ad-panel" className="rounded-xl border border-amber-200 bg-amber-50/90 scroll-mt-24 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">{t('listingFeatured.title')}</h3>
              <p className="mt-2 text-sm text-gray-700">{t('listingFeatured.lead')}</p>

              {featuredErr ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{featuredErr}</div>
              ) : null}

              {featuredLoading ? (
                <p className="mt-4 text-sm text-gray-600">{t('listingFeatured.loading')}</p>
              ) : featuredOpts ? (
                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-800">
                    {listing.featured && listing.featured_until
                      ? t('listingFeatured.statusFeaturedUntil', { date: formatFeaturedEnd(listing.featured_until) })
                      : listing.featured
                        ? t('listingFeatured.statusFeaturedIndefinite')
                        : t('listingFeatured.statusNotFeatured')}
                  </p>
                  {!canBoostListing ? (
                    <p className="text-sm font-semibold text-amber-900">{t('listingFeatured.mustBeLive')}</p>
                  ) : null}

                  {featuredOpts.dealer_subscription ? (
                    <div className="rounded-lg border border-white/80 bg-white/70 p-4">
                      <p className="text-sm font-bold text-gray-900">{t('listingFeatured.dealerPlanHeading')}</p>
                      {!featuredOpts.dealer_subscription.plan_name ? (
                        <p className="mt-2 text-sm text-gray-600">{t('listingFeatured.dealerNoSlots')}</p>
                      ) : featuredOpts.dealer_subscription.featured_slots === null ? (
                        <p className="mt-2 text-sm text-gray-700">
                          {t('listingFeatured.dealerSlotsUnlimited', { plan: featuredOpts.dealer_subscription.plan_name })}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-700">
                          {t('listingFeatured.dealerSlots', {
                            plan: featuredOpts.dealer_subscription.plan_name,
                            used: featuredOpts.dealer_subscription.featured_slots_used,
                            total: featuredOpts.dealer_subscription.featured_slots,
                          })}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {canBoostListing &&
                        featuredOpts.dealer_subscription.can_enable_via_plan &&
                        !listing.featured ? (
                          <button
                            type="button"
                            disabled={planBusy}
                            onClick={() => onTogglePlanFeatured(true)}
                            className="rounded-lg bg-[#233D7B] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a2d5a] disabled:opacity-50"
                          >
                            {planBusy ? t('listingFeatured.planWorking') : t('listingFeatured.usePlanSlot')}
                          </button>
                        ) : null}
                        {listing.featured ? (
                          <button
                            type="button"
                            disabled={planBusy}
                            onClick={() => onTogglePlanFeatured(false)}
                            className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {planBusy ? t('listingFeatured.planWorking') : t('listingFeatured.removeFeatured')}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-sm font-bold text-gray-900">{t('listingFeatured.packagesHeading')}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        {t('listingFeatured.payWith')}
                      </label>
                      <select
                        value={boostMethod}
                        onChange={(e) => setBoostMethod(e.target.value as 'cash' | 'bank_transfer' | 'rocket')}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="cash">Cash (demo)</option>
                        <option value="bank_transfer">Bank transfer (demo)</option>
                        <option value="rocket">Rocket (demo)</option>
                      </select>
                    </div>
                    <ul className="mt-3 divide-y divide-amber-100 rounded-lg border border-amber-100 bg-white/80">
                      {featuredOpts.packages.map((pkg) => (
                        <li key={pkg.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{pkg.name}</p>
                            <p className="text-xs text-gray-600">
                              {t('listingFeatured.packageDays', { count: pkg.duration_days })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-[#3EB549]">{formatMoney(pkg.price, pkg.currency)}</span>
                            <button
                              type="button"
                              disabled={!canBoostListing || boostBusy}
                              onClick={() => onBuyBoostPackage(pkg.slug, pkg.currency, pkg.price)}
                              className="rounded-lg bg-[#C4161C] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {boostBusy ? t('listingFeatured.boostWorking') : t('listingFeatured.buyPackage')}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">Add photos</label>
              <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                {previews.map((src, index) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length < 12 ? (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <Camera className="mb-1 h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-500">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onPickFiles(e.target.files); e.target.value = ''; }} />
                  </label>
                ) : null}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 rounded-lg bg-[#C4161C] py-4 text-lg font-bold text-white hover:bg-red-700">
                Save changes
              </button>
              <button type="button" onClick={() => navigate('/my-listings')} className="border-2 border-gray-300 px-8 py-4 font-bold text-gray-700 hover:border-gray-400">
                Cancel
              </button>
            </div>
            {saveFeedback ? <p className="text-sm font-semibold text-[#233D7B]">{saveFeedback}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
