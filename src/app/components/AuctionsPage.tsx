import { Gavel, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { fetchAuctionsPaged, type AuctionSummaryDto } from '@/lib/auctions';
import { formatMoney, listingPaginationPages, resolveMediaUrl, type ListingsPageMeta } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=960&q=75';

function statusBadge(displayStatus: string): { label: string; className: string } {
  switch (displayStatus) {
    case 'active':
      return { label: 'Live', className: 'bg-emerald-500/95 text-white' };
    case 'scheduled':
      return { label: 'Starting soon', className: 'bg-amber-500 text-white' };
    case 'ended':
      return { label: 'Ended', className: 'bg-slate-600 text-white' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-zinc-500 text-white' };
    default:
      return { label: displayStatus, className: 'bg-slate-500 text-white' };
  }
}

export function AuctionsPage() {
  const { t } = useTranslation();
  const [sort, setSort] = useState<'ending_soon' | 'newest' | 'most_bids'>('ending_soon');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AuctionSummaryDto[]>([]);
  const [meta, setMeta] = useState<ListingsPageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    setPageSeo(
      'Live vehicle auctions · BanglarChaka',
      'Dealer-run auctions with auction sheets. Bid on verified showroom inventory in real time.',
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAuctionsPaged({ sort, page, per_page: 18 })
      .then(({ items: rows, meta: m }) => {
        if (!cancelled) {
          setItems(rows);
          setMeta(m);
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load auctions');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sort, page]);

  const lastPage = meta?.last_page ?? 1;
  const pages = listingPaginationPages(page, lastPage);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-[#233D7B] via-[#2d4a8f] to-[#1a2d5a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="min-w-0 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 flex items-center gap-2">
                <Gavel className="h-4 w-4 opacity-90" aria-hidden />
                Dealer auctions
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Bid on showroom cars</h1>
              <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
                Only verified dealers can list auction inventory. Review the auction sheet, watch the timer, and place
                compliant bids — engineered for clarity and fair play.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">{err}</div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm font-semibold text-slate-700">Sort</span>
          {(
            [
              ['ending_soon', 'Ending soon'],
              ['newest', 'Newest'],
              ['most_bids', 'Most bids'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setPage(1);
                setSort(key);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                sort === key ? 'bg-[#233D7B] text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-600">
            No live auctions right now. Check back soon or browse{' '}
            <Link className="font-semibold text-[#233D7B] underline-offset-2 hover:underline" to="/listings?type=used_car">
              used cars
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((a) => {
                const listing = a.listing;
                const cur = listing?.currency ?? 'BDT';
                const thumb = resolveMediaUrl(listing?.media?.[0]?.path) ?? FALLBACK_IMAGE;
                const badge = statusBadge(a.display_status);

                return (
                  <Link
                    key={a.id}
                    to={`/auctions/${a.id}`}
                    className="group rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <div className="relative h-48 bg-slate-100">
                      <ImageWithFallback src={thumb} alt="" className="h-full w-full object-cover" />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      {a.accepting_bids ? (
                        <span className="absolute right-3 top-3 rounded-full bg-black/55 text-white px-2 py-1 text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                          <Clock className="h-3 w-3" aria-hidden />
                          {t('listingDetail.auctionOpen')}
                        </span>
                      ) : a.closed_by_reserve ? (
                        <span className="absolute right-3 top-3 rounded-full bg-emerald-600/95 text-white px-2 py-1 text-[11px] font-semibold flex items-center gap-1 shadow">
                          <Gavel className="h-3 w-3" aria-hidden />
                          {t('listingDetail.auctionHammerDown')}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h2 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-[#233D7B] transition-colors">
                        {listing?.title ?? 'Auction'}
                      </h2>
                      <div className="text-sm text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          Current:{' '}
                          <strong className="text-slate-900">
                            {a.current_high_amount != null
                              ? formatMoney(a.current_high_amount, cur)
                              : formatMoney(a.starting_bid, cur)}
                          </strong>
                        </span>
                        <span>
                          Min next: <strong className="text-slate-900">{formatMoney(a.minimum_next_bid, cur)}</strong>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-auto pt-2 flex justify-between gap-2">
                        <span>{a.bid_count} bids</span>
                        {a.dealer?.business_name ? (
                          <span className="truncate text-right">{a.dealer.business_name}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {lastPage > 1 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Prev
                </button>
                {pages.map((p, idx) =>
                  p === 'gap' ? (
                    <span key={`g-${idx}`} className="px-2 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-semibold ${
                        p === page ? 'bg-[#233D7B] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
