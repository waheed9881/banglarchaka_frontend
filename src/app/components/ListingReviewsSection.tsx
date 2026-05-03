import { Star } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/api';
import {
  fetchListingReviews,
  submitListingReview,
  type ListingReviewDto,
  type ListingReviewsPage,
} from '@/lib/marketplace';

function StarsRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ListingReviewsSection({
  listingPublicId,
  canSubmitReview,
}: {
  listingPublicId: string;
  /** From listing detail API — true only for the verified buyer after the seller marks sold. */
  canSubmitReview: boolean;
}) {
  const [page, setPage] = useState(1);
  const [block, setBlock] = useState<ListingReviewsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signedIn = !!getAuthToken();

  const load = async (p: number) => {
    setLoading(true);
    try {
      const next = await fetchListingReviews(listingPublicId, p);
      setBlock(next);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not load reviews');
      setBlock(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(page);
  }, [listingPublicId, page]);

  const items = block?.items ?? [];
  const avg =
    items.length > 0 ? items.reduce((s, r) => s + r.rating, 0) / items.length : null;

  const onSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!signedIn) return;
    setSubmitting(true);
    setMsg('');
    try {
      await submitListingReview({
        listingPublicId,
        rating,
        title,
        body,
      });
      setTitle('');
      setBody('');
      setRating(5);
      setMsg('Thanks — your review was submitted and may appear after moderation.');
      await load(1);
      setPage(1);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-lg">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <p className="mt-1 text-sm text-gray-600">
            {loading
              ? 'Loading…'
              : block && block.total > 0
                ? `${block.total} approved review${block.total === 1 ? '' : 's'}`
                : 'No published reviews yet.'}
          </p>
        </div>
        {!loading && avg !== null ? (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm">
            <StarsRow rating={Math.round(avg)} />
            <span className="font-semibold text-gray-900">{avg.toFixed(1)}</span>
            <span className="text-gray-600">avg</span>
          </div>
        ) : null}
      </div>

      {msg ? (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {msg}
        </div>
      ) : null}

      <ul className="space-y-4">
        {loading && items.length === 0 ? (
          <li className="text-sm text-gray-500">Loading reviews…</li>
        ) : (
          items.map((r: ListingReviewDto) => (
            <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <StarsRow rating={r.rating} />
                <span className="font-semibold text-gray-900">{r.reviewer?.name || 'Buyer'}</span>
                {r.verified_purchase ? (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    Verified
                  </span>
                ) : null}
              </div>
              {r.title ? <p className="mt-2 font-semibold text-gray-800">{r.title}</p> : null}
              {r.body ? <p className="mt-1 text-sm leading-relaxed text-gray-700">{r.body}</p> : null}
            </li>
          ))
        )}
      </ul>

      {block && block.last_page > 1 ? (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= block.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
        {!canSubmitReview ? (
          <p className="mt-2 text-sm text-gray-600">
            Only the buyer linked by the seller when marking this vehicle sold can submit a review here.
          </p>
        ) : !signedIn ? (
          <p className="mt-2 text-sm text-gray-600">Sign in with the buyer account to submit your review.</p>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={onSubmitReview}>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                maxLength={255}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Comments</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="mt-1 w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-[#233D7B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2d5a] disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
