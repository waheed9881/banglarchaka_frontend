import { Star, Quote } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { fetchEditorialTestimonials, type EditorialTestimonialDto } from '@/lib/marketplace';

function TestimonialCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
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
      <div className="flex gap-3 border-t border-neutral-200 pt-4">
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
    <section className="border-t border-neutral-200 bg-neutral-50/60 py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">What buyers say about dealers</h2>
          <p className="text-gray-600 text-lg">Approved reviews pulled from the marketplace (not paid placements)</p>
        </div>

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
            <Link to="/used-car-dealers" className="font-semibold text-brand-red hover:underline">
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
                  className="relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
                >
                  <Quote className="absolute right-4 top-4 h-10 w-10 text-neutral-200" />

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

                    <div className="border-t border-neutral-200 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white">
                          {(testimonial.reviewer?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{testimonial.reviewer?.name || 'Verified buyer'}</div>
                          <div className="text-xs font-semibold text-neutral-600">{role}</div>
                          {testimonial.dealer ? (
                            <Link
                              to={`/dealers/${testimonial.dealer.slug}`}
                              className="mt-1 inline-block text-xs text-neutral-500 underline hover:text-brand-red"
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

        <div className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-900 px-6 py-8 text-center text-white sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Ready when you are</h3>
            <p className="mb-6 text-lg text-white/80">
              List your vehicle or browse verified inventory backed by real dealer profiles.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/post-ad"
                className="inline-block rounded-full bg-brand-red px-8 py-3 font-semibold text-white transition hover:bg-brand-red-hover"
              >
                Post your ad
              </Link>
              <Link
                to="/listings"
                className="inline-block rounded-full border border-white/25 bg-white px-8 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-100"
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
