import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';
import { Link } from 'react-router';
import { fetchBrands, resolveMediaUrl, type BrandDto } from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SkeletonBox } from '@/app/components/PremiumSkeleton';

function BrandTileSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <SkeletonBox className="mb-3 h-16 w-16" rounded="rounded-full" />
      <SkeletonBox className="mb-2 h-4 w-20" />
      <SkeletonBox className="h-3 w-14" />
    </div>
  );
}

export function BrowseByBrand() {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands()
      .then((rows) => setBrands(rows.slice(0, 8)))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-y border-slate-100 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <PremiumSectionHeading
          align="center"
          eyebrow={t('homePremiumHeading.browseByMakeEyebrow')}
          title={t('homeSections.browseByMakeTitle')}
          subtitle={t('homePremiumHeading.browseByMakeSubtitle')}
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {loading ? (
            Array.from({ length: 8 }, (_, i) => <BrandTileSkeleton key={i} />)
          ) : null}
          {!loading &&
            brands.map((brand) => {
              const logo = brand.logo_path ? resolveMediaUrl(brand.logo_path) : null;
              return (
                <Link
                  key={brand.id}
                  to={`/listings?type=used_car&brand_id=${brand.id}`}
                  className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#00236f]/25 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00236f]/40"
                >
                  <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-100 transition group-hover:ring-[#00236f]/20">
                    {logo ? (
                      <ImageWithFallback
                        src={logo}
                        alt=""
                        className="h-10 w-auto max-w-[3rem] object-contain grayscale opacity-70 transition group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-slate-400">{brand.name[0]}</span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-900">{brand.name}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {brand.slug}
                  </div>
                </Link>
              );
            })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/listings?type=used_car"
            className="inline-flex rounded-xl border-2 border-[#00236f] px-8 py-3 text-sm font-bold text-[#00236f] transition hover:bg-[#00236f] hover:text-white"
          >
            {t('homeSections.viewAllBrands')}
          </Link>
        </div>
      </div>
    </section>
  );
}
