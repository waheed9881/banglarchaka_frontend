import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import {
  fetchBrandNews,
  fetchListings,
  resolveMediaUrl,
  type BrandNewsArticleDto,
  type ListingDto,
} from '@/lib/marketplace';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1080&q=80';

function BlogNewsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-md w-[92%]" />
        <div className="h-4 bg-gray-200 rounded-md w-full" />
        <div className="h-4 bg-gray-200 rounded-md w-[70%]" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-20 bg-gray-200 rounded-md" />
          <div className="h-3 w-24 bg-gray-200 rounded-md" />
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
          <div className="h-3 w-16 bg-gray-200 rounded-md" />
          <div className="h-3 w-14 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

type FeedCard =
  | ({ kind: 'news' } & BrandNewsArticleDto)
  | ({ kind: 'listing' } & ListingDto);

export function BlogNews() {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await fetchBrandNews(1, 6);
        if (cancelled) return;
        if (items.length > 0) {
          setCards(items.map((row) => ({ kind: 'news', ...row })));
          return;
        }
        const listings = await fetchListings({ listing_type: 'used_car', per_page: 6, sort: 'newest' });
        if (cancelled) return;
        setCards(listings.map((row) => ({ kind: 'listing', ...row })));
      } catch {
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(iso),
      );
    } catch {
      return '';
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest News & Reviews</h2>
            <p className="text-gray-600 mt-2">Editorial notes from brands plus fresh marketplace highlights</p>
          </div>
          <Link to="/blog" className="text-[#233D7B] hover:underline font-semibold">
            View all →
          </Link>
        </div>

        {loading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            role="status"
            aria-busy="true"
            aria-label="Loading news"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <BlogNewsCardSkeleton key={i} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <p className="text-gray-600 text-center py-12">Connect the API and seed data to load stories.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.slice(0, 6).map((article) => {
              const key = article.kind === 'news' ? `news-${article.id}` : `listing-${article.id}`;
              const title = article.title;
              const excerpt =
                article.kind === 'news'
                  ? article.excerpt || ''
                  : (article.description || article.title || '').slice(0, 160);
              const category =
                article.kind === 'news' ? article.brand?.name || 'News' : article.listing_type.replace('_', ' ');
              const date = article.kind === 'news' ? formatDate(article.published_at) : '';
              const author =
                article.kind === 'news'
                  ? `${article.brand?.name || 'BanglarChaka'} desk`
                  : article.seller?.name || 'Seller';
              const image =
                article.kind === 'listing'
                  ? resolveMediaUrl(article.media?.[0]?.path) || FALLBACK_COVER
                  : resolveMediaUrl(article.brand?.logo_path) || FALLBACK_COVER;
              const readHref =
                article.kind === 'news'
                  ? '/blog'
                  : article.listing_type === 'new_car'
                    ? `/new-cars/${article.id}`
                    : `/listings/${article.id}`;

              return (
                <div
                  key={key}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden border border-gray-100"
                >
                  <Link to={readHref} className="block relative">
                    <ImageWithFallback src={image} alt="" className="w-full h-48 object-cover" />
                    <div className="absolute top-3 left-3 bg-[#C4161C] text-white px-3 py-1 rounded text-xs font-semibold capitalize">
                      {category}
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link to={readHref}>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-[#233D7B] transition">{title}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{excerpt}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                      {date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {author}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {article.kind === 'listing' ? 'Live listing' : 'Editorial'}
                      </span>
                      <Link to={readHref} className="text-[#233D7B] font-semibold text-sm hover:underline">
                        Open →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/blog"
            className="bg-white rounded-lg p-5 shadow text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">📰</div>
            <div className="font-bold text-gray-900">News desk</div>
            <div className="text-xs text-gray-500 mt-1">Brand updates</div>
          </Link>
          <Link
            to="/car-reviews"
            className="bg-white rounded-lg p-5 shadow text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="font-bold text-gray-900">Reviews</div>
            <div className="text-xs text-gray-500 mt-1">Buyer guides</div>
          </Link>
          <Link
            to="/videos"
            className="bg-white rounded-lg p-5 shadow text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">🎥</div>
            <div className="font-bold text-gray-900">Videos</div>
            <div className="text-xs text-gray-500 mt-1">Walkthroughs</div>
          </Link>
          <Link
            to="/forums"
            className="bg-white rounded-lg p-5 shadow text-center hover:shadow-md transition border border-gray-100"
          >
            <div className="text-3xl mb-2">💬</div>
            <div className="font-bold text-gray-900">Community</div>
            <div className="text-xs text-gray-500 mt-1">Discussions</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
