import { ArrowLeft, Clock, ExternalLink, FileText, Gavel, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/api';
import { fetchAuctionDetail, placeAuctionBid, type AuctionDetailDto } from '@/lib/auctions';
import { formatMoney, listingPublicHref, resolveMediaUrl } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { ListingMediaGallery } from './ListingMediaGallery';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ApiConnectionHint } from './ApiConnectionHint';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=75';

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Closed';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

/** Inline preview for sheet URLs that resolve as raster images (incl. Unsplash). */
function snapBidAmount(n: number): string {
  if (!Number.isFinite(n)) return '';
  return String(Math.round(n * 100) / 100);
}

function auctionSheetShowsInline(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (u.includes('unsplash.com')) return true;
  return /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(u);
}

function useNowTick(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

export function AuctionDetailPage({ auctionId, onBack }: { auctionId: string | undefined; onBack: () => void }) {
  const { t } = useTranslation();
  const [auction, setAuction] = useState<AuctionDetailDto | null>(null);
  const [err, setErr] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidBusy, setBidBusy] = useState(false);
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  const now = useNowTick(true);

  useEffect(() => {
    if (!auctionId) return;
    let cancelled = false;
    fetchAuctionDetail(auctionId)
      .then((d) => {
        if (!cancelled) {
          setAuction(d);
          setBidAmount(snapBidAmount(Number(d.minimum_next_bid)));
          setPageSeo(`${d.listing?.title ?? 'Auction'} · Live bidding`, 'Place bids on verified dealer auctions.');
        }
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Auction not found');
      });
    return () => {
      cancelled = true;
    };
  }, [auctionId]);

  const listing = auction?.listing;
  const cur = listing?.currency ?? 'BDT';

  const endsMs = useMemo(() => {
    if (!auction?.ends_at) return 0;
    return new Date(auction.ends_at).getTime() - now;
  }, [auction?.ends_at, now]);

  const startsMs = useMemo(() => {
    if (!auction?.starts_at) return 0;
    return new Date(auction.starts_at).getTime() - now;
  }, [auction?.starts_at, now]);

  useEffect(() => {
    if (!auctionId || !auction?.accepting_bids) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      fetchAuctionDetail(auctionId)
        .then((d) => {
          setAuction(d);
          setBidAmount((prev) => {
            const nextMin = Number(d.minimum_next_bid);
            const p = Number(prev);
            if (!Number.isFinite(p) || p < nextMin) {
              return snapBidAmount(nextMin);
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [auctionId, auction?.accepting_bids]);

  const placeBid = async () => {
    if (!auction || !auctionId) return;
    if (!token) {
      const next = `/auctions/${auctionId}`;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    const n = Number(bidAmount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Enter a valid bid amount');
      return;
    }
    setBidBusy(true);
    try {
      await placeAuctionBid(auctionId, n);
      toast.success('Bid placed');
      const fresh = await fetchAuctionDetail(auctionId);
      setAuction(fresh);
      setBidAmount(snapBidAmount(Number(fresh.minimum_next_bid)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bid failed');
    } finally {
      setBidBusy(false);
    }
  };

  if (!auctionId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-600">
        Missing auction id.
      </div>
    );
  }

  if (err || !auction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ApiConnectionHint />
        <button type="button" onClick={onBack} className="text-sm font-semibold text-[#233D7B] hover:underline mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">{err || 'Loading…'}</div>
      </div>
    );
  }

  const sheetUrl = auction.auction_sheet_url?.trim();
  const listingHref = listing ? listingPublicHref(listing) : '/listings';

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-16">
      <ApiConnectionHint />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3 justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#233D7B] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All auctions
          </button>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <span
              className={`rounded-full px-3 py-1 text-white ${
                auction.display_status === 'active'
                  ? 'bg-emerald-600'
                  : auction.display_status === 'scheduled'
                    ? 'bg-amber-500'
                    : auction.display_status === 'ended'
                      ? 'bg-slate-600'
                      : 'bg-zinc-500'
              }`}
            >
              {auction.display_status.replace(/_/g, ' ')}
            </span>
            {auction.accepting_bids ? (
              <span className="rounded-full bg-[#233D7B]/10 text-[#233D7B] px-3 py-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {formatRemaining(endsMs)}
              </span>
            ) : auction.closed_by_reserve ? (
              <span className="rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 ring-1 ring-emerald-200 flex items-center gap-1">
                <Gavel className="h-3.5 w-3.5" aria-hidden />
                {t('listingDetail.auctionHammerDown')}
              </span>
            ) : auction.display_status === 'scheduled' && auction.starts_at ? (
              <span className="rounded-full bg-amber-50 text-amber-900 px-3 py-1 ring-1 ring-amber-100">
                Starts in {formatRemaining(startsMs)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6 min-w-0">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{listing?.title ?? 'Auction'}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              {auction.dealer?.business_name ? (
                <Link className="font-semibold text-[#233D7B] hover:underline" to={`/dealers/${auction.dealer.slug}`}>
                  {auction.dealer.business_name}
                </Link>
              ) : null}
              <Link className="inline-flex items-center gap-1 font-medium text-[#3483D1] hover:underline" to={listingHref}>
                Full listing <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </header>

          <ListingMediaGallery
            media={listing?.media?.map((m) => ({ path: m.path, type: m.type }))}
            title={listing?.title ?? 'Auction'}
            fallbackSrc={FALLBACK_IMAGE}
            topLeftSlot={
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 text-white text-xs font-bold px-2.5 py-1 backdrop-blur-sm">
                <Gavel className="h-3.5 w-3.5" aria-hidden />
                Auction lot
              </span>
            }
          />

          {sheetUrl ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#233D7B]" aria-hidden />
                Auction sheet
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                Inspect graded condition notes and inspector remarks before you bid.
              </p>
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#233D7B] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#1a2d5a] transition-colors"
              >
                Open auction sheet
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
              {auctionSheetShowsInline(sheetUrl) ? (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#233D7B]/40"
                  title="Open full size"
                >
                  <ImageWithFallback
                    src={sheetUrl}
                    alt="Auction inspection sheet preview"
                    className="w-full max-h-[min(70vh,520px)] object-contain object-top bg-white"
                  />
                </a>
              ) : null}
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-5 text-sm text-slate-600">
              The dealer has not attached an auction sheet link for this lot. Request documentation via the listing contact
              options.
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
              Bid activity
            </h2>
            <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {(auction.recent_bids ?? []).length === 0 ? (
                <li className="py-6 text-center text-slate-500 text-sm">No bids yet — opening price stands.</li>
              ) : (
                (auction.recent_bids ?? []).map((b) => (
                  <li key={b.id} className="py-3 flex justify-between gap-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-900">{formatMoney(b.amount, cur)}</span>
                      {b.is_mine ? (
                        <span className="ml-2 text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      ) : null}
                      <div className="text-xs text-slate-500 mt-0.5">{b.bidder_label ?? 'Bidder'}</div>
                    </div>
                    <time className="text-xs text-slate-400 whitespace-nowrap">
                      {b.created_at ? new Date(b.created_at).toLocaleString() : ''}
                    </time>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 self-start">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-br from-[#233D7B] to-[#1a2d5a] text-white px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/75 mb-1">Current high</p>
              <p className="text-3xl font-bold tabular-nums">
                {auction.current_high_amount != null ? formatMoney(auction.current_high_amount, cur) : '—'}
              </p>
              <p className="text-sm text-white/80 mt-2">
                Minimum next bid{' '}
                <span className="font-semibold text-white">{formatMoney(auction.minimum_next_bid, cur)}</span>
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Opening bid</p>
                  <p className="font-semibold text-slate-900">{formatMoney(auction.starting_bid, cur)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Step</p>
                  <p className="font-semibold text-slate-900">{formatMoney(auction.bid_increment, cur)}</p>
                </div>
              </div>

              {auction.can_manage && auction.reserve_price != null ? (
                <p className="text-xs text-amber-900 bg-amber-50 ring-1 ring-amber-100 rounded-lg px-3 py-2">
                  Reserve set at {formatMoney(auction.reserve_price, cur)} — not shown to buyers until the auction ends.
                </p>
              ) : null}

              {auction.display_status === 'ended' && auction.reserve_met !== null && auction.reserve_met !== undefined ? (
                <p className="text-sm font-medium text-slate-700">
                  Reserve:{' '}
                  <span className={auction.reserve_met ? 'text-emerald-700' : 'text-red-700'}>
                    {auction.reserve_met ? t('listingDetail.auctionReserveMet') : t('listingDetail.auctionReserveNotMet')}
                  </span>
                </p>
              ) : null}

              {auction.sale_completed && auction.winning_bid_amount != null ? (
                <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 ring-1 ring-emerald-100 rounded-lg px-3 py-2">
                  {auction.closed_by_reserve
                    ? t('listingDetail.auctionSoldInstantlyAt', { amount: formatMoney(auction.winning_bid_amount, cur) })
                    : t('listingDetail.auctionSoldAt', { amount: formatMoney(auction.winning_bid_amount, cur) })}
                </p>
              ) : null}

              {auction.accepting_bids ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide" htmlFor="bid-amt">
                    Your bid ({cur})
                  </label>
                  <input
                    id="bid-amt"
                    type="number"
                    min={Number(auction.minimum_next_bid)}
                    step="1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#233D7B]/30"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setBidAmount(snapBidAmount(Number(auction.minimum_next_bid)))}
                    >
                      {t('listingDetail.auctionQuickMin')}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() =>
                        setBidAmount(
                          snapBidAmount(Number(auction.minimum_next_bid) + Number(auction.bid_increment)),
                        )
                      }
                    >
                      {t('listingDetail.auctionQuickPlus1')}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() =>
                        setBidAmount(
                          snapBidAmount(Number(auction.minimum_next_bid) + 3 * Number(auction.bid_increment)),
                        )
                      }
                    >
                      {t('listingDetail.auctionQuickPlus3')}
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={bidBusy}
                    onClick={() => void placeBid()}
                    className="w-full rounded-xl bg-[#C4161C] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 text-sm shadow-md transition-colors"
                  >
                    {token ? (bidBusy ? 'Submitting…' : 'Place bid') : 'Sign in to bid'}
                  </button>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    You cannot bid on auctions run by your own dealership. All bids are binding marketplace commitments —
                    contact the dealer after the hammer for paperwork.
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-600 py-2">
                  {auction.display_status === 'scheduled'
                    ? 'This auction has not opened for bidding yet.'
                    : 'This auction is closed for bidding.'}
                </p>
              )}
            </div>
          </div>

          {auction.dealer?.logo_path ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <ImageWithFallback
                src={resolveMediaUrl(auction.dealer.logo_path) ?? ''}
                alt=""
                className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-100"
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-semibold uppercase">Seller</p>
                <p className="font-bold text-slate-900 truncate">{auction.dealer.business_name}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
