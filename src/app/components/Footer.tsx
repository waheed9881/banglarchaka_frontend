import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { toast } from 'sonner';
import logoUrl from '@/assets/logo_3.webp';

const LINK = 'text-neutral-600 hover:text-brand-red transition-colors text-[11px] leading-snug';
const HEADING = 'text-neutral-900 font-bold text-[10px] uppercase tracking-wider mb-1.5';

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

function LinkColumn({ col }: { col: FootCol }) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className={HEADING}>{t(col.titleKey)}</h3>
      <ul className="space-y-1">
        {col.links.map((item) => (
          <li key={item.labelKey}>
            {'kind' in item && item.kind === 'careers' ? (
              <button
                type="button"
                className={`${LINK} text-left`}
                onClick={() => toast.message(t('footer.careersToast'))}
              >
                {t(item.labelKey)}
              </button>
            ) : item.to.startsWith('http') || item.to.startsWith('mailto:') ? (
              <a href={item.to} className={LINK}>
                {t(item.labelKey)}
              </a>
            ) : (
              <Link to={item.to} className={LINK}>
                {t(item.labelKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
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

  const social = [
    { Icon: Twitter, href: 'https://twitter.com', labelKey: 'footer.socialTwitter' as const },
    { Icon: Facebook, href: 'https://facebook.com', labelKey: 'footer.socialFacebook' as const },
    { Icon: Linkedin, href: 'https://linkedin.com', labelKey: 'footer.socialLinkedIn' as const },
    { Icon: Instagram, href: 'https://instagram.com', labelKey: 'footer.socialInstagram' as const },
    { Icon: Youtube, href: 'https://youtube.com', labelKey: 'footer.socialYouTube' as const },
  ];

  return (
    <footer className="relative border-t border-neutral-200 bg-neutral-50 text-neutral-800">
      <div
        className="h-1 w-full bg-gradient-to-r from-brand-red via-neutral-100 to-brand-green"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-6">
        <div className="mb-3 border-b border-neutral-200 pb-4">
          <Link
            to="/"
            className="inline-block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
          >
            <img
              src={logoUrl}
              alt="Banglar Chaka — বাংলার চাকা"
              className="h-9 w-auto max-w-full object-contain object-left sm:h-10"
              width={240}
              height={56}
              decoding="async"
            />
          </Link>
        </div>
        <div className="flex flex-col gap-5 xl:flex-row xl:gap-8">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4 md:gap-x-5">
              {COLS_TOP.map((col) => (
                <LinkColumn key={col.titleKey} col={col} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-neutral-200 pt-4 md:grid-cols-4 md:gap-x-5">
              {COLS_BOTTOM.map((col) => (
                <LinkColumn key={col.titleKey} col={col} />
              ))}
            </div>
          </div>

          <aside className="w-full shrink-0 space-y-4 xl:w-[240px] xl:border-l xl:border-neutral-200 xl:pl-6">
            <div>
              <h3 className={HEADING}>{t('footer.sellOnTitle')}</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/used-cars/sell" className={LINK}>
                    {t('postAd.sellYourCar')}
                  </Link>
                </li>
                <li>
                  <Link to="/used-bikes/sell" className={LINK}>
                    {t('postAd.sellYourBike')}
                  </Link>
                </li>
                <li>
                  <Link to="/post-ad?type=accessory" className={LINK}>
                    {t('postAd.sellAccessory')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={HEADING}>{t('footer.newsletterHeading')}</h3>
              <form onSubmit={onNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  placeholder={t('footer.subscribePlaceholder')}
                  className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-green/45"
                  aria-label={t('footer.subscribePlaceholder')}
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-brand-green px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-green-hover"
                >
                  {t('footer.subscribeButton')}
                </button>
              </form>
            </div>

            <div>
              <h3 className={HEADING}>{t('footer.followUs')}</h3>
              <div className="flex flex-wrap gap-2">
                {social.map(({ Icon, href, labelKey }) => (
                  <a
                    key={labelKey}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(labelKey)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-brand-red/40 hover:bg-brand-red hover:text-white"
                  >
                    <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className={HEADING}>{t('footer.downloadApps')}</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-left text-[10px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.message(t('footer.appComingSoon'));
                  }}
                >
                  {t('footer.googlePlay')}
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
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

        <div className="mt-5 space-y-1.5 border-t border-neutral-200 pt-4 text-center">
          <p className="text-[11px] text-neutral-500">{t('footer.copyrightLine', { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px]">
            <Link to="/terms" className={`${LINK}`}>
              {t('footer.termsOfService')}
            </Link>
            <span className="text-neutral-300">|</span>
            <Link to="/privacy" className={`${LINK}`}>
              {t('footer.privacyPolicyLink')}
            </Link>
          </div>
          <p className="mx-auto max-w-3xl px-2 text-[10px] leading-snug text-neutral-500">{t('footer.reproductionNote')}</p>
        </div>
      </div>
    </footer>
  );
}
