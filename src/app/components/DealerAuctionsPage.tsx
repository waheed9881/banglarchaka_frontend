import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  cancelDealerAuction,
  createDealerAuction,
  fetchDealerAuctionsPaged,
  type AuctionSummaryDto,
} from '@/lib/auctions';
import { fetchDealerAccount, type DealerProfileDto } from '@/lib/dealerPortal';
import { formatMoney, listingPaginationPages } from '@/lib/marketplace';
import { dp } from '@/app/components/dealerPortalTheme';
import { setPageSeo } from '@/lib/seo';

function defaultEndsAtLocal(): string {
  const d = new Date(Date.now() + 48 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DURATION_OPTIONS = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '6 hours', minutes: 360 },
  { label: '12 hours', minutes: 720 },
  { label: '24 hours', minutes: 1440 },
  { label: '48 hours', minutes: 2880 },
  { label: '72 hours', minutes: 4320 },
];

export function DealerAuctionsPage() {
  const [profile, setProfile] = useState<DealerProfileDto | null>(null);
  const [auctions, setAuctions] = useState<AuctionSummaryDto[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [listingId, setListingId] = useState('');
  const [startingBid, setStartingBid] = useState('500000');
  const [bidIncrement, setBidIncrement] = useState('25000');
  const [reserve, setReserve] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [startsAtLocal, setStartsAtLocal] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('2880');
  const [endsAtLocal, setEndsAtLocal] = useState(defaultEndsAtLocal);
  const [submitBusy, setSubmitBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        fetchDealerAccount(),
        fetchDealerAuctionsPaged({ page, per_page: 20 }),
      ]);
      setProfile(p);
      setAuctions(a.items);
      setMeta(a.meta ? { current_page: a.meta.current_page, last_page: a.meta.last_page } : null);
      if (!listingId && p?.listings?.length) {
        const first = p.listings.find(
          (l) =>
            (l.listing_type === 'used_car' || l.listing_type === 'new_car') &&
            l.status === 'active' &&
            Boolean(l.approved_at),
        );
        if (first) setListingId(first.id);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageSeo('Dealer auctions · BanglarChaka', 'Publish graded auction lots with sheets and accept compliant bids.');
  }, []);

  useEffect(() => {
    void load();
  }, [page]);

  const eligibleListings = useMemo(() => {
    return (
      profile?.listings?.filter(
        (l) =>
          (l.listing_type === 'used_car' || l.listing_type === 'new_car') &&
          l.status === 'active' &&
          Boolean(l.approved_at),
      ) ?? []
    );
  }, [profile?.listings]);

  const publish = async () => {
    if (!listingId) {
      toast.error('Choose a showroom listing');
      return;
    }
    setSubmitBusy(true);
    try {
      const selectedDuration = Number(durationMinutes);
      const useDuration = Number.isFinite(selectedDuration) && selectedDuration >= 15;
      if (!useDuration && !endsAtLocal) {
        toast.error('Choose an end time or timer duration');
        return;
      }
      const endsIso = useDuration ? undefined : new Date(endsAtLocal).toISOString();
      const startsIso = startsAtLocal.trim() ? new Date(startsAtLocal).toISOString() : undefined;
      await createDealerAuction({
        listing_public_id: listingId,
        starting_bid: Number(startingBid),
        bid_increment: bidIncrement.trim() ? Number(bidIncrement) : undefined,
        reserve_price: reserve.trim() ? Number(reserve) : null,
        auction_sheet_url: sheetUrl.trim() || null,
        starts_at: startsIso,
        duration_minutes: useDuration ? selectedDuration : undefined,
        ends_at: endsIso,
      });
      toast.success('Auction is live');
      setStartsAtLocal('');
      setEndsAtLocal(defaultEndsAtLocal());
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not publish auction');
    } finally {
      setSubmitBusy(false);
    }
  };

  const cancel = async (id: string) => {
    if (!window.confirm('Cancel this auction? Bidders will be notified by the platform messaging tools.')) return;
    try {
      await cancelDealerAuction(id);
      toast.success('Auction cancelled');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cancel failed');
    }
  };

  const lastPage = meta?.last_page ?? 1;
  const pages = listingPaginationPages(page, lastPage);

  return (
    <div className={dp.inner}>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#233D7B]/80 mb-2">Inventory acceleration</p>
        <h1 className={dp.heroTitle}>Auction desk</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Run transparent auctions only on vehicles already approved on your showroom. Buyers place ascending bids; reserve
          stays hidden until close.
        </p>
      </div>

      {msg ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">{msg}</div>
      ) : null}

      <section className={`${dp.card} ${dp.cardPad} mb-10`}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Publish auction</h2>
        {eligibleListings.length === 0 ? (
          <p className="text-sm text-slate-600">
            You need at least one <strong>active, approved</strong> passenger listing tied to your dealer showroom.{' '}
            <Link className="font-semibold text-[#233D7B] underline" to="/post-ad">
              Post inventory
            </Link>{' '}
            or approve pending ads first.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col">
              Vehicle listing
              <select
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900 bg-white"
              >
                {eligibleListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col">
              Starting bid
              <input
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col">
              Bid increment (optional)
              <input
                value={bidIncrement}
                onChange={(e) => setBidIncrement(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col">
              Reserve (optional, hidden from buyers)
              <input
                value={reserve}
                onChange={(e) => setReserve(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col lg:col-span-2">
              Auction sheet URL (PDF / cloud link)
              <input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://…"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col">
              Optional start time (local)
              <input
                type="datetime-local"
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700 gap-2 flex flex-col">
              End time (local)
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white"
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.minutes} value={option.minutes}>
                    {option.label}
                  </option>
                ))}
                <option value="">Custom end date/time</option>
              </select>
              {durationMinutes === '' ? (
                <input
                  type="datetime-local"
                  value={endsAtLocal}
                  onChange={(e) => setEndsAtLocal(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              ) : (
                <p className="text-xs text-slate-500">
                  Timer starts {startsAtLocal ? 'from selected start time' : 'immediately'}.
                </p>
              )}
            </label>
            <div className="lg:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={submitBusy}
                onClick={() => void publish()}
                className={`${dp.btnPrimary} px-6`}
              >
                {submitBusy ? 'Publishing…' : 'Publish auction'}
              </button>
              <Link to="/auctions" className={`${dp.btnSecondary} px-6`}>
                Preview public auctions
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className={`${dp.card} ${dp.cardPad}`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your auctions</h2>
          {loading ? <span className="text-sm text-slate-500">Refreshing…</span> : null}
        </div>

        {auctions.length === 0 ? (
          <p className="text-sm text-slate-600">No auctions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-3 pr-4">Vehicle</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">High bid</th>
                  <th className="py-3 pr-4">Bids</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auctions.map((a) => {
                  const title = a.listing?.title ?? '—';
                  const cur = a.listing?.currency ?? 'BDT';
                  const live = a.display_status === 'active' || a.display_status === 'scheduled';
                  return (
                    <tr key={a.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900 max-w-[220px] truncate">{title}</td>
                      <td className="py-3 pr-4 capitalize">{a.display_status}</td>
                      <td className="py-3 pr-4 tabular-nums">
                        {a.current_high_amount != null ? formatMoney(a.current_high_amount, cur) : '—'}
                      </td>
                      <td className="py-3 pr-4">{a.bid_count}</td>
                      <td className="py-3 pl-4 text-right whitespace-nowrap">
                        <Link className="font-semibold text-[#233D7B] hover:underline mr-3" to={`/auctions/${a.id}`}>
                          View
                        </Link>
                        {live ? (
                          <button type="button" className="text-red-700 font-semibold hover:underline" onClick={() => void cancel(a.id)}>
                            Cancel
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {lastPage > 1 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
                    p === page ? 'bg-[#233D7B] text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
