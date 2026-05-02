import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const BG =
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=80';

export function HomeSellCta() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center md:px-12 md:py-20">
          <div className="absolute inset-0 opacity-25" aria-hidden>
            <img src={BG} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" aria-hidden />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t('homePremium.sellCtaTitle')}
            </h2>
            <p className="mb-10 text-lg text-slate-300">{t('homePremium.sellCtaBody')}</p>
            <Link
              to="/used-cars/sell"
              className="inline-flex rounded-xl bg-[#ba0035] px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#9a002c] hover:shadow-xl"
            >
              {t('homePremium.sellCtaButton')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
