import { Crown, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { fetchPublicFeaturedBoostPackages, formatMoney, type FeaturedBoostPackageDto } from '@/lib/marketplace';

export function PostAdFeaturedPackagesStrip() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<FeaturedBoostPackageDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicFeaturedBoostPackages()
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/40 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C4161C] text-white shadow-md">
          <Crown className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900">{t('postAdForm.featuredUpsell.title')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">{t('postAdForm.featuredUpsell.lead')}</p>
          <p className="mt-2 text-xs text-gray-600">{t('postAdForm.featuredUpsell.afterPublishNote')}</p>
          <Link
            to="/used-cars/featured"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#233D7B] hover:underline"
          >
            {t('postAdForm.featuredUpsell.browseFeaturedLink')}
            <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-5 border-t border-amber-100 pt-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-900/80">
          {t('postAdForm.featuredUpsell.packageLabel')}
        </p>
        {loading ? (
          <p className="text-sm text-gray-600">{t('postAdForm.featuredUpsell.loading')}</p>
        ) : packages.length === 0 ? (
          <p className="text-sm text-gray-600">{t('postAdForm.featuredUpsell.emptyPackages')}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {packages.map((pkg) => (
              <li key={pkg.slug} className="h-full">
                <Link
                  to={`/my-listings?promote_package=${encodeURIComponent(pkg.slug)}`}
                  className="flex h-full flex-col rounded-lg border border-white/80 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-black/[0.04] transition hover:border-[#233D7B]/35 hover:bg-white hover:shadow-md"
                >
                  <p className="font-semibold text-gray-900">{pkg.name}</p>
                  <p className="mt-1 text-xs text-gray-600">{t('postAdForm.featuredUpsell.days', { count: pkg.duration_days })}</p>
                  <p className="mt-2 text-base font-bold text-[#3EB549]">{formatMoney(pkg.price, pkg.currency)}</p>
                  <span className="mt-3 text-xs font-semibold text-[#233D7B]">
                    Apply on a listing →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
