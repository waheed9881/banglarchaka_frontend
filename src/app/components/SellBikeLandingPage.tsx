import {
  ArrowRight,
  Bike,
  Camera,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { setPageSeo } from '@/lib/seo';

const STEPS = [
  { title: 'Sign up on BanglarChaka', body: 'Create an account so you can post and reply to buyers.' },
  { title: 'Create your ad', body: 'Enter bike details, photos and price in our guided 3-step form.' },
  { title: 'Get offers', body: 'Serious buyers reach you by phone or WhatsApp — negotiate safely.' },
];

const QUICK_TIPS = [
  {
    title: 'Landscape photos',
    body: 'Ads with several clear angles get far more views — wash the bike first.',
    icon: Camera,
  },
  {
    title: 'Feature your ad',
    body: 'Featured slots push you up in results when you need speed.',
    icon: Star,
  },
  {
    title: 'Realistic price',
    body: 'Compare similar listings in your city so replies stay genuine.',
    icon: TrendingUp,
  },
];

const STORIES = [
  {
    quote: 'Posting took minutes — buyers started calling the same day. Very straightforward.',
    name: 'Tanvir R.',
    city: 'Dhaka',
  },
  {
    quote: 'Good photos and an honest description meant no time-wasters. Sold within a week.',
    name: 'Sharmin A.',
    city: 'Chattogram',
  },
  {
    quote: 'Better than random Facebook groups — everything looked proper on one page.',
    name: 'Rubel M.',
    city: 'Rajshahi',
  },
];

const HOT_TIPS = [
  'Clean your bike — first impressions in photos matter.',
  'Shoot front, back, both sides and odometer in daylight.',
  'Mention service history, papers and any mechanical issues clearly.',
  'Offer a short test ride only in a safe, public place.',
];

const FAQS = [
  {
    q: 'How long will it take to sell my bike?',
    a: 'Often a few days — sometimes faster — depending on price, condition and photo quality. Featured ads can speed things up.',
  },
  {
    q: 'How can I get the best price?',
    a: 'Describe mileage, ownership and maintenance honestly; upload sharp pictures and align your price with similar bikes.',
  },
  {
    q: 'Can I sell a non-running bike?',
    a: 'Yes — be transparent about faults and parts needed so buyers know what they are getting.',
  },
  {
    q: 'Is it safe to sell online?',
    a: 'Use a trusted marketplace, avoid advance payments to strangers, and meet in safe public locations.',
  },
];

export function SellBikeLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setPageSeo(
      'Sell your bike online · BanglarChaka',
      'Post a free used-bike ad in Bangladesh — photos, price and buyer contact in a few simple steps.',
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#233D7B] via-[#1a3266] to-[#152a52] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 pt-14 pb-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
            <Bike className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
            Sell your bike / motorcycle online in Bangladesh — instantly!
          </h1>
          <p className="mt-4 text-lg text-white/90 font-semibold">Post an ad for free!</p>
          <p className="mt-2 text-white/80 max-w-xl mx-auto">
            Sell from home — reach riders browsing BanglarChaka every day.
          </p>
          <Link
            to="/post-ad?type=used_bike"
            className="mt-10 inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-emerald-600 text-white text-lg font-bold hover:bg-emerald-700 shadow-lg transition"
          >
            <Sparkles className="w-5 h-5" />
            I want to sell my bike
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">3 simple steps to sell your bike</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.title} className="text-center rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
              <div className="w-14 h-14 rounded-full bg-[#233D7B] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How to sell your bike quickly?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {QUICK_TIPS.map(({ title, body, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-[#fafafa] p-6">
                <Icon className="w-8 h-8 text-[#233D7B] mb-3" />
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Sell bike success stories</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STORIES.map((s) => (
            <blockquote key={s.name} className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 p-6">
              <p className="text-gray-700 text-sm leading-relaxed italic">&ldquo;{s.quote}&rdquo;</p>
              <footer className="mt-4 pt-4 border-t border-gray-100">
                <cite className="not-italic font-bold text-gray-900">{s.name}</cite>
                <div className="text-xs text-gray-500 mt-1">{s.city}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-[#233D7B] text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Tag className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold">Hot tips to sell used bikes</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-white/90 max-w-3xl mx-auto">
            {HOT_TIPS.map((t) => (
              <li key={t} className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4 pb-24">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">FAQs about selling bikes</h2>
        </div>
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
            to="/post-ad?type=used_bike"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg"
          >
            <Bike className="w-5 h-5" />
            Start — post your bike ad
          </Link>
        </div>
      </section>
    </div>
  );
}
