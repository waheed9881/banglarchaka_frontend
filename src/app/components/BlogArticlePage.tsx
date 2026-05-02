import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { fetchBrandNewsArticle, resolveMediaUrl, type BrandNewsArticleDetailDto } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1080&q=80';

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BrandNewsArticleDetailDto | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchBrandNewsArticle(slug).then((row) => {
      if (!cancelled) {
        setArticle(row);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (loading) return;
    if (!article) {
      setPageSeo('Article not found · BanglarChaka', 'This news desk article could not be loaded.');
      return;
    }
    const plain =
      typeof article.body === 'string'
        ? article.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : '';
    const desc = (article.excerpt?.trim() || plain || article.title).slice(0, 160);
    setPageSeo(`${article.title} · Blog · BanglarChaka`, desc);
  }, [loading, article]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(iso),
      );
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl text-gray-600">Loading…</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-gray-800">Article not found.</p>
          <Link to="/blog" className="mt-4 inline-block font-semibold text-[#233D7B] underline">
            Back to news desk
          </Link>
        </div>
      </div>
    );
  }

  const cover = resolveMediaUrl(article.brand?.logo_path) || FALLBACK_COVER;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-8 px-4">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#233D7B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow">
          <div className="relative h-52 md:h-64">
            <ImageWithFallback src={cover} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 rounded bg-[#C4161C] px-3 py-1 text-xs font-semibold text-white">
              {article.brand?.name || 'News desk'}
            </span>
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{article.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.published_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.brand?.name || 'BanglarChaka'}
              </span>
            </div>
            {article.excerpt ? (
              <p className="mt-6 border-l-4 border-[#233D7B] pl-4 text-lg text-gray-700">{article.excerpt}</p>
            ) : null}
            <div className="prose prose-neutral mt-8 max-w-none">
              {article.body ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{article.body}</div>
              ) : (
                <p className="text-gray-600">No article body stored for this item.</p>
              )}
            </div>
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link to="/blog" className="font-semibold text-[#233D7B] underline">
            More articles
          </Link>
        </div>
      </div>
    </div>
  );
}
