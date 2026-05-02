import { Car, Truck, Zap, Bike, Bus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

const TILES: Array<{ slug: string; icon: typeof Car; href: string }> = [
  { slug: 'sedan', icon: Car, href: '/listings?type=used_car&q=sedan' },
  { slug: 'suv', icon: Truck, href: '/listings?type=used_car&q=SUV' },
  { slug: 'hybrid', icon: Zap, href: '/listings?type=used_car&fuel_type=hybrid' },
  { slug: 'electric', icon: Zap, href: '/listings?type=used_car&fuel_type=electric' },
  { slug: 'bikes', icon: Bike, href: '/listings?type=used_bike' },
  { slug: 'van', icon: Bus, href: '/listings?type=used_car&q=van' },
];

export function HomeBrowseCategories() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <PremiumSectionHeading
          align="center"
          eyebrow={t('homePremiumHeading.browseByCategoryEyebrow')}
          title={t('homePremium.browseByCategory')}
          subtitle={t('homePremiumHeading.browseByCategorySubtitle')}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
          {TILES.map(({ slug, icon: Icon, href }) => (
            <Link
              key={slug}
              to={href}
              className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon
                className="mb-3 h-10 w-10 text-[#00236f] transition group-hover:scale-110"
                strokeWidth={1.25}
                aria-hidden
              />
              <span className="text-sm font-bold text-slate-800">{t(`homePremium.category.${slug}`)}</span>
            </Link>
          ))}
          <Link
            to="/listings?type=used_car&sort=views"
            className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Sparkles className="mb-3 h-10 w-10 text-[#ba0035] transition group-hover:scale-110" strokeWidth={1.25} />
            <span className="text-sm font-bold text-slate-800">{t('homePremium.category.popular')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
