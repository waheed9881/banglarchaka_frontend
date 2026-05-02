import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { fetchDealers, resolveMediaUrl, type DealerDto } from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SkeletonBox } from '@/app/components/PremiumSkeleton';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

function DealerLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 ring-2 ring-white shadow-md">
      {logoUrl ? (
        <ImageWithFallback src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
      ) : (
        <span className="text-2xl font-bold text-[#00236f]" aria-hidden>
          {initial}
        </span>
      )}
    </div>
  );
}

function DealerCardSkeleton() {
  return (
    <div className="flex w-[min(100%,280px)] shrink-0 snap-start flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:w-[260px]">
      <div className="mb-4 flex gap-4">
        <SkeletonBox className="h-[72px] w-[72px] shrink-0" rounded="rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <SkeletonBox className="h-5 w-[88%]" />
          <SkeletonBox className="h-3 w-[55%]" />
        </div>
      </div>
      <SkeletonBox className="mb-4 h-4 w-[62%] flex-1" />
      <div className="mt-auto flex gap-2">
        <SkeletonBox className="h-10 flex-1" rounded="rounded-xl" />
        <SkeletonBox className="h-10 w-12 shrink-0" rounded="rounded-xl" />
      </div>
    </div>
  );
}

export function Dealers() {
  const { t } = useTranslation();
  const [dealers, setDealers] = useState<DealerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDealers()
      .then((rows) => {
        const sorted = [...rows].sort((a, b) => {
          const va = a.verified_at ? 1 : 0;
          const vb = b.verified_at ? 1 : 0;
          if (vb !== va) return vb - va;
          const ca = a.listings_count ?? 0;
          const cb = b.listings_count ?? 0;
          return cb - ca;
        });
        setDealers(sorted);
      })
      .catch(() => setDealers([]))
      .finally(() => setLoading(false));
  }, []);

  const scrollCarousel = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-dealer-card]') as HTMLElement | null;
    const w = card?.offsetWidth ?? 280;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.gap || '16') || 16;
    el.scrollBy({ left: dir * (w + gap) * (window.innerWidth >= 1024 ? 4 : 2), behavior: 'smooth' });
  }, []);

  const waHref = (raw: string | null | undefined) => {
    if (!raw) return undefined;
    const digits = raw.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : undefined;
  };

  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-[#f8f9fa] py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(35,61,123,0.06),transparent)]"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4">
        <PremiumSectionHeading
          eyebrow={t('dealers.dealerDirectoryBadge')}
          title={t('dealers.featuredHeading')}
          subtitle={
            <>
              {t('dealers.introLead')}
              <span className="font-semibold text-slate-800">{t('dealers.introBold')}</span>
              {t('dealers.introTrail')}
            </>
          }
          action={
            <Link
              to="/used-car-dealers"
              className="inline-flex items-center justify-center self-start rounded-xl border-2 border-[#00236f] bg-white px-7 py-3 text-sm font-bold text-[#00236f] shadow-sm transition hover:bg-[#00236f] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00236f]/40 focus-visible:ring-offset-2 lg:self-end"
            >
              {t('dealers.viewAllDealers')}
            </Link>
          }
        />

        {/* Trust strip — compact benefit row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {(
            [
              {
                Icon: ShieldCheck,
                titleKey: 'dealers.trustVerifiedTitle',
                bodyKey: 'dealers.trustVerifiedBody',
                wrap: 'bg-blue-50 text-[#00236f]',
              },
              {
                Icon: BadgeCheck,
                titleKey: 'dealers.trustPricingTitle',
                bodyKey: 'dealers.trustPricingBody',
                wrap: 'bg-emerald-50 text-emerald-700',
              },
              {
                Icon: Phone,
                titleKey: 'dealers.trustContactTitle',
                bodyKey: 'dealers.trustContactBody',
                wrap: 'bg-orange-50 text-orange-700',
              },
            ] as const
          ).map(({ Icon, titleKey, bodyKey, wrap }) => (
            <div
              key={titleKey}
              className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-4"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${wrap}`}>
                <Icon className="w-5 h-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{t(titleKey)}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t(bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div
            className="relative"
            role="status"
            aria-busy="true"
            aria-label={t('dealers.featuredHeading')}
          >
            <div className="flex gap-4 overflow-x-auto scroll-smooth pb-2 md:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              {Array.from({ length: 4 }, (_, i) => (
                <DealerCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : dealers.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">
            {t('dealers.emptyDirectory')}{' '}
            <Link to="/dealer/portal" className="font-semibold text-[#00236f] hover:underline">
              {t('dealers.registerShowroom')}
            </Link>
            .
          </p>
        ) : (
          <div className="relative">
            <button
              type="button"
              aria-label={t('dealers.ariaPrevDealers')}
              onClick={() => scrollCarousel(-1)}
              className="absolute left-0 top-1/2 z-10 hidden md:flex -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              aria-label={t('dealers.ariaNextDealers')}
              onClick={() => scrollCarousel(1)}
              className="absolute right-0 top-1/2 z-10 hidden md:flex -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 md:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            >
              {dealers.map((dealer) => {
                const city = dealer.branches?.find((b) => b.city)?.city ?? dealer.branches?.[0]?.city ?? 'Bangladesh';
                const listings = dealer.listings_count ?? 0;
                const logoFull = resolveMediaUrl(dealer.logo_path ?? undefined);
                const whatsappUrl = waHref(dealer.whatsapp);

                return (
                  <article
                    key={dealer.id}
                    data-dealer-card
                    className="snap-start shrink-0 w-[min(100%,280px)] sm:w-[260px] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-lg hover:border-[#00236f]/25 hover:-translate-y-0.5 flex flex-col"
                  >
                    <div className="flex gap-4 mb-4">
                      <DealerLogo name={dealer.business_name} logoUrl={logoFull} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{dealer.business_name}</h3>
                          {dealer.verified_at ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                              <BadgeCheck className="w-3 h-3" aria-hidden />
                              {t('dealerPublic.verified')}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          <span className="truncate">{city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-4 flex-1 space-y-1">
                      <p>
                        <span className="font-bold text-[#00236f]">{listings}</span>{' '}
                        <span className="text-gray-600">{t('dealers.liveListings')}</span>
                      </p>
                      {dealer.response_rate_percent != null ? (
                        <p className="text-xs text-gray-500">
                          {t('dealers.responseRate', { pct: dealer.response_rate_percent })}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link
                        to={`/dealers/${dealer.slug}`}
                        className="flex-1 text-center rounded-xl bg-[#00236f] text-white text-sm font-bold py-2.5 hover:bg-[#1a2d5a] transition"
                      >
                        {t('dealers.viewProfile')}
                      </Link>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 text-[#00236f] hover:bg-green-50 hover:border-green-200 transition"
                          aria-label={`WhatsApp ${dealer.business_name}`}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center rounded-xl border border-dashed border-gray-200 px-3 text-gray-300"
                          title={t('dealers.noWhatsappTitle')}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          {t('dealers.footerPreferSearch')}{' '}
          <Link to="/listings?type=used_car&dealer_only=1" className="font-semibold text-[#00236f] hover:underline">
            {t('dealers.dealerOnlyListings')}
          </Link>
        </p>
      </div>
    </section>
  );
}
