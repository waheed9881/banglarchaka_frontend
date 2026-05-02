import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Banknote,
  Car,
  ClipboardCheck,
  Globe2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router';

type ServiceTile = {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  iconWrap: string;
  chip: string;
};

const TILES: ServiceTile[] = [
  {
    icon: Car,
    title: 'Sell your vehicle',
    description:
      'Guided flow for used cars — photos, specs, price in BDT, and instant publish. Switch to bikes anytime from Post Ad.',
    to: '/used-cars/sell',
    iconWrap: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-inner shadow-red-900/20',
    chip: 'Seller hub',
  },
  {
    icon: ClipboardCheck,
    title: 'Inspection-ready listings',
    description:
      'Browse used cars with mileage, fuel, transmission, and registration-friendly filters — then open full detail pages.',
    to: '/listings?type=used_car&sort=newest',
    iconWrap: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-inner shadow-blue-900/20',
    chip: 'Live inventory',
  },
  {
    icon: Banknote,
    title: 'Finance-ready pricing',
    description:
      'Use BanglarChaka asking prices as a baseline before bank quotes — sorted grids backed by the listings API.',
    to: '/car-prices',
    iconWrap: 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-inner shadow-emerald-900/20',
    chip: 'Market pulse',
  },
  {
    icon: ShieldCheck,
    title: 'Insurance & protection',
    description:
      'Explore service listings — detailing, policies, and add-ons from sellers on the platform (filter from catalog).',
    to: '/listings?type=service&sort=newest',
    iconWrap: 'bg-gradient-to-br from-violet-500 to-purple-700 shadow-inner shadow-violet-900/20',
    chip: 'Services catalog',
  },
  {
    icon: Wrench,
    title: 'Workshops & parts',
    description:
      'Spares from the auto parts grid plus maintenance-oriented hubs — verified dealers where enabled.',
    to: '/car-care',
    iconWrap: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-inner shadow-orange-900/20',
    chip: 'Parts & care',
  },
  {
    icon: Globe2,
    title: 'Imported & reconditioned',
    description:
      'Filter reconditioned stock and research auction paperwork — listings API + dedicated verification service.',
    to: '/listings?type=used_car&condition=reconditioned',
    iconWrap: 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-inner shadow-teal-900/20',
    chip: 'Imports',
  },
];

const SECONDARY_HINTS: Record<string, { label: string; to: string }> = {
  '/used-cars/sell': { label: 'Sell a bike', to: '/used-bikes/sell' },
  '/listings?type=used_car&sort=newest': { label: 'Certified hub', to: '/services/certified-cars' },
  '/listings?type=service&sort=newest': { label: 'Car care guides', to: '/car-care' },
  '/car-care': { label: 'Auto parts search', to: '/listings?type=auto_part' },
  '/listings?type=used_car&condition=reconditioned': {
    label: 'Auction sheet help',
    to: '/services/auction-sheet-verification',
  },
};

export function Services() {
  return (
    <section className="relative py-14 md:py-16 bg-[#f5f6f8] border-y border-gray-200/80 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(35,61,123,0.07),transparent)]"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-11 md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#233D7B] ring-1 ring-[#233D7B]/12 mb-4">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Marketplace shortcuts
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Services &amp; entry points</h2>
          <p className="text-gray-600 mt-3 text-base leading-relaxed">
            Every tile opens a{' '}
            <span className="font-semibold text-gray-800">real BanglarChaka page</span> — live listing filters, seller
            flows, or service hubs wired to the same API as search.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {TILES.map((tile) => {
            const hint = SECONDARY_HINTS[tile.to];
            const Icon = tile.icon;
            return (
              <div key={tile.title} className="flex flex-col h-full">
                <Link
                  to={tile.to}
                  className="group flex flex-col h-full rounded-2xl bg-white p-6 md:p-7 ring-1 ring-gray-200/90 shadow-sm hover:shadow-xl hover:ring-[#233D7B]/20 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#233D7B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f6f8]"
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${tile.iconWrap}`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2} aria-hidden />
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                      {tile.chip}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#233D7B] transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">{tile.description}</p>

                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#233D7B] group-hover:gap-2 transition-all">
                    Open
                    <ArrowUpRight className="w-4 h-4" aria-hidden />
                  </span>
                </Link>

                {hint ? (
                  <Link
                    to={hint.to}
                    className="mt-2 ml-1 text-xs font-semibold text-gray-500 hover:text-[#233D7B] transition-colors"
                  >
                    {hint.label} →
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Managing inventory, HR, or finance as a dealer?{' '}
          <Link to="/dealer/portal" className="font-semibold text-[#233D7B] hover:underline">
            Dealer portal
          </Link>{' '}
          ·{' '}
          <Link to="/post-ad" className="font-semibold text-[#233D7B] hover:underline">
            Post any listing type
          </Link>
        </p>
      </div>
    </section>
  );
}
