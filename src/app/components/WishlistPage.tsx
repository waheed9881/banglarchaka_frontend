import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { fetchMe } from '@/lib/auth';
import { fetchWishlistListings, removeFromWishlist } from '@/lib/engagement';
import { formatMoney, resolveMediaUrl, type ListingDto } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=640&q=80';

export function WishlistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchWishlistListings();
      setRows(data);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t('wishlist.loadFailed'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageSeo(t('wishlist.seoTitle'), t('wishlist.seoDesc'));
  }, [t]);

  useEffect(() => {
    fetchMe().then((u) => setAllowed(!!u));
  }, []);

  useEffect(() => {
    if (allowed) load().catch(() => undefined);
    else if (allowed === false) setLoading(false);
  }, [allowed]);

  if (allowed === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <p className="text-gray-700 mb-4">{t('wishlist.signInPrompt')}</p>
          <Link to="/" className="text-[#233D7B] font-semibold underline">
            {t('wishlist.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-[#C4161C]" />
            {t('wishlist.title')}
          </h1>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900">
            {t('wishlist.back')}
          </button>
        </div>
        {msg && <div className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-4 py-2">{msg}</div>}
        {loading ? (
          <div className="text-gray-600">{t('wishlist.loading')}</div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">{t('wishlist.empty')}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                <div className="relative">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removeFromWishlist(car.id);
                        setRows((list) => list.filter((r) => r.id !== car.id));
                      } catch (e) {
                        setMsg(e instanceof Error ? e.message : t('wishlist.removeFailed'));
                      }
                    }}
                    className="absolute top-3 right-3 z-10 bg-white/95 p-2 rounded-full shadow hover:bg-white"
                    aria-label={t('wishlist.removeAria')}
                  >
                    <Heart className="w-5 h-5 text-[#C4161C] fill-current" />
                  </button>
                  <button type="button" onClick={() => navigate(`/listings/${car.id}`)} className="block w-full">
                    <ImageWithFallback
                      src={resolveMediaUrl(car.media?.[0]?.path) || FALLBACK}
                      alt={car.title}
                      className="w-full h-44 object-cover"
                    />
                  </button>
                </div>
                <div className="p-4">
                  <button type="button" onClick={() => navigate(`/listings/${car.id}`)} className="text-left w-full">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{car.title}</h3>
                    <div className="text-[#3EB549] font-bold mt-2">{formatMoney(car.price, car.currency)}</div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
