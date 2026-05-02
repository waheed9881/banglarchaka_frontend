import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { getAuthToken } from '@/lib/api';
import { setPageSeo } from '@/lib/seo';
import {
  fetchListingsPaged,
  formatMoney,
  listingPublicHref,
  listingPaginationPages,
  resolveMediaUrl,
  type ListingDto,
  type ListingsPageMeta,
} from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=640&q=80';

function statusBadge(status: string | null | undefined) {
  const s = status || 'unknown';
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-900',
    pending_review: 'bg-amber-100 text-amber-900',
    sold: 'bg-gray-200 text-gray-800',
    rejected: 'bg-red-100 text-red-900',
    draft: 'bg-slate-100 text-slate-800',
  };
  const cls = map[s] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
}

export function MyListingsPage() {
  const { t } = useTranslation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<ListingDto[]>([]);
  const [meta, setMeta] = useState<ListingsPageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    setPageSeo(t('myListings.seoTitle'), t('myListings.seoDesc'));
    if (!getAuthToken()) {
      setAllowed(false);
      setLoading(false);
      return;
    }
    setAllowed(true);
  }, [t]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    fetchListingsPaged({ mine: 1, per_page: 24, page })
      .then(({ items: rows, meta: m }) => {
        if (!cancelled) {
          setItems(rows);
          setMeta(m);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : t('myListings.loadFailed'));
          setItems([]);
          setMeta(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, page, t]);

  if (allowed === false) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-800">{t('myListings.signInPrompt')}</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-[#233D7B] underline">
            {t('myListings.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myListings.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">{t('myListings.subtitle')}</p>
          </div>
          <Link
            to="/post-ad"
            className="rounded-lg bg-[#C4161C] px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            {t('myListings.postAd')}
          </Link>
        </div>

        {err ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div>
        ) : null}

        {loading ? (
          <p className="text-gray-600">{t('myListings.loading')}</p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-700 shadow-sm">
            {t('myListings.emptyLead')}{' '}
            <Link to="/post-ad" className="font-semibold text-[#233D7B] underline">
              {t('myListings.postFirst')}
            </Link>
            .
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <Link
                    to={listingPublicHref(row)}
                    className="relative h-36 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-28 sm:w-40"
                  >
                    <ImageWithFallback
                      src={resolveMediaUrl(row.media?.[0]?.path) || FALLBACK}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {statusBadge(row.status)}
                      {row.featured ? (
                        <span className="rounded bg-[#C4161C] px-2 py-0.5 text-xs font-bold text-white">{t('myListings.featured')}</span>
                      ) : null}
                    </div>
                    <Link to={listingPublicHref(row)} className="mt-2 block">
                      <span className="text-lg font-bold text-gray-900 hover:text-[#233D7B]">{row.title}</span>
                    </Link>
                    <p className="mt-1 text-sm text-[#3EB549] font-semibold">{formatMoney(row.price, row.currency)}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {row.location_city || '—'} · {row.listing_type?.replace(/_/g, ' ') || t('myListings.listingFallback')}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    {row.can_manage ? (
                      <Link
                        to={`/my-listings/${row.id}/edit`}
                        className="rounded-md border border-[#233D7B] bg-[#233D7B] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#1a2d5a]"
                      >
                        {t('myListings.edit')}
                      </Link>
                    ) : null}
                    <Link
                      to={listingPublicHref(row)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-800 hover:border-[#233D7B]"
                    >
                      {t('myListings.view')}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {meta && meta.last_page > 1 ? (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-1"
                aria-label={t('myListings.pagesAria')}
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('myListings.prev')}
                </button>
                {listingPaginationPages(page, meta.last_page).map((entry, idx) =>
                  entry === 'gap' ? (
                    <span key={`g-${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => setPage(entry)}
                      className={`min-w-[2.25rem] rounded border px-2 py-2 text-sm ${
                        entry === page
                          ? 'border-[#233D7B] bg-[#233D7B] text-white'
                          : 'border-gray-300 bg-white hover:border-[#233D7B]'
                      }`}
                    >
                      {entry}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-40"
                >
                  {t('myListings.next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
