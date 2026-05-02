import {
  Activity,
  BadgeJapaneseYen,
  Banknote,
  Building2,
  Car,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Crown,
  DoorOpen,
  Fuel,
  Gavel,
  Gauge,
  Globe,
  History,
  Leaf,
  Package,
  Settings2,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import type { TFunction } from 'i18next';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { BD_POPULAR_USED_CAR_MODELS } from '@/app/data/bdPopularCars';
import { BD_CITIES, CITY_LABEL_KEYS } from '@/i18n/bdCities';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';
import { PremiumSectionHeading } from '@/app/components/PremiumSectionHeading';

function listingsQs(extra: Record<string, string>) {
  const p = new URLSearchParams({ type: 'used_car', ...extra });
  return `/listings?${p.toString()}`;
}

type CardDef = {
  label: string;
  to: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function BrowseTileSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl border border-gray-200 bg-white px-2 py-3.5 sm:px-3 sm:py-5 min-h-[100px] sm:min-h-[118px] animate-pulse">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 mb-2 shrink-0" />
      <div className="h-3 w-[72%] rounded-md bg-gray-200 max-w-full" />
      <div className="h-3 w-[48%] rounded-md bg-gray-200 mt-2 max-w-full" />
    </div>
  );
}

function BrowseTile({ label, to, Icon }: CardDef) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl border border-gray-200 bg-white px-2 py-3.5 sm:px-3 sm:py-5 shadow-sm transition hover:border-[#233D7B]/60 hover:shadow-md text-center min-h-[100px] sm:min-h-[118px] group active:scale-[0.99]"
    >
      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 group-hover:text-[#233D7B] mb-1.5 sm:mb-2 shrink-0" strokeWidth={1.35} aria-hidden />
      <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{label}</span>
    </Link>
  );
}

function buildCategorySlides(t: TFunction): CardDef[][] {
  return [
    [
      { label: t('browseUsed.tileLiveAuctions'), to: '/auctions', Icon: Gavel },
      { label: t('browseUsed.tileSeater5'), to: listingsQs({ q: '5 seater' }), Icon: Users },
      { label: t('browseUsed.tileAutomaticCars'), to: listingsQs({ transmission: 'automatic' }), Icon: Settings2 },
      { label: t('browseUsed.tileFamilyCars'), to: listingsQs({ q: 'family' }), Icon: Car },
      { label: t('browseUsed.tileBigCars'), to: listingsQs({ q: 'SUV' }), Icon: Truck },
      { label: t('browseUsed.tileSmallCars'), to: listingsQs({ q: 'hatchback' }), Icon: CarFront },
      { label: t('browseUsed.tileDoor5'), to: listingsQs({ q: '5 door' }), Icon: DoorOpen },
      { label: t('browseUsed.tileOldCars'), to: listingsQs({ max_year: '2012' }), Icon: History },
      { label: t('browseUsed.tileDoor4'), to: listingsQs({ q: 'sedan 4 door' }), Icon: CarFront },
      { label: t('browseUsed.tileImportedCarsTile'), to: listingsQs({ q: 'imported recondition' }), Icon: Package },
      { label: t('browseUsed.tileCc1000'), to: listingsQs({ q: '1000cc' }), Icon: Gauge },
      { label: t('browseUsed.tileCc1300Tile'), to: listingsQs({ q: '1300cc' }), Icon: Activity },
      { label: t('browseUsed.tileJapaneseCarsTile'), to: listingsQs({ q: 'Toyota Honda Mazda Nissan' }), Icon: BadgeJapaneseYen },
    ],
    [
      { label: t('browseUsed.tileHybridTile'), to: listingsQs({ fuel_type: 'hybrid' }), Icon: Leaf },
      { label: t('browseUsed.tileElectricTile'), to: listingsQs({ fuel_type: 'electric' }), Icon: Zap },
      { label: t('browseUsed.tilePetrolTile'), to: listingsQs({ fuel_type: 'petrol' }), Icon: Fuel },
      { label: t('browseUsed.tileDieselTile'), to: listingsQs({ fuel_type: 'diesel' }), Icon: Fuel },
      { label: t('browseUsed.tileLuxury'), to: listingsQs({ q: 'luxury BMW Mercedes Audi' }), Icon: Crown },
      { label: t('browseUsed.tileCompactSuv'), to: listingsQs({ q: 'compact SUV crossover' }), Icon: Truck },
      { label: t('browseUsed.tileSedanTile'), to: listingsQs({ q: 'sedan' }), Icon: CarFront },
      { label: t('browseUsed.tileStationWagon'), to: listingsQs({ q: 'wagon estate' }), Icon: Car },
      { label: t('browseUsed.tileSunroof'), to: listingsQs({ q: 'sunroof' }), Icon: Globe },
      { label: t('browseUsed.tileLowMileage'), to: listingsQs({ sort: 'newest' }), Icon: Gauge },
      { label: t('browseUsed.tileSingleOwner'), to: listingsQs({ q: 'single owner' }), Icon: Users },
      { label: t('browseUsed.tileNonAccidental'), to: listingsQs({ q: 'non accidental' }), Icon: Building2 },
    ],
    [
      { label: t('browseUsed.tileBudgetPicksTile'), to: listingsQs({ sort: 'price_asc' }), Icon: Banknote },
      { label: t('browseUsed.tileFeaturedAds'), to: listingsQs({ featured: '1' }), Icon: Crown },
      { label: t('browseUsed.tileDealerCars'), to: listingsQs({ dealer_only: '1' }), Icon: Building2 },
      { label: t('browseUsed.tileManualGearbox'), to: listingsQs({ transmission: 'manual' }), Icon: Settings2 },
      { label: t('browseUsed.tileRecentImports'), to: listingsQs({ q: 'auction grade' }), Icon: Globe },
      { label: t('browseUsed.tileAwd'), to: listingsQs({ q: 'AWD 4WD' }), Icon: Truck },
      { label: t('browseUsed.tileSilverColour'), to: listingsQs({ q: 'silver' }), Icon: Car },
      { label: t('browseUsed.tileWhiteColour'), to: listingsQs({ q: 'white' }), Icon: CarFront },
      { label: t('browseUsed.tileBlackColour'), to: listingsQs({ q: 'black' }), Icon: Car },
      { label: t('browseUsed.tileSunshineCars'), to: listingsQs({ q: 'full fresh' }), Icon: Zap },
      { label: t('browseUsed.tileFinanceOk'), to: listingsQs({ q: 'bank finance' }), Icon: Banknote },
      { label: t('browseUsed.tileBrowseAll'), to: listingsQs({}), Icon: Car },
    ],
  ];
}

function buildBudgetBands(t: TFunction): CardDef[] {
  return [
    { label: t('browseUsed.budgetUnder5L'), to: listingsQs({ max_price: '500000' }), Icon: Banknote },
    { label: t('browseUsed.budget5to10'), to: listingsQs({ min_price: '500000', max_price: '1000000' }), Icon: Banknote },
    { label: t('browseUsed.budget10to15'), to: listingsQs({ min_price: '1000000', max_price: '1500000' }), Icon: Banknote },
    { label: t('browseUsed.budget15to25'), to: listingsQs({ min_price: '1500000', max_price: '2500000' }), Icon: Banknote },
    { label: t('browseUsed.budget25to40'), to: listingsQs({ min_price: '2500000', max_price: '4000000' }), Icon: Banknote },
    { label: t('browseUsed.budget40to60'), to: listingsQs({ min_price: '4000000', max_price: '6000000' }), Icon: Banknote },
    { label: t('browseUsed.budgetAbove60'), to: listingsQs({ min_price: '6000000' }), Icon: Crown },
    { label: t('browseUsed.budgetBestValue'), to: listingsQs({ sort: 'price_asc' }), Icon: Gauge },
    { label: t('browseUsed.budgetPremium'), to: listingsQs({ min_price: '3500000', sort: 'price_desc' }), Icon: Crown },
    { label: t('browseUsed.budgetMidRange'), to: listingsQs({ min_price: '1500000', max_price: '3500000' }), Icon: Car },
    { label: t('browseUsed.budgetStarter'), to: listingsQs({ max_price: '800000' }), Icon: CarFront },
    { label: t('browseUsed.budgetAny'), to: listingsQs({}), Icon: Banknote },
  ];
}

function buildBodyTypes(t: TFunction): CardDef[] {
  return [
    { label: t('footer.hatchback'), to: listingsQs({ q: 'hatchback' }), Icon: CarFront },
    { label: t('footer.sedan'), to: listingsQs({ q: 'sedan' }), Icon: CarFront },
    { label: t('footer.suv'), to: listingsQs({ q: 'SUV' }), Icon: Truck },
    { label: t('footer.crossover'), to: listingsQs({ q: 'crossover' }), Icon: Truck },
      { label: t('browseUsed.bodyMpvVan'), to: listingsQs({ q: 'MPV van Noah Esquire' }), Icon: Car },
    { label: t('footer.coupe'), to: listingsQs({ q: 'coupe' }), Icon: Car },
    { label: t('footer.wagon'), to: listingsQs({ q: 'wagon estate' }), Icon: Car },
    { label: t('footer.pickup'), to: listingsQs({ q: 'pickup truck' }), Icon: Truck },
    { label: t('browseUsed.bodyMicrobus'), to: listingsQs({ q: 'microbus Hiace' }), Icon: Car },
    { label: t('browseUsed.bodyConvertible'), to: listingsQs({ q: 'convertible' }), Icon: Car },
    { label: t('browseUsed.bodyOffRoad'), to: listingsQs({ q: 'Prado Pajero off road' }), Icon: Truck },
    { label: t('browseUsed.bodyOther'), to: listingsQs({ q: 'car sale' }), Icon: Car },
  ];
}

type TabKey = 'category' | 'city' | 'make' | 'model' | 'budget' | 'body';

const TAB_DEFS: Array<{ key: TabKey; labelKey: string }> = [
  { key: 'category', labelKey: 'browseUsed.tabCategory' },
  { key: 'city', labelKey: 'browseUsed.tabCity' },
  { key: 'make', labelKey: 'browseUsed.tabMake' },
  { key: 'model', labelKey: 'browseUsed.tabModel' },
  { key: 'budget', labelKey: 'browseUsed.tabBudget' },
  { key: 'body', labelKey: 'browseUsed.tabBody' },
];

const PER_VIEW = 12;

export function BrowseUsedCarsSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('category');
  const [page, setPage] = useState(0);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setBrandsLoading(false));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [tab]);

  const categorySlides = useMemo(() => buildCategorySlides(t), [t]);

  const cityPages = useMemo(() => {
    const cards: CardDef[] = BD_CITIES.map((city) => ({
      label: t(CITY_LABEL_KEYS[city]),
      to: listingsQs({ city }),
      Icon: Building2,
    }));
    return chunk(cards, PER_VIEW);
  }, [t]);

  const makePages = useMemo(() => {
    const cards: CardDef[] = brands.map((b) => ({
      label: b.name,
      to: listingsQs({ brand_id: String(b.id) }),
      Icon: Car,
    }));
    const rows = cards.length ? cards : [{ label: t('browseUsed.allBrands'), to: listingsQs({}), Icon: Car }];
    return chunk(rows, PER_VIEW);
  }, [brands, t]);

  const modelPages = useMemo(() => {
    const cards: CardDef[] = BD_POPULAR_USED_CAR_MODELS.map(({ label, q }) => ({
      label,
      to: listingsQs({ q }),
      Icon: CarFront,
    }));
    return chunk(cards, PER_VIEW);
  }, []);

  const budgetBands = useMemo(() => buildBudgetBands(t), [t]);
  const bodyTypes = useMemo(() => buildBodyTypes(t), [t]);

  const budgetPages = useMemo(() => chunk(budgetBands, PER_VIEW), [budgetBands]);
  const bodyPages = useMemo(() => chunk(bodyTypes, PER_VIEW), [bodyTypes]);

  const pages: CardDef[][] = useMemo(() => {
    switch (tab) {
      case 'category':
        return categorySlides;
      case 'city':
        return cityPages;
      case 'make':
        return makePages;
      case 'model':
        return modelPages;
      case 'budget':
        return budgetPages;
      case 'body':
        return bodyPages;
      default:
        return categorySlides;
    }
  }, [tab, categorySlides, cityPages, makePages, modelPages, budgetPages, bodyPages]);

  useEffect(() => {
    const maxIdx = Math.max(0, pages.length - 1);
    setPage((p) => Math.min(p, maxIdx));
  }, [pages.length, brands.length]);

  const pageCount = Math.max(1, pages.length);
  const safePage = Math.min(page, pageCount - 1);
  const canPrev = safePage > 0;
  const canNext = safePage < pageCount - 1;

  return (
    <section className="border-y border-slate-100 bg-[#f8f9fa] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <PremiumSectionHeading
          eyebrow={t('homePremiumHeading.browseUsedEyebrow')}
          title={t('browseUsed.title')}
          subtitle={t('homePremiumHeading.browseUsedSubtitle')}
        />

        <div className="mb-6 flex gap-1 overflow-x-auto overscroll-x-contain border-b border-slate-200 pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-8 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {TAB_DEFS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative shrink-0 snap-start whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold transition-colors sm:px-4 sm:py-3 sm:text-sm ${
                tab === key ? 'text-[#00236f]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t(labelKey)}
              {tab === key ? (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#ba0035]" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label={t('browseUsed.ariaPrev')}
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={`hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 ${
              canPrev ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            type="button"
            aria-label={t('browseUsed.ariaNext')}
            disabled={!canNext}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className={`hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 ${
              canNext ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          <div className="overflow-hidden px-0 md:px-12 lg:px-14">
            <div
              className="flex transition-transform duration-300 ease-out touch-pan-y"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {brandsLoading && tab === 'make' ? (
                <div key="make-skeleton" className="min-w-full shrink-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                    {Array.from({ length: PER_VIEW }, (_, i) => (
                      <BrowseTileSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : (
                pages.map((slide, si) => (
                  <div key={`${tab}-${si}`} className="min-w-full shrink-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                      {slide.map((c) => (
                        <BrowseTile key={c.to} {...c} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex md:hidden items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous page"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`flex h-11 min-w-[44px] flex-1 max-w-[140px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 shadow-sm ${
                canPrev ? 'active:bg-gray-50' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
              Back
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={!canNext}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className={`flex h-11 min-w-[44px] flex-1 max-w-[140px] items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 shadow-sm ${
                canNext ? 'active:bg-gray-50' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-8 flex-wrap max-w-full overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t('browseUsed.ariaPage', { page: i + 1 })}
              aria-current={i === safePage ? 'true' : undefined}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all ${
                i === safePage ? 'w-8 bg-[#233D7B]' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
