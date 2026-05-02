import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchBrandNews,
  fetchListings,
  resolveMediaUrl,
  type BrandNewsArticleDto,
  type ListingDto,
} from '@/lib/marketplace';
import { SkeletonBox } from '@/app/components/PremiumSkeleton';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1080&q=80';

function BlogNewsCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <SkeletonBox className="h-56 w-full" rounded="rounded-none" />
      <div className="space-y-3 p-6">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-5 w-[92%]" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-[70%]" />
        <SkeletonBox className="mt-4 h-3 w-28" />
      </div>
    </div>
  );
}

type FeedCard =
  | ({ kind: 'news' } & BrandNewsArticleDto)
  | ({ kind: 'listing' } & ListingDto);

export function BlogNews() {
  const { t } = useTranslation();
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
    <section className="border-y border-slate-100 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <PremiumSectionHeading
          eyebrow={t('homePremiumHeading.blogEyebrow')}
          title={t('homePremiumHeading.blogTitle')}
          subtitle={t('homePremiumHeading.blogSubtitle')}
          action={
            <Link to="/blog" className="shrink-0 text-sm font-bold text-[#ba0035] underline-offset-4 hover:underline">
              View all →
            </Link>
          }
        />

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
