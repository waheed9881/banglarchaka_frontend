import { ArrowRight, Bike, Car, Gauge, Fuel, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { fetchListings, resolveMediaUrl, type ListingDto } from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

const FALLBACK_CAR =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=640&q=80';

function displayCarName(row: ListingDto): string {
  const brand = row.brand?.name?.trim();
  const model = row.vehicle_model?.name?.trim();
  if (brand && model) return `${brand} ${model}`;
  return row.title.length > 48 ? `${row.title.slice(0, 48)}…` : row.title;
}

function optLabel(row: ListingDto): string {
  const brand = row.brand?.name;
  const model = row.vehicle_model?.name;
  const core = brand && model ? `${brand} ${model}` : row.title;
  const trimmed = core.slice(0, 56);
  const kind = row.listing_type === 'used_bike' ? 'Bike' : 'Car';
  return `${trimmed}${core.length > 56 ? '…' : ''} · ${kind}`;
}

export function CompareSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<ListingDto[]>([]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchListings({ listing_type: 'used_car', per_page: 80, sort: 'views' }),
      fetchListings({ listing_type: 'used_bike', per_page: 48, sort: 'views' }),
    ])
      .then(([cars, bikes]) => {
        if (!cancelled) setItems([...cars, ...bikes]);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { cars, bikes } = useMemo(() => {
    const carRows = items.filter((r) => r.listing_type === 'used_car');
    const bikeRows = items.filter((r) => r.listing_type === 'used_bike');
    return { cars: carRows, bikes: bikeRows };
  }, [items]);

  const { featuredPair, sidebarPairs } = useMemo(() => {
    const pool = cars.slice(0, 12);
    if (pool.length < 2) {
      return { featuredPair: null as [ListingDto, ListingDto] | null, sidebarPairs: [] as [ListingDto, ListingDto][] };
    }
    const featuredPair: [ListingDto, ListingDto] = [pool[0], pool[1]];
    const sidebarPairs: [ListingDto, ListingDto][] = [];
    for (let i = 2; i + 1 < pool.length && sidebarPairs.length < 3; i += 2) {
      sidebarPairs.push([pool[i], pool[i + 1]]);
    }
    return { featuredPair, sidebarPairs };
  }, [cars]);

  const selectionConflict =
    Boolean(a && b && a === b) ||
    Boolean(c && a && c === a) ||
    Boolean(c && b && c === b);

  const canCompare = Boolean(a && b && !selectionConflict);

  const compare = () => {
    if (!canCompare) return;
    const q = new URLSearchParams({ a, b });
    if (c) q.set('c', c);
    navigate(`/compare?${q.toString()}`);
  };

  const selectClass =
    'w-full appearance-none px-4 py-3.5 pr-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#233D7B]/25 focus:border-[#233D7B] hover:border-gray-300';

  return (
    <section
      id="compare"
      className="relative overflow-hidden border-y border-slate-100 bg-[#f8f9fa] py-16 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(35,61,123,0.09),transparent)]" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4">
        {featuredPair ? (
          <div className="mb-12 md:mb-14">
            <PremiumSectionHeading
              eyebrow={t('homePremiumHeading.compareCarouselEyebrow')}
              title={t('homePremiumHeading.compareCarouselTitle')}
              action={
                <Link
                  to={{ pathname: '/', hash: 'compare-tool' }}
                  className="shrink-0 text-sm font-bold text-[#ba0035] underline-offset-4 hover:underline md:text-base"
                >
                  {t('homePremiumHeading.compareCarouselLink')}
                </Link>
              }
            />

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div
                className={`grid divide-gray-100 ${sidebarPairs.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] divide-y lg:divide-y-0 lg:divide-x' : ''}`}
              >
                <div className="p-6 md:p-8 flex flex-col">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 flex-1">
                    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[200px] md:max-w-[220px] w-full">
                      <div className="flex h-32 md:h-36 w-full items-center justify-center rounded-lg bg-gray-50 p-3">
                        <ImageWithFallback
                          src={resolveMediaUrl(featuredPair[0].media?.[0]?.path) || FALLBACK_CAR}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="mt-3 text-center text-sm md:text-base font-bold text-[#233D7B] leading-snug">
                        {displayCarName(featuredPair[0])}
                      </p>
                    </div>

                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#C4161C] text-white text-sm font-extrabold shadow-md ring-4 ring-white"
                      aria-hidden
                    >
                      VS
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[200px] md:max-w-[220px] w-full">
                      <div className="flex h-32 md:h-36 w-full items-center justify-center rounded-lg bg-gray-50 p-3">
                        <ImageWithFallback
                          src={resolveMediaUrl(featuredPair[1].media?.[0]?.path) || FALLBACK_CAR}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="mt-3 text-center text-sm md:text-base font-bold text-[#233D7B] leading-snug">
                        {displayCarName(featuredPair[1])}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/compare?a=${featuredPair[0].id}&b=${featuredPair[1].id}`}
                    className="mt-8 w-full md:w-auto md:self-center rounded-lg border-2 border-[#233D7B] bg-white px-8 py-3 text-center text-sm font-bold text-[#233D7B] transition hover:bg-blue-50"
                  >
                    View Comparison
                  </Link>
                </div>

                {sidebarPairs.length > 0 ? (
                  <div className="p-5 md:p-6 bg-gray-50/50 lg:bg-white flex flex-col justify-center border-t lg:border-t-0 border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3 lg:hidden">
                      More comparisons
                    </p>
                    <div className="divide-y divide-gray-100">
                      {sidebarPairs.map(([left, right], idx) => (
                        <Link
                          key={`${left.id}-${right.id}-${idx}`}
                          to={`/compare?a=${left.id}&b=${right.id}`}
                          className="block py-4 first:pt-0 last:pb-0 hover:bg-gray-50/80 lg:hover:bg-gray-50 rounded-lg px-1 -mx-1 transition"
                        >
                          <p className="text-center text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {displayCarName(left)}
                          </p>
                          <div className="flex justify-center my-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C4161C] text-[10px] font-bold text-white">
                              VS
                            </span>
                          </div>
                          <p className="text-center text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {displayCarName(right)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <PremiumSectionHeading
          eyebrow={t('homePremiumHeading.compareToolEyebrow')}
          title={t('homePremiumHeading.compareToolTitle')}
          subtitle={t('homePremiumHeading.compareToolSubtitle')}
          action={
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/listings?type=used_car"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00236f] shadow-sm transition hover:border-[#00236f]/25 hover:bg-slate-50"
              >
                <Car className="h-4 w-4 opacity-80" aria-hidden />
                Browse cars
              </Link>
              <Link
                to="/listings?type=used_bike"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#00236f] shadow-sm transition hover:border-[#00236f]/25 hover:bg-slate-50"
              >
                <Bike className="h-4 w-4 opacity-80" aria-hidden />
                Browse bikes
              </Link>
            </div>
          }
        />

        <div
          id="compare-tool"
          className="rounded-2xl bg-white p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)] ring-1 ring-gray-200/90 scroll-mt-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 lg:gap-4 lg:items-end">
            {/* Vehicle A */}
            <div className="relative">
              <label htmlFor="compare-a" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#233D7B] text-[11px] font-bold text-white">
                  1
                </span>
                First vehicle
              </label>
              <div className="relative">
                <select
                  id="compare-a"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a listing</option>
                  <optgroup label="Used cars">{cars.map((row) => (
                    <option key={`a-${row.id}`} value={row.id}>{optLabel(row)}</option>
                  ))}</optgroup>
                  <optgroup label="Used bikes">{bikes.map((row) => (
                    <option key={`a-${row.id}`} value={row.id}>{optLabel(row)}</option>
                  ))}</optgroup>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center pb-2" aria-hidden>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 ring-1 ring-gray-200">
                VS
              </span>
            </div>

            {/* Vehicle B */}
            <div className="relative">
              <label htmlFor="compare-b" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#233D7B] text-[11px] font-bold text-white">
                  2
                </span>
                Second vehicle
              </label>
              <div className="relative">
                <select
                  id="compare-b"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a listing</option>
                  <optgroup label="Used cars">{cars.map((row) => (
                    <option key={`b-${row.id}`} value={row.id}>{optLabel(row)}</option>
                  ))}</optgroup>
                  <optgroup label="Used bikes">{bikes.map((row) => (
                    <option key={`b-${row.id}`} value={row.id}>{optLabel(row)}</option>
                  ))}</optgroup>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center pb-2" aria-hidden>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-400 ring-1 ring-gray-200">
                VS
              </span>
            </div>

            {/* Vehicle C */}
            <div className="relative">
              <label htmlFor="compare-c" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-[11px] font-bold text-gray-600">
                  3
                </span>
                Third <span className="normal-case font-medium text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <select
                  id="compare-c"
                  value={c}
                  onChange={(e) => setC(e.target.value)}
                  className={`${selectClass} ${!c ? 'text-gray-500' : ''}`}
                >
                  <option value="">Skip — compare two only</option>
                  <optgroup label="Used cars">{cars.map((row) => (
                    <option key={`c-${row.id}`} value={row.id}>{optLabel(row)}</option>
                  ))}</optgroup>
                  <optgroup label="Used bikes">{bikes.map((row) => (
                    <option key={`c-${row.id}`} value={row.id}>{optLabel(row)}</option>
                  ))}</optgroup>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
          </div>

          {selectionConflict ? (
            <p className="mt-4 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              Pick different listings — each slot must be a unique vehicle.
            </p>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {[
                { Icon: Wallet, label: 'Price' },
                { Icon: Gauge, label: 'Mileage & year' },
                { Icon: Fuel, label: 'Fuel & gearbox' },
                { Icon: Car, label: 'Brand & model' },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-100"
                >
                  <Icon className="w-3.5 h-3.5 text-[#233D7B]" aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            <button
              type="button"
              disabled={!canCompare}
              onClick={compare}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#233D7B] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-[#233D7B]/25 transition hover:bg-[#1a2d5a] disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Compare now
              <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Lists show popular listings first. Need something specific?{' '}
          <Link to="/listings?type=used_car" className="font-semibold text-[#233D7B] hover:underline">
            Filter on the listings page
          </Link>{' '}
          then note the vehicle ID, or pick from the dropdowns above.
        </p>
      </div>
    </section>
  );
}
