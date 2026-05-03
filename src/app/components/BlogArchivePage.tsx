import { Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchBrandNews,
  fetchListings,
  formatMoney,
  listingCoverMediaPath,
  resolveMediaUrl,
  type BrandNewsArticleDto,
  type BrandNewsMetaDto,
  type ListingDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { InnerPageHero } from './InnerContentPage';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1080&q=80';

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200/80 animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        <div className="h-4 bg-gray-100 rounded-md w-full" />
        <div className="h-4 bg-gray-100 rounded-md w-5/6" />
      </div>
    </div>
  );
}

export function BlogArchivePage() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<BrandNewsArticleDto[]>([]);
  const [fallback, setFallback] = useState<ListingDto[]>([]);
  const [meta, setMeta] = useState<BrandNewsMetaDto | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { items, meta: m } = await fetchBrandNews(page, 12);
      if (cancelled) return;
      if (items.length > 0) {
        setNews(items);
        setFallback([]);
        setMeta(m);
      } else {
        setNews([]);
        const list = await fetchListings({ listing_type: 'used_car', per_page: 12, sort: 'newest' });
        if (!cancelled) {
          setFallback(list);
          setMeta(list.length ? { current_page: 1, last_page: 1, per_page: list.length, total: list.length } : null);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    const title =
      page > 1 ? t('blogArchive.seoTitlePage', { page }) : t('blogArchive.seoTitle');
    setPageSeo(title, t('blogArchive.seoDesc'));
  }, [page, t]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      const locale = i18n.language?.startsWith('bn') ? 'bn-BD' : 'en-GB';
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(iso),
      );
    } catch {
      return '—';
    }
  };

  const heroSubtitle = t('blogArchive.heroSubtitle');

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <InnerPageHero title={t('nav.blog')} subtitle={heroSubtitle} />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {news.map((article) => {
                const image = resolveMediaUrl(article.brand?.logo_path) || FALLBACK_COVER;
                return (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="group rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 overflow-hidden flex flex-col hover:shadow-xl hover:ring-[#233D7B]/25 hover:-translate-y-1 transition-all duration-300"
                  >
                    <article className="flex flex-col flex-1">
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 pointer-events-none" />
                        <span className="absolute top-4 left-4 bg-[#C4161C] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                          {article.brand?.name || t('blogArchive.deskFallback')}
                        </span>
                      </div>
                      <div className="p-6 sm:p-7 flex-1 flex flex-col">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#233D7B] transition-colors leading-snug">
                          {article.title}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base mt-4 flex-1 line-clamp-4 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-5 text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4 text-[#233D7B]" />
                            {formatDate(article.published_at)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <User className="w-4 h-4 text-[#233D7B]" />
                            {article.brand?.name || 'BanglarChaka'} {t('blogArchive.deskSuffix')}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
            {meta && meta.last_page > 1 ? (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#233D7B] hover:text-[#233D7B] disabled:opacity-35 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('blogArchive.previous')}
                </button>
                <span className="text-sm text-gray-600 px-2 font-medium">
                  {t('blogArchive.pageOf', { current: meta.current_page, last: meta.last_page })}
                </span>
                <button
                  type="button"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#233D7B] hover:text-[#233D7B] disabled:opacity-35 disabled:pointer-events-none transition-colors"
                >
                  {t('blogArchive.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </>
        ) : fallback.length > 0 ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950">
              <strong className="font-semibold">{t('blogArchive.fallbackBannerLead')}</strong>{' '}
              {t('blogArchive.fallbackBannerTrail')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fallback.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
                >
                  <Link
                    to={listing.listing_type === 'new_car' ? `/new-cars/${listing.id}` : `/listings/${listing.id}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
                  >
                    <ImageWithFallback
                      src={resolveMediaUrl(listingCoverMediaPath(listing.media)) || FALLBACK_COVER}
                      alt=""
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                    />
                    <span className="absolute top-4 left-4 bg-[#233D7B] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                      {t('blogArchive.marketplaceBadge')}
                    </span>
                  </Link>
                  <div className="p-6 sm:p-7 flex-1 flex flex-col">
                    <Link
                      to={listing.listing_type === 'new_car' ? `/new-cars/${listing.id}` : `/listings/${listing.id}`}
                    >
                      <h2 className="text-xl font-bold text-gray-900 hover:text-[#233D7B] transition-colors leading-snug">
                        {listing.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 text-sm mt-4 flex-1 line-clamp-4 leading-relaxed">
                      {(listing.description || listing.title || '').slice(0, 280)}
                    </p>
                    {listing.price != null ? (
                      <p className="text-[#C4161C] font-bold text-lg mt-4">{formatMoney(listing.price, listing.currency)}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center shadow-sm">
            <p className="text-gray-700 font-medium">{t('blogArchive.emptyMessage')}</p>
            <Link
              to="/post-ad"
              className="inline-flex mt-6 rounded-full bg-[#C4161C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              {t('nav.postAd')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
