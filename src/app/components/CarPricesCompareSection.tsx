import { GitCompare, LineChart, Link2 } from 'lucide-react';
import { Link } from 'react-router';

export function CarPricesCompareSection() {
  return (
    <section className="rounded-2xl border border-[#233D7B]/25 bg-gradient-to-br from-[#233D7B] via-[#1a3266] to-[#14284f] p-6 sm:p-8 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/90">
            <LineChart className="h-3.5 w-3.5" aria-hidden />
            Price intelligence
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Compare asking prices side by side</h2>
          <p className="mt-2 text-sm sm:text-[15px] text-white/85 leading-relaxed">
            Use live listings as a baseline: pick two similar cars below on the homepage compare strip, open the compare
            workspace, then cross-check trims, mileage and city here on the price explorer.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C4161C] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-700 transition"
            >
              <GitCompare className="h-4 w-4" aria-hidden />
              Open compare workspace
            </Link>
            <Link
              to="/listings?type=used_car&sort=price_desc"
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              Browse high/low used prices
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 text-[13px] text-white/80">
        <div className="rounded-xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
          <strong className="block text-white">1 — Shortlist trims</strong>
          <span className="mt-1 block leading-snug">Filter by fuel, year and seller type on the listings page.</span>
        </div>
        <div className="rounded-xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
          <strong className="block text-white">2 — Compare specs</strong>
          <span className="mt-1 block leading-snug">Open <span className="text-white">/compare</span> with two public IDs selected.</span>
        </div>
        <div className="rounded-xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
          <strong className="block text-white">3 — Negotiate</strong>
          <span className="mt-1 block leading-snug">Bring printed compare notes into dealer or private seller discussions.</span>
        </div>
      </div>
    </section>
  );
}
