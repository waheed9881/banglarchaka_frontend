import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { toast } from 'sonner';
import logoUrl from '@/assets/logo_3.webp';

const BG = '#23292d';
const LINK_DARK = 'text-gray-400 hover:text-white transition-colors';
const LINK_LIGHT = 'text-slate-600 hover:text-[#ba0035] transition-colors';
const HEADING_DARK = 'text-white font-bold text-[13px] uppercase tracking-wide mb-4';
const HEADING_LIGHT =
  'text-[#00236f] font-bold text-[11px] sm:text-[13px] uppercase tracking-widest mb-4';

function carListings(extra: Record<string, string>) {
  const p = new URLSearchParams({ type: 'used_car', ...extra });
  return `/listings?${p.toString()}`;
}

type FootLink =
  | { labelKey: string; to: string }
  | { labelKey: string; kind: 'careers' };

type FootCol = { titleKey: string; links: FootLink[] };

const COLS_TOP: FootCol[] = [
  {
    titleKey: 'footer.carsByMake',
    links: [
      { labelKey: 'footer.brandToyota', to: carListings({ q: 'Toyota' }) },
      { labelKey: 'footer.brandSuzuki', to: carListings({ q: 'Suzuki' }) },
      { labelKey: 'footer.brandHonda', to: carListings({ q: 'Honda' }) },
      { labelKey: 'footer.brandNissan', to: carListings({ q: 'Nissan' }) },
      { labelKey: 'footer.brandMitsubishi', to: carListings({ q: 'Mitsubishi' }) },
      { labelKey: 'footer.brandHyundai', to: carListings({ q: 'Hyundai' }) },
      { labelKey: 'footer.brandMercedes', to: carListings({ q: 'Mercedes' }) },
      { labelKey: 'footer.brandBmw', to: carListings({ q: 'BMW' }) },
      { labelKey: 'footer.brandKia', to: carListings({ q: 'Kia' }) },
    ],
  },
  {
    titleKey: 'footer.carsByCity',
    links: [
      { labelKey: 'footer.cityDhaka', to: carListings({ city: 'Dhaka' }) },
      { labelKey: 'footer.cityChattogram', to: carListings({ city: 'Chattogram' }) },
      { labelKey: 'footer.citySylhet', to: carListings({ city: 'Sylhet' }) },
      { labelKey: 'footer.cityRajshahi', to: carListings({ city: 'Rajshahi' }) },
      { labelKey: 'footer.cityKhulna', to: carListings({ city: 'Khulna' }) },
      { labelKey: 'footer.cityGazipur', to: carListings({ city: 'Gazipur' }) },
      { labelKey: 'footer.cityCumilla', to: carListings({ city: 'Cumilla' }) },
      { labelKey: 'footer.cityNarayanganj', to: carListings({ city: 'Narayanganj' }) },
      { labelKey: 'footer.cityJessore', to: carListings({ city: 'Jessore' }) },
    ],
  },
  {
    titleKey: 'footer.explore',
    links: [
      { labelKey: 'footer.usedCars', to: '/listings?type=used_car' },
      { labelKey: 'footer.usedBikes', to: '/listings?type=used_bike' },
      { labelKey: 'footer.newCars', to: '/new-cars' },
      { labelKey: 'footer.partsAccessories', to: '/listings?type=auto_part' },
      { labelKey: 'footer.coolRides', to: '/listings?type=used_car&sort=views' },
      { labelKey: 'footer.forums', to: '/forums' },
      { labelKey: 'footer.videos', to: '/videos' },
      { labelKey: 'footer.blog', to: '/blog' },
      { labelKey: 'moreNav.sitemap', to: '/sitemap' },
    ],
  },
  {
    titleKey: 'footer.company',
    links: [
      { labelKey: 'footer.about', to: '/terms' },
      { labelKey: 'footer.products', to: '/sitemap' },
      { labelKey: 'footer.advertise', to: '/post-ad' },
      { labelKey: 'footer.howToPay', to: '/terms' },
      { labelKey: 'footer.faqs', to: '/privacy' },
      { labelKey: 'footer.careers', kind: 'careers' },
      { labelKey: 'footer.contactUs', to: 'mailto:hello@banglarchaka.com' },
    ],
  },
];

const COLS_BOTTOM: FootCol[] = [
  {
    titleKey: 'footer.carsByCategory',
    links: [
      { labelKey: 'footer.suv4x4', to: carListings({ q: 'SUV 4x4' }) },
      { labelKey: 'footer.japaneseCars', to: carListings({ q: 'Japanese Toyota Honda' }) },
      { labelKey: 'footer.importedCars', to: '/listings?type=used_car&condition=reconditioned' },
      { labelKey: 'footer.automaticCars', to: carListings({ transmission: 'automatic' }) },
      { labelKey: 'footer.budgetPicks', to: '/listings?type=used_car&sort=price_asc' },
      { labelKey: 'footer.hybridCars', to: carListings({ fuel_type: 'hybrid' }) },
      { labelKey: 'footer.cc660', to: carListings({ q: '660cc' }) },
      { labelKey: 'footer.cc1300', to: carListings({ q: '1300cc' }) },
    ],
  },
  {
    titleKey: 'footer.carsByBody',
    links: [
      { labelKey: 'footer.sedan', to: carListings({ q: 'sedan' }) },
      { labelKey: 'footer.hatchback', to: carListings({ q: 'hatchback' }) },
      { labelKey: 'footer.suv', to: carListings({ q: 'SUV' }) },
      { labelKey: 'footer.crossover', to: carListings({ q: 'crossover' }) },
      { labelKey: 'footer.mpv', to: carListings({ q: 'MPV Noah van' }) },
      { labelKey: 'footer.pickup', to: carListings({ q: 'pickup' }) },
      { labelKey: 'footer.coupe', to: carListings({ q: 'coupe' }) },
      { labelKey: 'footer.wagon', to: carListings({ q: 'wagon' }) },
    ],
  },
  {
    titleKey: 'footer.carsByColour',
    links: [
      { labelKey: 'footer.whiteCars', to: carListings({ q: 'white' }) },
      { labelKey: 'footer.blackCars', to: carListings({ q: 'black' }) },
      { labelKey: 'footer.silverCars', to: carListings({ q: 'silver' }) },
      { labelKey: 'footer.greyCars', to: carListings({ q: 'grey gray' }) },
      { labelKey: 'footer.blueCars', to: carListings({ q: 'blue' }) },
      { labelKey: 'footer.redCars', to: carListings({ q: 'red' }) },
      { labelKey: 'footer.greenCars', to: carListings({ q: 'green' }) },
      { labelKey: 'footer.goldCars', to: carListings({ q: 'gold' }) },
    ],
  },
  {
    titleKey: 'footer.carsByDivision',
    links: [
      { labelKey: 'footer.divisionDhaka', to: carListings({ city: 'Dhaka' }) },
      { labelKey: 'footer.divisionChattogram', to: carListings({ city: 'Chattogram' }) },
      { labelKey: 'footer.divisionSylhet', to: carListings({ city: 'Sylhet' }) },
      { labelKey: 'footer.divisionRajshahi', to: carListings({ city: 'Rajshahi' }) },
      { labelKey: 'footer.divisionKhulna', to: carListings({ city: 'Khulna' }) },
      { labelKey: 'footer.divisionBarishal', to: carListings({ city: 'Barishal' }) },
      { labelKey: 'footer.divisionRangpur', to: carListings({ city: 'Rangpur' }) },
      { labelKey: 'footer.divisionMymensingh', to: carListings({ city: 'Mymensingh' }) },
    ],
  },
];

function LinkColumn({ col, light }: { col: FootCol; light?: boolean }) {
  const { t } = useTranslation();
  const LINK = light ? LINK_LIGHT : LINK_DARK;
  const HEADING = light ? HEADING_LIGHT : HEADING_DARK;
  return (
    <div>
      <h3 className={HEADING}>{t(col.titleKey)}</h3>
      <ul className="space-y-1.5">
        {col.links.map((item) => (
          <li key={item.labelKey}>
            {'kind' in item && item.kind === 'careers' ? (
              <button
                type="button"
                className={`text-[13px] ${LINK} text-left`}
                onClick={() => toast.message(t('footer.careersToast'))}
              >
                {t(item.labelKey)}
              </button>
            ) : item.to.startsWith('http') || item.to.startsWith('mailto:') ? (
              <a href={item.to} className={`text-[13px] ${LINK}`}>
                {t(item.labelKey)}
              </a>
            ) : (
              <Link to={item.to} className={`text-[13px] ${LINK}`}>
                {t(item.labelKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { t } = useTranslation();
  const [newsletter, setNewsletter] = useState('');

  const onNewsletter = (e: FormEvent) => {
    e.preventDefault();
    const v = newsletter.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error(t('footer.invalidEmail'));
      return;
    }
    toast.success(t('footer.subscribeToast'));
    setNewsletter('');
  };

  const light = tone === 'light';

  const social = [
    { Icon: Twitter, href: 'https://twitter.com', labelKey: 'footer.socialTwitter' as const },
    { Icon: Facebook, href: 'https://facebook.com', labelKey: 'footer.socialFacebook' as const },
    { Icon: Linkedin, href: 'https://linkedin.com', labelKey: 'footer.socialLinkedIn' as const },
    { Icon: Instagram, href: 'https://instagram.com', labelKey: 'footer.socialInstagram' as const },
    { Icon: Youtube, href: 'https://youtube.com', labelKey: 'footer.socialYouTube' as const },
  ];

  return (
    <footer
      className={
        light
          ? 'border-t border-slate-200 bg-[#f8f9fa] text-slate-700'
          : 'text-white'
      }
      style={light ? undefined : { backgroundColor: BG }}
    >
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14">
        <div className={`mb-2 pb-10 ${light ? 'border-b border-slate-200' : 'border-b border-gray-700/80'}`}>
          <Link
            to="/"
            className={`inline-block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00236f]/50 focus-visible:ring-offset-2 ${
              light ? 'focus-visible:ring-offset-[#f8f9fa]' : 'focus-visible:ring-[#3EB549]/80 focus-visible:ring-offset-[#23292d]'
            }`}
          >
            <img
              src={logoUrl}
              alt="Banglar Chaka — বাংলার চাকা"
              className="h-10 sm:h-12 w-auto max-w-full object-contain object-left"
              width={240}
              height={48}
              decoding="async"
            />
          </Link>
        </div>
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-16">
          <div className="flex-1 min-w-0 space-y-12">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
              {COLS_TOP.map((col) => (
                <LinkColumn key={col.titleKey} col={col} light={light} />
              ))}
            </div>
            <div
              className={`grid grid-cols-2 gap-x-8 gap-y-10 border-t pt-2 md:grid-cols-4 ${
                light ? 'border-slate-200' : 'border-gray-700/80'
              }`}
            >
              {COLS_BOTTOM.map((col) => (
                <LinkColumn key={col.titleKey} col={col} light={light} />
              ))}
            </div>
          </div>

          <aside
            className={`w-full shrink-0 space-y-8 xl:w-[280px] xl:border-l xl:pl-10 ${
              light ? 'xl:border-slate-200' : 'xl:border-gray-700/80'
            }`}
          >
            <div>
              <h3 className={light ? HEADING_LIGHT : HEADING_DARK}>{t('footer.sellOnTitle')}</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/used-cars/sell" className={`text-[13px] ${light ? LINK_LIGHT : LINK_DARK}`}>
                    {t('postAd.sellYourCar')}
                  </Link>
                </li>
                <li>
                  <Link to="/used-bikes/sell" className={`text-[13px] ${light ? LINK_LIGHT : LINK_DARK}`}>
                    {t('postAd.sellYourBike')}
                  </Link>
                </li>
                <li>
                  <Link to="/post-ad?type=accessory" className={`text-[13px] ${light ? LINK_LIGHT : LINK_DARK}`}>
                    {t('postAd.sellAccessory')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={light ? HEADING_LIGHT : HEADING_DARK}>{t('footer.newsletterHeading')}</h3>
              <form onSubmit={onNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  placeholder={t('footer.subscribePlaceholder')}
                  className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    light
                      ? 'border-slate-300 bg-white focus:ring-[#00236f]/30'
                      : 'border-gray-600 bg-white focus:ring-[#3EB549]/60'
                  }`}
                  aria-label={t('footer.subscribePlaceholder')}
                />
                <button
                  type="submit"
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${
                    light ? 'bg-[#00236f] hover:bg-[#001a52]' : 'bg-[#3EB549] hover:bg-[#36a340]'
                  }`}
                >
                  {t('footer.subscribeButton')}
                </button>
              </form>
            </div>

            <div>
              <h3 className={light ? HEADING_LIGHT : HEADING_DARK}>{t('footer.followUs')}</h3>
              <div className="flex flex-wrap gap-2">
                {social.map(({ Icon, href, labelKey }) => (
                  <a
                    key={labelKey}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(labelKey)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      light
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-gray-700/90 text-gray-200 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className={light ? HEADING_LIGHT : HEADING_DARK}>{t('footer.downloadApps')}</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-left text-xs font-semibold text-white ring-1 ring-gray-700 hover:ring-gray-500 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.message(t('footer.appComingSoon'));
                  }}
                >
                  {t('footer.googlePlay')}
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-xs font-semibold text-white ring-1 ring-gray-700 hover:ring-gray-500 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.message(t('footer.appComingSoon'));
                  }}
                >
                  {t('footer.appStore')}
                </a>
              </div>
            </div>
          </aside>
        </div>

        <div
          className={`mt-14 space-y-3 border-t pt-8 text-center ${
            light ? 'border-slate-200' : 'border-gray-700'
          }`}
        >
          <p className={`text-xs ${light ? 'text-slate-500' : 'text-gray-500'}`}>
            {t('footer.copyrightLine', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            <Link to="/terms" className={`text-[13px] ${light ? LINK_LIGHT : LINK_DARK} ${light ? '' : 'text-gray-400'}`}>
              {t('footer.termsOfService')}
            </Link>
            <span className={light ? 'text-slate-300' : 'text-gray-600'}>|</span>
            <Link to="/privacy" className={`text-[13px] ${light ? LINK_LIGHT : LINK_DARK} ${light ? '' : 'text-gray-400'}`}>
              {t('footer.privacyPolicyLink')}
            </Link>
          </div>
          <p className={`mx-auto max-w-3xl px-2 text-[11px] leading-relaxed ${light ? 'text-slate-500' : 'text-gray-600'}`}>
            {t('footer.reproductionNote')}
          </p>
        </div>
      </div>
    </footer>
  );
}
