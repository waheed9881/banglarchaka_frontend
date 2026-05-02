import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

const BG = '#23292d';
const LINK = 'text-gray-400 hover:text-white transition-colors';
const HEADING = 'text-white font-bold text-[13px] uppercase tracking-wide mb-4';

function carListings(extra: Record<string, string>) {
  const p = new URLSearchParams({ type: 'used_car', ...extra });
  return `/listings?${p.toString()}`;
}

type FootCol = { title: string; links: Array<{ label: string; to: string }> };

const COLS_TOP: FootCol[] = [
  {
    title: 'Cars by make',
    links: [
      { label: 'Toyota', to: carListings({ q: 'Toyota' }) },
      { label: 'Suzuki', to: carListings({ q: 'Suzuki' }) },
      { label: 'Honda', to: carListings({ q: 'Honda' }) },
      { label: 'Nissan', to: carListings({ q: 'Nissan' }) },
      { label: 'Mitsubishi', to: carListings({ q: 'Mitsubishi' }) },
      { label: 'Hyundai', to: carListings({ q: 'Hyundai' }) },
      { label: 'Mercedes-Benz', to: carListings({ q: 'Mercedes' }) },
      { label: 'BMW', to: carListings({ q: 'BMW' }) },
      { label: 'Kia', to: carListings({ q: 'Kia' }) },
    ],
  },
  {
    title: 'Cars by city',
    links: [
      { label: 'Dhaka', to: carListings({ city: 'Dhaka' }) },
      { label: 'Chattogram', to: carListings({ city: 'Chattogram' }) },
      { label: 'Sylhet', to: carListings({ city: 'Sylhet' }) },
      { label: 'Rajshahi', to: carListings({ city: 'Rajshahi' }) },
      { label: 'Khulna', to: carListings({ city: 'Khulna' }) },
      { label: 'Gazipur', to: carListings({ city: 'Gazipur' }) },
      { label: 'Cumilla', to: carListings({ city: 'Cumilla' }) },
      { label: 'Narayanganj', to: carListings({ city: 'Narayanganj' }) },
      { label: 'Jessore', to: carListings({ city: 'Jessore' }) },
    ],
  },
  {
    title: 'Explore BanglarChaka',
    links: [
      { label: 'Used Cars', to: '/listings?type=used_car' },
      { label: 'Used Bikes', to: '/listings?type=used_bike' },
      { label: 'New Cars', to: '/listings?type=new_car' },
      { label: 'Auto Parts & Accessories', to: '/listings?type=auto_part' },
      { label: 'Cool rides', to: '/listings?type=used_car&sort=views' },
      { label: 'Forums', to: '/forums' },
      { label: 'Videos', to: '/videos' },
      { label: 'Blog', to: '/blog' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
  {
    title: 'BanglarChaka.com',
    links: [
      { label: 'About BanglarChaka', to: '/terms' },
      { label: 'Our products', to: '/sitemap' },
      { label: 'Advertise with us', to: '/post-ad' },
      { label: 'How to pay', to: '/terms' },
      { label: 'FAQs', to: '/privacy' },
      { label: 'Careers', to: '#' },
      { label: 'Contact us', to: 'mailto:hello@banglarchaka.com' },
    ],
  },
];

const COLS_BOTTOM: FootCol[] = [
  {
    title: 'Cars by category',
    links: [
      { label: 'SUV & 4×4', to: carListings({ q: 'SUV 4x4' }) },
      { label: 'Japanese cars', to: carListings({ q: 'Japanese Toyota Honda' }) },
      { label: 'Imported cars', to: '/listings?type=used_car&condition=reconditioned' },
      { label: 'Automatic cars', to: carListings({ transmission: 'automatic' }) },
      { label: 'Budget picks', to: '/listings?type=used_car&sort=price_asc' },
      { label: 'Hybrid cars', to: carListings({ fuel_type: 'hybrid' }) },
      { label: '660cc cars', to: carListings({ q: '660cc' }) },
      { label: '1300cc cars', to: carListings({ q: '1300cc' }) },
    ],
  },
  {
    title: 'Cars by body type',
    links: [
      { label: 'Sedan', to: carListings({ q: 'sedan' }) },
      { label: 'Hatchback', to: carListings({ q: 'hatchback' }) },
      { label: 'SUV', to: carListings({ q: 'SUV' }) },
      { label: 'Crossover', to: carListings({ q: 'crossover' }) },
      { label: 'MPV', to: carListings({ q: 'MPV Noah van' }) },
      { label: 'Pickup', to: carListings({ q: 'pickup' }) },
      { label: 'Coupe', to: carListings({ q: 'coupe' }) },
      { label: 'Wagon', to: carListings({ q: 'wagon' }) },
    ],
  },
  {
    title: 'Cars by colour',
    links: [
      { label: 'White cars', to: carListings({ q: 'white' }) },
      { label: 'Black cars', to: carListings({ q: 'black' }) },
      { label: 'Silver cars', to: carListings({ q: 'silver' }) },
      { label: 'Grey cars', to: carListings({ q: 'grey gray' }) },
      { label: 'Blue cars', to: carListings({ q: 'blue' }) },
      { label: 'Red cars', to: carListings({ q: 'red' }) },
      { label: 'Green cars', to: carListings({ q: 'green' }) },
      { label: 'Gold cars', to: carListings({ q: 'gold' }) },
    ],
  },
  {
    title: 'Cars by division',
    links: [
      { label: 'Dhaka Division', to: carListings({ city: 'Dhaka' }) },
      { label: 'Chattogram Division', to: carListings({ city: 'Chattogram' }) },
      { label: 'Sylhet Division', to: carListings({ city: 'Sylhet' }) },
      { label: 'Rajshahi Division', to: carListings({ city: 'Rajshahi' }) },
      { label: 'Khulna Division', to: carListings({ city: 'Khulna' }) },
      { label: 'Barishal Division', to: carListings({ city: 'Barishal' }) },
      { label: 'Rangpur Division', to: carListings({ city: 'Rangpur' }) },
      { label: 'Mymensingh Division', to: carListings({ city: 'Mymensingh' }) },
    ],
  },
];

function LinkColumn({ col }: { col: FootCol }) {
  return (
    <div>
      <h3 className={HEADING}>{col.title}</h3>
      <ul className="space-y-2.5">
        {col.links.map((item) => (
          <li key={item.label}>
            {item.to.startsWith('http') || item.to.startsWith('mailto:') ? (
              <a href={item.to} className={`text-[13px] ${LINK}`}>
                {item.label}
              </a>
            ) : item.to === '#' ? (
              <button
                type="button"
                className={`text-[13px] ${LINK} text-left`}
                onClick={() => toast.message('Careers — openings will be posted here soon.')}
              >
                {item.label}
              </button>
            ) : (
              <Link to={item.to} className={`text-[13px] ${LINK}`}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const [newsletter, setNewsletter] = useState('');

  const onNewsletter = (e: FormEvent) => {
    e.preventDefault();
    const v = newsletter.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error('Please enter a valid email.');
      return;
    }
    toast.success("Thanks — you're subscribed.");
    setNewsletter('');
  };

  const social = [
    { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="text-white" style={{ backgroundColor: BG }}>
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-16">
          <div className="flex-1 min-w-0 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
              {COLS_TOP.map((col) => (
                <LinkColumn key={col.title} col={col} />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 pt-2 border-t border-gray-700/80">
              {COLS_BOTTOM.map((col) => (
                <LinkColumn key={col.title} col={col} />
              ))}
            </div>
          </div>

          <aside className="w-full xl:w-[280px] shrink-0 space-y-8 xl:border-l xl:border-gray-700/80 xl:pl-10">
            <div>
              <h3 className={HEADING}>Sell on BanglarChaka</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/used-cars/sell" className={`text-[13px] ${LINK}`}>
                    Sell your car
                  </Link>
                </li>
                <li>
                  <Link to="/used-bikes/sell" className={`text-[13px] ${LINK}`}>
                    Sell your bike
                  </Link>
                </li>
                <li>
                  <Link to="/post-ad?type=accessory" className={`text-[13px] ${LINK}`}>
                    Sell accessory
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={HEADING}>Subscribe to our newsletter</h3>
              <form onSubmit={onNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  placeholder="name@email.com"
                  className="flex-1 min-w-0 rounded-md border border-gray-600 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3EB549]/60"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-[#3EB549] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#36a340] transition"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div>
              <h3 className={HEADING}>Follow us</h3>
              <div className="flex flex-wrap gap-2">
                {social.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/90 text-gray-200 hover:bg-gray-600 hover:text-white transition"
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className={HEADING}>Download mobile apps</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-left text-xs font-semibold text-white ring-1 ring-gray-700 hover:ring-gray-500 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.message('BanglarChaka app — coming soon.');
                  }}
                >
                  Google Play
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md bg-black px-4 py-2.5 text-xs font-semibold text-white ring-1 ring-gray-700 hover:ring-gray-500 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.message('BanglarChaka app — coming soon.');
                  }}
                >
                  App Store
                </a>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-700 text-center space-y-3">
          <p className="text-xs text-gray-500">
            Copyright © {new Date().getFullYear()} BanglarChaka — All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            <Link to="/terms" className={`${LINK} text-gray-400`}>
              Terms of Service
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/privacy" className={`${LINK} text-gray-400`}>
              Privacy Policy
            </Link>
          </div>
          <p className="text-[11px] text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Reproduction of material from any BanglarChaka pages without permission is strictly prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
}
