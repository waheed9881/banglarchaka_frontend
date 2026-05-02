import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { fetchDealers, resolveMediaUrl, type DealerDto } from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
        <span className="text-2xl font-bold text-[#233D7B]" aria-hidden>
          {initial}
        </span>
      )}
    </div>
  );
}

export function Dealers() {
  const [dealers, setDealers] = useState<DealerDto[]>([]);
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
      .catch(() => setDealers([]));
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
    <section className="relative overflow-hidden py-14 md:py-16 bg-white border-y border-gray-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(35,61,123,0.06),transparent)]"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#233D7B]/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#233D7B] mb-3">
              <Store className="w-3.5 h-3.5" aria-hidden />
              Dealer directory
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#233D7B] tracking-tight">Featured Dealers</h2>
            <p className="text-gray-600 mt-2 text-base leading-relaxed">
              Connect with verified showrooms across Bangladesh — live{' '}
              <span className="font-semibold text-gray-800">inventory counts</span> from the BanglarChaka API.
            </p>
          </div>
          <Link
            to="/used-car-dealers"
            className="inline-flex items-center justify-center self-start lg:self-end rounded-xl border-2 border-[#233D7B] bg-white px-7 py-3 text-sm font-bold text-[#233D7B] shadow-sm transition hover:bg-[#233D7B] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#233D7B] focus-visible:ring-offset-2"
          >
            View all dealers
          </Link>
        </div>

        {/* Trust strip — compact, mirrors PakWheels benefit row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            {
              Icon: ShieldCheck,
              title: 'Verified dealers',
              body: 'Badges reflect showroom profiles moderated on-platform.',
              wrap: 'bg-blue-50 text-[#233D7B]',
            },
            {
              Icon: BadgeCheck,
              title: 'Transparent pricing',
              body: 'Browse listings first, then message dealers with context.',
              wrap: 'bg-emerald-50 text-emerald-700',
            },
            {
              Icon: Phone,
              title: 'Easy contact',
              body: 'WhatsApp and showroom links route straight from each profile.',
              wrap: 'bg-orange-50 text-orange-700',
            },
          ].map(({ Icon, title, body, wrap }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-4"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${wrap}`}>
                <Icon className="w-5 h-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {dealers.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">
            No dealers in the directory yet.{' '}
            <Link to="/dealer/portal" className="font-semibold text-[#233D7B] hover:underline">
              Register your showroom
            </Link>
            .
          </p>
        ) : (
          <div className="relative">
            <button
              type="button"
              aria-label="Previous dealers"
              onClick={() => scrollCarousel(-1)}
              className="absolute left-0 top-1/2 z-10 hidden md:flex -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              aria-label="Next dealers"
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
                    className="snap-start shrink-0 w-[min(100%,280px)] sm:w-[260px] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-lg hover:border-[#233D7B]/25 hover:-translate-y-0.5 flex flex-col"
                  >
                    <div className="flex gap-4 mb-4">
                      <DealerLogo name={dealer.business_name} logoUrl={logoFull} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{dealer.business_name}</h3>
                          {dealer.verified_at ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                              <BadgeCheck className="w-3 h-3" aria-hidden />
                              Verified
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
                        <span className="font-bold text-[#233D7B]">{listings}</span>{' '}
                        <span className="text-gray-600">live listings</span>
                      </p>
                      {dealer.response_rate_percent != null ? (
                        <p className="text-xs text-gray-500">Response rate · ~{dealer.response_rate_percent}%</p>
                      ) : null}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link
                        to={`/dealers/${dealer.slug}`}
                        className="flex-1 text-center rounded-xl bg-[#233D7B] text-white text-sm font-bold py-2.5 hover:bg-[#1a2d5a] transition"
                      >
                        View profile
                      </Link>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 text-[#233D7B] hover:bg-green-50 hover:border-green-200 transition"
                          aria-label={`WhatsApp ${dealer.business_name}`}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-xl border border-dashed border-gray-200 px-3 text-gray-300" title="No WhatsApp on file">
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
          Prefer search filters?{' '}
          <Link to="/listings?type=used_car&dealer_only=1" className="font-semibold text-[#233D7B] hover:underline">
            Dealer-only listings
          </Link>
        </p>
      </div>
    </section>
  );
}
