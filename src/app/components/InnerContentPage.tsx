import { CheckCircle2 } from 'lucide-react';
import { Link, type To } from 'react-router';
import { useEffect, useState } from 'react';
import {
  fetchDealers,
  fetchListings,
  formatMoney,
  resolveMediaUrl,
  type DealerDto,
  type ListingDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';

type QuickLink = {
  label: string;
  to: To;
};

export type InnerListingFeed = {
  heading: string;
  params: Record<string, string | number | boolean | undefined>;
  per_page?: number;
};

export type InnerDealersPreview = {
  heading: string;
  limit?: number;
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=640&q=80';

function ListingCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-md w-[88%]" />
        <div className="h-5 bg-gray-200 rounded-md w-[36%]" />
        <div className="h-3 bg-gray-100 rounded w-[40%]" />
      </div>
    </div>
  );
}

export function InnerPageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#233D7B] via-[#1a3266] to-[#152a52] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#C4161C]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-14 border-b-4 border-[#C4161C]">
        <div className="text-sm text-white/75 mb-4 flex flex-wrap items-center gap-x-1 gap-y-1">
          <Link to="/" className="hover:text-white transition-colors font-medium">
            Home
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-white font-medium">{title}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-4 text-lg text-white/85 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

export function InnerContentPage({
  title,
  subtitle,
  highlights,
  quickLinks,
  listingsSections,
  dealersPreview,
}: {
  title: string;
  subtitle: string;
  highlights: string[];
  quickLinks?: QuickLink[];
  listingsSections?: InnerListingFeed[];
  dealersPreview?: InnerDealersPreview;
}) {
  useEffect(() => {
    const desc = subtitle.length > 168 ? `${subtitle.slice(0, 165)}…` : subtitle;
    setPageSeo(`${title} · BanglarChaka`, desc);
  }, [title, subtitle]);

  const [listingBlocks, setListingBlocks] = useState<Array<{ heading: string; items: ListingDto[] }>>([]);
  const [listingsLoading, setListingsLoading] = useState(!!listingsSections?.length);
  const [dealers, setDealers] = useState<DealerDto[]>([]);
  const [dealersLoading, setDealersLoading] = useState(!!dealersPreview);

  useEffect(() => {
    if (!listingsSections?.length) {
      setListingBlocks([]);
      setListingsLoading(false);
      return;
    }
    let cancelled = false;
    setListingsLoading(true);
    Promise.all(
      listingsSections.map(async (section) => ({
        heading: section.heading,
        items: await fetchListings({
          ...section.params,
          per_page: section.per_page ?? 6,
        }),
      })),
    )
      .then((blocks) => {
        if (!cancelled) setListingBlocks(blocks);
      })
      .catch(() => {
        if (!cancelled) setListingBlocks([]);
      })
      .finally(() => {
        if (!cancelled) setListingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingsSections]);

  useEffect(() => {
    if (!dealersPreview) {
      setDealers([]);
      setDealersLoading(false);
      return;
    }
    let cancelled = false;
    setDealersLoading(true);
    fetchDealers()
      .then((rows) => {
        if (!cancelled) setDealers(rows.slice(0, dealersPreview.limit ?? 4));
      })
      .catch(() => {
        if (!cancelled) setDealers([]);
      })
      .finally(() => {
        if (!cancelled) setDealersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dealersPreview]);

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <InnerPageHero title={title} subtitle={subtitle} />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="h-8 w-1 rounded-full bg-[#C4161C]" aria-hidden />
            What you can do here
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white px-4 py-4 text-sm text-gray-700 leading-snug"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#233D7B] mt-0.5" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {(listingsSections?.length ?? 0) > 0 ? (
          <div className="space-y-10 mb-10">
            {listingsLoading ? (
              <div className="space-y-10">
                {(listingsSections ?? [{ per_page: 6 }]).map((sec, idx) => (
                  <div key={`sk-${idx}`} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 p-6 sm:p-8">
                    <div className="h-7 bg-gray-100 rounded-md w-52 mb-6 animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {Array.from({ length: Math.min(6, sec.per_page ?? 6) }).map((_, i) => (
                        <ListingCardSkeleton key={i} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              listingBlocks.map((block) => (
                <div key={block.heading} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 p-6 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{block.heading}</h3>
                      <p className="text-sm text-gray-500 mt-1">Hand-picked from live marketplace listings</p>
                    </div>
                    <Link
                      to="/listings"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#233D7B] hover:text-[#C4161C] transition-colors"
                    >
                      Browse all
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                  {block.items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
                      <p className="text-gray-600 text-sm">No listings match this filter yet — check back soon.</p>
                      <Link to="/post-ad" className="inline-block mt-4 text-sm font-semibold text-[#C4161C] hover:underline">
                        Post the first ad
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {block.items.map((row) => {
                        const href =
                          row.listing_type === 'new_car' ? `/new-cars/${row.id}` : `/listings/${row.id}`;
                        return (
                          <Link
                            key={row.id}
                            to={href}
                            className="group rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-[#233D7B]/25 hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                              <img
                                src={resolveMediaUrl(row.media?.[0]?.path) || FALLBACK_IMG}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                            </div>
                            <div className="p-4">
                              <div className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#233D7B] transition-colors">
                                {row.title}
                              </div>
                              <div className="text-[#C4161C] font-bold text-base mt-2">
                                {formatMoney(row.price, row.currency)}
                              </div>
                              {row.location_city ? (
                                <div className="text-xs text-gray-500 mt-1.5">{row.location_city}</div>
                              ) : null}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : null}

        {dealersPreview ? (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 p-6 sm:p-8 mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900">{dealersPreview.heading}</h3>
              <Link
                to="/listings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#233D7B] hover:text-[#C4161C] transition-colors"
              >
                View inventory
                <span aria-hidden>→</span>
              </Link>
            </div>
            {dealersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : dealers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center text-gray-600 text-sm">
                No dealers published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dealers.map((d) => (
                  <Link
                    key={d.id}
                    to={`/dealers/${d.slug}`}
                    className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-5 hover:border-[#233D7B]/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="font-bold text-gray-900 line-clamp-2">{d.business_name}</div>
                    <div className="text-xs text-gray-500 mt-2">{d.branches?.[0]?.city || 'Bangladesh'}</div>
                    <div className="text-sm text-[#C4161C] mt-3 font-bold">{d.listings_count ?? 0} listings</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {quickLinks && quickLinks.length > 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Related pages</h3>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={
                    typeof link.to === 'string'
                      ? link.to
                      : `${link.to.pathname}${link.to.hash ? `#${link.to.hash}` : ''}`
                  }
                  to={link.to}
                  className="inline-flex items-center rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#233D7B] hover:border-[#233D7B] hover:bg-[#233D7B] hover:text-white transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
