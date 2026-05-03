import { useEffect, useMemo, useState } from 'react';
import {
  approveListing,
  approveReview,
  assignQueueItem,
  disableListing,
  enableListing,
  fetchAdminDashboardStats,
  fetchAdminListings,
  fetchAdminReports,
  fetchModerationQueue,
  fetchPendingReviews,
  rejectListing,
  rejectReview,
  updateAdminReportStatus,
  type AdminDashboardStatsDto,
  type AdminReportDto,
  type ModerationQueueDto,
  type PendingReviewDto,
} from '@/lib/admin';
import { fetchDealers, formatMoney, type DealerDto, type ListingDto } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { Link, useOutletContext } from 'react-router';
import type { AdminOutletContext } from '@/app/components/AdminLayout';

export function AdminModerationPage() {
  const { canModerate } = useOutletContext<AdminOutletContext>();
  const [tab, setTab] = useState<'dashboard' | 'listings' | 'reviews' | 'queue' | 'reports' | 'dealers'>('dashboard');
  const [rows, setRows] = useState<ListingDto[]>([]);
  const [reviewRows, setReviewRows] = useState<PendingReviewDto[]>([]);
  const [queueRows, setQueueRows] = useState<ModerationQueueDto[]>([]);
  const [reportRows, setReportRows] = useState<AdminReportDto[]>([]);
  const [dealerRows, setDealerRows] = useState<DealerDto[]>([]);
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [queueStatusFilter, setQueueStatusFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const [dash, reports] = await Promise.all([
          fetchAdminDashboardStats(),
          fetchAdminReports({ page: 1, per_page: 5 }),
        ]);
        setStats(dash);
        setReportRows(reports.rows);
        setTotal(reports.total);
        setLastPage(1);
      } else if (tab === 'listings') {
        const data = await fetchAdminListings({
          page,
          per_page: 20,
          status: listingStatusFilter,
        });
        setRows(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'reviews') {
        const data = await fetchPendingReviews({ page, per_page: 20 });
        setReviewRows(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'queue') {
        const data = await fetchModerationQueue({
          page,
          per_page: 20,
          status: queueStatusFilter === 'all' ? 'all' : queueStatusFilter || undefined,
        });
        setQueueRows(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else if (tab === 'reports') {
        const data = await fetchAdminReports({ page, per_page: 20, status: reportStatusFilter || undefined });
        setReportRows(data.rows);
        setLastPage(data.lastPage);
        setTotal(data.total);
      } else {
        const dealers = await fetchDealers();
        setDealerRows(dealers);
        setTotal(dealers.length);
        setLastPage(1);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load admin data');
      setRows([]);
      setReviewRows([]);
      setQueueRows([]);
      setReportRows([]);
      setDealerRows([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageSeo('Admin moderation · BanglarChaka', 'Pending listings, reviews, queue, reports, and dealers.');
  }, []);

  useEffect(() => {
    if (!canModerate) return;
    load().catch(() => undefined);
  }, [canModerate, tab, page, listingStatusFilter, queueStatusFilter, reportStatusFilter]);

  const onApprove = async (id: string) => {
    try {
      await approveListing(id);
      setMessage('Listing approved');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Approve failed');
    }
  };

  const onReject = async (id: string) => {
    const reason = window.prompt('Rejection reason');
    if (!reason) return;
    try {
      await rejectListing(id, reason);
      setMessage('Listing rejected');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Reject failed');
    }
  };

  const onDisableListing = async (id: string) => {
    try {
      await disableListing(id);
      setMessage('Listing disabled (site par ab nahi dikhegi)');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Disable failed');
    }
  };

  const onEnableListing = async (id: string) => {
    try {
      await enableListing(id);
      setMessage('Listing dubara enable ho gayi');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Enable failed');
    }
  };

  const onApproveReview = async (id: number) => {
    try {
      await approveReview(id);
      setMessage('Review approved');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Review approve failed');
    }
  };

  const onRejectReview = async (id: number) => {
    const note = window.prompt('Rejection note');
    if (!note) return;
    try {
      await rejectReview(id, note);
      setMessage('Review rejected');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Review reject failed');
    }
  };

  const onAssignQueue = async (id: number) => {
    const input = window.prompt('Assign to user id (empty to unassign)');
    if (input === null) return;
    const parsed = input.trim() ? Number(input.trim()) : null;
    if (parsed !== null && Number.isNaN(parsed)) {
      setMessage('Invalid user id');
      return;
    }
    try {
      await assignQueueItem(id, parsed);
      setMessage('Queue item assignment updated');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Assign failed');
    }
  };

  const onUpdateReportStatus = async (id: number, status: string) => {
    try {
      await updateAdminReportStatus(id, status);
      setMessage('Report status updated');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Report update failed');
    }
  };

  const filteredListings = useMemo(
    () =>
      rows.filter((row) => {
        const matchesSearch = !search || row.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || row.listing_type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [rows, search, typeFilter],
  );

  const filteredReviews = useMemo(
    () =>
      reviewRows.filter((row) => {
        const text = `${row.title || ''} ${row.body || ''} ${row.reviewer?.name || ''}`.toLowerCase();
        return !search || text.includes(search.toLowerCase());
      }),
    [reviewRows, search],
  );

  const filteredQueue = useMemo(
    () =>
      queueRows.filter((row) => {
        const matchesSearch = !search || String(row.queueable_id).includes(search);
        return matchesSearch;
      }),
    [queueRows, search],
  );

  const filteredReports = useMemo(
    () =>
      reportRows.filter((row) => {
        const text = `${row.reason} ${row.reporter?.name || ''} ${row.reportable_type}`.toLowerCase();
        return !search || text.includes(search.toLowerCase());
      }),
    [reportRows, search],
  );

  const filteredDealers = useMemo(
    () =>
      dealerRows.filter((d) => {
        const text = `${d.business_name} ${d.slug}`.toLowerCase();
        return !search || text.includes(search.toLowerCase());
      }),
    [dealerRows, search],
  );

  if (!canModerate) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center space-y-4">
          <h1 className="text-lg font-bold text-gray-900">Moderation access</h1>
          <p className="text-gray-600 text-sm">
            Yahan sirf <strong>super_admin</strong>, <strong>admin</strong> ya <strong>moderator</strong> aa sakte hain.
            HR ya Finance ke liye sidebar se woh sections kholein.
          </p>
          <Link
            to="/admin"
            className="inline-flex rounded-lg bg-[#233D7B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2d5a]"
          >
            Admin home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
          <button
            onClick={() => load().catch(() => undefined)}
            className="px-4 py-2 rounded bg-[#233D7B] text-white hover:bg-[#1a2d5a]"
          >
            Refresh
          </button>
        </div>
        <div className="bg-white rounded shadow p-4 mb-4 flex flex-wrap gap-2">
          {[
            ['dashboard', 'Dashboard'],
            ['listings', 'Listings'],
            ['reviews', 'Reviews'],
            ['queue', 'Queue'],
            ['reports', 'Reports'],
            ['dealers', 'Dealers'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key as typeof tab); setPage(1); }}
              className={`px-3 py-2 rounded ${tab === key ? 'bg-[#233D7B] text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded shadow p-4 mb-4 flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 border rounded flex-1"
          />
          {tab === 'queue' && (
            <select
              value={queueStatusFilter}
              onChange={(e) => setQueueStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">Pending (default)</option>
              <option value="all">All statuses</option>
              <option value="pending">pending</option>
              <option value="resolved">resolved</option>
              <option value="rejected">rejected</option>
            </select>
          )}
          {tab === 'reports' && (
            <select
              value={reportStatusFilter}
              onChange={(e) => setReportStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="in_review">in_review</option>
              <option value="resolved">resolved</option>
              <option value="rejected">rejected</option>
            </select>
          )}
          {tab === 'listings' && (
            <>
              <select
                value={listingStatusFilter}
                onChange={(e) => {
                  setListingStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All statuses</option>
                <option value="pending_review">Pending approval</option>
                <option value="active">Live (active)</option>
                <option value="disabled">Disabled by admin</option>
                <option value="rejected">Rejected</option>
                <option value="sold">Sold</option>
                <option value="draft">Draft</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded">
                <option value="">All listing types</option>
                <option value="used_car">used_car</option>
                <option value="new_car">new_car</option>
                <option value="used_bike">used_bike</option>
                <option value="auto_part">auto_part</option>
              </select>
            </>
          )}
        </div>
        {message && (
          <div className="mb-4 rounded border border-[#233D7B]/15 bg-slate-50 px-4 py-2 text-sm text-slate-900">
            {message}
          </div>
        )}
        {loading ? (
          <div className="bg-white p-6 rounded shadow">Loading admin data...</div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats || {}).map(([k, v]) => (
                  <div key={k} className="bg-white rounded shadow p-4">
                    <div className="text-xs text-gray-500">{k}</div>
                    <div className="text-2xl font-bold">{v}</div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'listings' && (
              <div className="space-y-4">
                {filteredListings.map((row) => (
                  <div key={row.id} className="bg-white rounded shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{row.title}</h3>
                        <p className="text-sm text-gray-600">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 mr-2">
                            {row.status || 'unknown'}
                          </span>
                          {row.approved_at ? 'approved · ' : ''}
                          {row.listing_type} • {row.location_city || 'N/A'} • {formatMoney(row.price, row.currency)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.status === 'pending_review' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove(row.id)}
                              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(row.id)}
                              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {row.status !== 'disabled' && (
                          <button
                            type="button"
                            onClick={() => onDisableListing(row.id)}
                            className="px-4 py-2 rounded border border-amber-600 text-amber-800 hover:bg-amber-50"
                          >
                            Disable
                          </button>
                        )}
                        {row.status === 'disabled' && (
                          <button
                            type="button"
                            onClick={() => onEnableListing(row.id)}
                            className="px-4 py-2 rounded bg-[#233D7B] text-white hover:bg-[#1a2d5a]"
                          >
                            Enable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="space-y-4">
                {filteredReviews.map((row) => (
                  <div key={row.id} className="bg-white rounded shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{row.title || 'Untitled review'}</h3>
                        <p className="text-sm text-gray-600">Rating: {row.rating}/5 • Reviewer: {row.reviewer?.name || 'Unknown'}</p>
                        {row.body && <p className="text-sm text-gray-700 mt-2">{row.body}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onApproveReview(row.id)} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
                        <button onClick={() => onRejectReview(row.id)} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'queue' && (
              <div className="space-y-4">
                {filteredQueue.map((row) => (
                  <div key={row.id} className="bg-white rounded shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{row.queue_type} #{row.id}</h3>
                        <p className="text-sm text-gray-600">queueable: {row.queueable_type} ({row.queueable_id}) • status: {row.status}</p>
                      </div>
                      <button onClick={() => onAssignQueue(row.id)} className="px-4 py-2 rounded bg-[#233D7B] text-white hover:bg-[#1a2d5a]">Assign</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'reports' && (
              <div className="space-y-4">
                {filteredReports.map((row) => (
                  <div key={row.id} className="bg-white rounded shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{row.reason}</h3>
                        <p className="text-sm text-gray-600">Type: {row.reportable_type} #{row.reportable_id} • Reporter: {row.reporter?.name || 'N/A'} • Status: {row.status}</p>
                        {row.details && <p className="text-sm text-gray-700 mt-2">{row.details}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onUpdateReportStatus(row.id, 'in_review')} className="px-3 py-2 rounded border">In Review</button>
                        <button onClick={() => onUpdateReportStatus(row.id, 'resolved')} className="px-3 py-2 rounded bg-green-600 text-white">Resolve</button>
                        <button onClick={() => onUpdateReportStatus(row.id, 'rejected')} className="px-3 py-2 rounded bg-red-600 text-white">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'dealers' && (
              <div className="space-y-4">
                {filteredDealers.map((row) => (
                  <div key={row.id} className="bg-white rounded shadow p-5">
                    <h3 className="font-semibold text-lg text-gray-900">{row.business_name}</h3>
                    <p className="text-sm text-gray-600">slug: {row.slug} • listings: {row.listings_count || 0} • verified: {row.verified_at ? 'yes' : 'no'}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {tab !== 'dashboard' && tab !== 'dealers' && (
          <div className="mt-4 bg-white rounded shadow p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Total: {total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <span className="text-sm text-gray-700">Page {page} / {lastPage}</span>
              <button disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
