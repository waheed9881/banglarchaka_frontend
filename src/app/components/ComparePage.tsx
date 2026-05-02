import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { fetchListingById, formatMoney, resolveMediaUrl, type ListingDto } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';

const FALLBACK =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=640&q=80';

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="border border-gray-200 px-3 py-3 text-sm text-gray-800 align-top">{children}</td>;
}

export function ComparePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryKey = params.toString();
  const ids = [params.get('a'), params.get('b'), params.get('c')].filter(Boolean) as string[];

  const [rows, setRows] = useState<(ListingDto | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const idList = [params.get('a'), params.get('b'), params.get('c')].filter(Boolean) as string[];
    (async () => {
      setLoading(true);
      const resolved = await Promise.all(idList.map((id) => fetchListingById(id)));
      if (!cancelled) {
        setRows(resolved);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  useEffect(() => {
    if (loading) return;
    const valid = rows.filter(Boolean) as ListingDto[];
    if (!valid.length) {
      setPageSeo(t('compare.seoEmpty'), t('compare.seoEmptyDesc'));
      return;
    }
    const joined = valid.map((r) => r.title).join(' vs ');
    const shortJoin = `${joined.slice(0, 72)}${joined.length > 72 ? '…' : ''}`;
    const descKey = valid.length === 1 ? 'compare.seoDesc' : 'compare.seoDescPlural';
    setPageSeo(t('compare.seoTitle', { titles: shortJoin }), t(descKey, { count: valid.length, titles: joined }).slice(0, 160));
  }, [loading, queryKey, rows, t]);

  const valid = rows.filter(Boolean) as ListingDto[];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#233D7B] font-semibold mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('compare.back')}
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('compare.title')}</h1>
        <p className="text-gray-600 mb-8">{t('compare.subtitle')}</p>

        {ids.length < 2 ? (
          <p className="text-gray-700">
            {t('compare.pickTwo')}{' '}
            <Link to="/" className="text-[#233D7B] font-semibold underline">
              {t('compare.goHome')}
            </Link>
            .
          </p>
        ) : loading ? (
          <p className="text-gray-600">{t('compare.loading')}</p>
        ) : valid.length === 0 ? (
          <p className="text-gray-700">{t('compare.loadFailed')}</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide w-40">
                    {t('compare.attrHeader')}
                  </th>
                  {valid.map((listing) => (
                    <th
                      key={listing.id}
                      className="border border-gray-200 bg-gray-50 px-3 py-3 text-left text-sm font-semibold text-gray-900 w-1/3"
                    >
                      <div className="space-y-2">
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={resolveMediaUrl(listing.media?.[0]?.path) || FALLBACK}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="line-clamp-3">{listing.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Cell>{t('compare.price')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`p-${listing.id}`}>{formatMoney(listing.price, listing.currency)}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.type')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`t-${listing.id}`}>{listing.listing_type.replace('_', ' ')}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.brand')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`br-${listing.id}`}>{listing.brand?.name || '—'}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.year')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`y-${listing.id}`}>{listing.vehicle_year ?? '—'}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.mileage')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`m-${listing.id}`}>
                      {listing.mileage_km != null ? t('compare.mileageKm', { n: listing.mileage_km.toLocaleString() }) : '—'}
                    </Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.fuel')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`f-${listing.id}`}>{listing.fuel_type || '—'}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.transmission')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`tr-${listing.id}`}>{listing.transmission || '—'}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.condition')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`c-${listing.id}`}>{listing.condition || '—'}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.city')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`l-${listing.id}`}>{listing.location_city || '—'}</Cell>
                  ))}
                </tr>
                <tr>
                  <Cell>{t('compare.open')}</Cell>
                  {valid.map((listing) => (
                    <Cell key={`o-${listing.id}`}>
                      <Link
                        to={listing.listing_type === 'new_car' ? `/new-cars/${listing.id}` : `/listings/${listing.id}`}
                        className="text-[#233D7B] font-semibold underline"
                      >
                        {t('compare.viewListing')}
                      </Link>
                    </Cell>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
