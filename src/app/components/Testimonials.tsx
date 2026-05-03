import { Star, Quote } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';
import { fetchEditorialTestimonials, type EditorialTestimonialDto } from '@/lib/marketplace';

function TestimonialCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-5 h-5 rounded-sm bg-gray-200" />
        ))}
      </div>
      <div className="space-y-2 mb-6 flex-1">
        <div className="h-3 bg-gray-200 rounded-md w-full" />
        <div className="h-3 bg-gray-200 rounded-md w-[94%]" />
        <div className="h-3 bg-gray-200 rounded-md w-[78%]" />
      </div>
      <div className="flex gap-3 border-t border-slate-200/90 pt-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-[55%]" />
          <div className="h-3 bg-gray-200 rounded-md w-[72%]" />
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<EditorialTestimonialDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchEditorialTestimonials(8)
      .then((list) => {
        if (!cancelled) setRows(list);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-y border-slate-100 bg-[#f8f9fa] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <PremiumSectionHeading
          align="center"
          className="mb-12"
          eyebrow={t('homePremiumHeading.testimonialsEyebrow')}
          title={t('homePremiumHeading.testimonialsTitle')}
          subtitle={t('homePremiumHeading.testimonialsSubtitle')}
        />

        {loading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            role="status"
            aria-busy="true"
            aria-label="Loading testimonials"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-gray-50 border border-gray-100 max-w-lg mx-auto">
            <p className="text-gray-700 mb-4">Buyer reviews will show here once they’re published for dealers.</p>
            <Link to="/used-car-dealers" className="text-[#233D7B] font-semibold hover:underline">
              Browse dealers →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rows.map((testimonial) => {
              const text =
                testimonial.body?.trim() ||
                testimonial.title?.trim() ||
                'Rated this dealer on BanglarChaka.';
              const role = testimonial.dealer?.business_name
                ? `Dealership · ${testimonial.dealer.business_name}`
                : 'Marketplace buyer';

              return (
                <div
                  key={testimonial.id}
                  className="relative rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg transition hover:shadow-2xl"
                >
                  <Quote className="absolute top-4 right-4 h-10 w-10 text-slate-200" />

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 mb-6 italic">&ldquo;{text}&rdquo;</p>

                    <div className="border-t border-slate-200/90 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#233D7B] to-[#1a2d5a] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(testimonial.reviewer?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{testimonial.reviewer?.name || 'Verified buyer'}</div>
                          <div className="text-xs text-[#233D7B] font-semibold">{role}</div>
                          {testimonial.dealer ? (
                            <Link
                              to={`/dealers/${testimonial.dealer.slug}`}
                              className="text-xs text-gray-500 hover:text-[#233D7B] underline mt-1 inline-block"
                            >
                              View dealer profile
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] rounded-2xl p-8 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready when you are</h3>
            <p className="mb-6 text-lg text-white/85">
              List your vehicle or browse verified inventory backed by real dealer profiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/post-ad"
                className="bg-[#C4161C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition inline-block"
              >
                Post your ad
              </Link>
              <Link
                to="/listings"
                className="bg-white text-[#233D7B] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
              >
                Browse listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
