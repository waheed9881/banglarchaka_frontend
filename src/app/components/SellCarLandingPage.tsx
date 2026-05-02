import {
  ArrowRight,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  Headphones,
  Lightbulb,
  Shield,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { setPageSeo } from '@/lib/seo';

const WHY_STATS = [
  { title: "Bangladesh’s growing automotive marketplace", sub: 'List where buyers already search daily.' },
  { title: 'Serious buyer traffic', sub: 'More eyes on your listing with clear photos & price.' },
  { title: 'Many sellers connect fast', sub: 'Fair pricing + good pictures speed things up.' },
  { title: 'Tools that help you stand out', sub: 'Featured boosts and dealer options when you need them.' },
];

const STEPS = [
  { title: 'Sign up', body: 'Create your BanglarChaka account so you can post and manage ads.' },
  { title: 'Create your ad', body: 'Add city, specs, mileage, price and clear photos in our guided flow.' },
  { title: 'Get offers', body: 'Chat with buyers and close when you’re comfortable.' },
];

const QUICK_TIPS = [
  {
    title: 'Upload good photos',
    body: 'Landscape shots of front, back and interior get far more replies.',
    icon: Camera,
  },
  {
    title: 'Feature your ad',
    body: 'A featured slot pushes your listing up so it’s seen sooner.',
    icon: Star,
  },
  {
    title: 'Be transparent',
    body: 'Mention service history and defects honestly — it saves everyone time.',
    icon: Shield,
  },
  {
    title: 'Lean on support services',
    body: 'Short on time? Explore inspection & “sell it for me” style programmes.',
    icon: Headphones,
  },
];

const STORIES = [
  {
    quote:
      'Posted before lunch — had serious callers the same evening. The wizard made listing painless.',
    name: 'Rafiq H.',
    city: 'Dhaka',
  },
  {
    quote:
      'Clear photos and a fair price did the trick. Sold within two days of going live.',
    name: 'Nadia K.',
    city: 'Chattogram',
  },
  {
    quote:
      'Better than random groups — one place for messages and my listing looked professional.',
    name: 'Imran S.',
    city: 'Sylhet',
  },
];

const FAQS = [
  {
    q: 'How long does it take to sell?',
    a: 'It depends on price, condition and photos. Detailed listings with multiple pictures tend to get responses fastest.',
  },
  {
    q: 'How do I sell my car online?',
    a: 'Use “Sell it myself” to post a free ad through our step-by-step form. Buyers contact you on the number you provide.',
  },
  {
    q: 'How can I get the best price?',
    a: 'Describe maintenance and documents, set a realistic price versus similar listings, and refresh photos if needed.',
  },
  {
    q: 'Is BanglarChaka free?',
    a: 'Basic listings can be posted under standard accounts; featured placements may be paid — check plans when you post.',
  },
];

export function SellCarLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setPageSeo(
      'Sell your car online · BanglarChaka',
      'Sell your used car in Bangladesh — post a free ad, reach buyers, or explore hassle-free selling options.',
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#233D7B] via-[#1a3266] to-[#152a52] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Sell Your Car Online in Bangladesh — Instantly!
          </h1>
          <p className="mt-4 text-lg text-white/85 max-w-2xl mx-auto">
            Choose how you want to sell — DIY listing or guided help — then reach buyers on Bangladesh’s marketplace for
            cars & bikes.
          </p>
        </div>
      </section>

      {/* Choose path */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-10 pb-16">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-900 mb-8">Choose How To Sell Your Car</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/80 p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <Car className="w-6 h-6 text-[#233D7B]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sell It Myself!</h3>
            </div>
            <ul className="space-y-3 text-gray-600 flex-1 mb-8">
              {[
                'Guided ad in minutes — city, specs, photos & price',
                'Reach buyers browsing BanglarChaka daily',
                'You negotiate directly — full control',
              ].map((t) => (
                <li key={t} className="flex gap-2 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/post-ad?type=used_car"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#C4161C] text-white font-bold hover:bg-red-700 transition shadow-md"
            >
              Post your ad
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/80 p-8 flex flex-col border-t-4 border-[#233D7B]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sell It For Me</h3>
            </div>
            <ul className="space-y-3 text-gray-600 flex-1 mb-6">
              {[
                'Less hassle — we outline inspection & listing support',
                'Featured-style visibility where programmes apply',
                'Sales guidance from enquiry to handover (pilot)',
              ].map((t) => (
                <li key={t} className="flex gap-2 items-start">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              * Pilot availability — limited cities & slots; details on the service page.
            </p>
            <Link
              to="/services/sell-it-for-me"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#233D7B] text-white font-bold hover:bg-[#152949] transition shadow-md"
            >
              Help me sell my car!
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-8">
          By continuing you agree to our{' '}
          <Link to="/terms" className="text-[#233D7B] font-semibold hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[#233D7B] font-semibold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      {/* Why sell */}
      <section className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why Sell Your Car on BanglarChaka?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_STATS.map((s) => (
              <div key={s.title} className="rounded-xl bg-[#f8fafc] border border-gray-100 p-6 text-center">
                <Users className="w-8 h-8 text-[#C4161C] mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{s.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 steps */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">3 Simple Steps to Sell Your Car</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-[#233D7B] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{s.title}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.body}</p>
              {i < STEPS.length - 1 ? (
                <div className="hidden md:block absolute top-8 left-[58%] w-[84%] h-0.5 bg-gray-200 -z-10" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Quick tips */}
      <section className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How to Sell Your Car Quickly?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {QUICK_TIPS.map(({ title, body, icon: Icon }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-gray-100 bg-[#fafafa] p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-8 text-center max-w-2xl mx-auto">
            Short on time?{' '}
            <Link to="/services/sell-it-for-me" className="text-[#233D7B] font-semibold hover:underline">
              Sell It For Me
            </Link>{' '}
            is built for sellers who want the team to shoulder photos, chats and coordination.
          </p>
        </div>
      </section>

      {/* Stories */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Sell Car Success Stories</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STORIES.map((s) => (
            <blockquote
              key={s.name}
              className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 p-6 flex flex-col"
            >
              <p className="text-gray-700 text-sm leading-relaxed flex-1 italic">&ldquo;{s.quote}&rdquo;</p>
              <footer className="mt-6 pt-4 border-t border-gray-100">
                <cite className="not-italic font-bold text-gray-900">{s.name}</cite>
                <div className="text-xs text-gray-500 mt-1">{s.city}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Tips strip */}
      <section className="bg-[#233D7B] text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Lightbulb className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold">Interesting Tips</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-4 text-sm text-white/90 max-w-3xl mx-auto">
            {[
              'Fix small cosmetic issues — first impressions matter in photos.',
              'Price slightly below comparable listings if you want speed.',
              'Meet buyers safely — prefer daytime, public spots for test drives.',
              'Keep registration & tax papers ready for serious buyers.',
            ].map((t) => (
              <li key={t} className="flex gap-2 items-start">
                <span className="text-amber-300 shrink-0">▸</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Video placeholder */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Watch Our Guide For Selling a Car</h2>
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center border border-dashed border-gray-300">
            <div className="w-16 h-16 rounded-full bg-[#C4161C]/90 flex items-center justify-center text-white shadow-lg mb-3">
              <span className="text-2xl ml-1">▶</span>
            </div>
            <p className="text-gray-600 text-sm px-4">Video walkthrough coming soon — follow the post-ad wizard for now.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 max-w-3xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Used Car Sell FAQs</h2>
        <div className="space-y-2">
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50"
                  aria-expanded={open}
                >
                  {item.q}
                  <ChevronDown className={`w-5 h-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open ? (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{item.a}</div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/post-ad?type=used_car"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C4161C] text-white font-bold hover:bg-red-700 shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Start selling — post your car
          </Link>
        </div>
      </section>
    </div>
  );
}
