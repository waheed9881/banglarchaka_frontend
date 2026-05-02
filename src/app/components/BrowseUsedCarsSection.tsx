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
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link } from 'react-router';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';

const BD_CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Gazipur',
  'Cumilla',
  'Mymensingh',
  'Jessore',
  'Narayanganj',
];

const POPULAR_MODELS: Array<{ label: string; q: string }> = [
  { label: 'Toyota Corolla', q: 'Toyota Corolla' },
  { label: 'Honda Civic', q: 'Honda Civic' },
  { label: 'Honda City', q: 'Honda City' },
  { label: 'Suzuki Swift', q: 'Suzuki Swift' },
  { label: 'Toyota Axio', q: 'Toyota Axio' },
  { label: 'Toyota Noah', q: 'Toyota Noah' },
  { label: 'Suzuki Alto', q: 'Suzuki Alto' },
  { label: 'Mitsubishi Pajero', q: 'Mitsubishi Pajero' },
  { label: 'Toyota Premio', q: 'Toyota Premio' },
  { label: 'Nissan X-Trail', q: 'Nissan X-Trail' },
  { label: 'Hyundai Tucson', q: 'Hyundai Tucson' },
  { label: 'Kia Sportage', q: 'Kia Sportage' },
  { label: 'Toyota Hiace', q: 'Toyota Hiace' },
  { label: 'Mazda Axela', q: 'Mazda Axela' },
  { label: 'Subaru Forester', q: 'Subaru Forester' },
  { label: 'Mercedes C-Class', q: 'Mercedes C-Class' },
];

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

function BrowseTile({ label, to, Icon }: CardDef) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-5 shadow-sm transition hover:border-[#233D7B]/60 hover:shadow-md text-center min-h-[118px] group"
    >
      <Icon className="w-10 h-10 text-gray-400 group-hover:text-[#233D7B] mb-2 shrink-0" strokeWidth={1.35} aria-hidden />
      <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">{label}</span>
    </Link>
  );
}

const CATEGORY_PAGES: CardDef[][] = [
  [
    { label: '5 Seater', to: listingsQs({ q: '5 seater' }), Icon: Users },
    { label: 'Automatic cars', to: listingsQs({ transmission: 'automatic' }), Icon: Settings2 },
    { label: 'Family Cars', to: listingsQs({ q: 'family' }), Icon: Car },
    { label: 'Big cars', to: listingsQs({ q: 'SUV' }), Icon: Truck },
    { label: 'Small cars', to: listingsQs({ q: 'hatchback' }), Icon: CarFront },
    { label: '5 Door', to: listingsQs({ q: '5 door' }), Icon: DoorOpen },
    { label: 'Old Cars', to: listingsQs({ max_year: '2012' }), Icon: History },
    { label: '4 Door', to: listingsQs({ q: 'sedan 4 door' }), Icon: CarFront },
    { label: 'Imported cars', to: listingsQs({ q: 'imported recondition' }), Icon: Package },
    { label: '1000cc cars', to: listingsQs({ q: '1000cc' }), Icon: Gauge },
    { label: '1300cc cars', to: listingsQs({ q: '1300cc' }), Icon: Activity },
    { label: 'Japanese cars', to: listingsQs({ q: 'Toyota Honda Mazda Nissan' }), Icon: BadgeJapaneseYen },
  ],
  [
    { label: 'Hybrid', to: listingsQs({ fuel_type: 'hybrid' }), Icon: Leaf },
    { label: 'Electric', to: listingsQs({ fuel_type: 'electric' }), Icon: Zap },
    { label: 'Petrol', to: listingsQs({ fuel_type: 'petrol' }), Icon: Fuel },
    { label: 'Diesel', to: listingsQs({ fuel_type: 'diesel' }), Icon: Fuel },
    { label: 'Luxury', to: listingsQs({ q: 'luxury BMW Mercedes Audi' }), Icon: Crown },
    { label: 'Compact SUV', to: listingsQs({ q: 'compact SUV crossover' }), Icon: Truck },
    { label: 'Sedan', to: listingsQs({ q: 'sedan' }), Icon: CarFront },
    { label: 'Station wagon', to: listingsQs({ q: 'wagon estate' }), Icon: Car },
    { label: 'Sunroof', to: listingsQs({ q: 'sunroof' }), Icon: Globe },
    { label: 'Low mileage', to: listingsQs({ sort: 'newest' }), Icon: Gauge },
    { label: 'Single owner', to: listingsQs({ q: 'single owner' }), Icon: Users },
    { label: 'Non accidental', to: listingsQs({ q: 'non accidental' }), Icon: Building2 },
  ],
  [
    { label: 'Budget picks', to: listingsQs({ sort: 'price_asc' }), Icon: Banknote },
    { label: 'Featured ads', to: listingsQs({ featured: '1' }), Icon: Crown },
    { label: 'Dealer cars', to: listingsQs({ dealer_only: '1' }), Icon: Building2 },
    { label: 'Manual gearbox', to: listingsQs({ transmission: 'manual' }), Icon: Settings2 },
    { label: 'Recent imports', to: listingsQs({ q: 'auction grade' }), Icon: Globe },
    { label: 'All-wheel drive', to: listingsQs({ q: 'AWD 4WD' }), Icon: Truck },
    { label: 'Silver colour', to: listingsQs({ q: 'silver' }), Icon: Car },
    { label: 'White colour', to: listingsQs({ q: 'white' }), Icon: CarFront },
    { label: 'Black colour', to: listingsQs({ q: 'black' }), Icon: Car },
    { label: 'Sunshine cars', to: listingsQs({ q: 'full fresh' }), Icon: Zap },
    { label: 'Finance OK', to: listingsQs({ q: 'bank finance' }), Icon: Banknote },
    { label: 'Browse all', to: listingsQs({}), Icon: Car },
  ],
];

const BUDGET_BANDS: CardDef[] = [
  { label: 'Under ৳5 Lac', to: listingsQs({ max_price: '500000' }), Icon: Banknote },
  { label: '৳5L – ৳10L', to: listingsQs({ min_price: '500000', max_price: '1000000' }), Icon: Banknote },
  { label: '৳10L – ৳15L', to: listingsQs({ min_price: '1000000', max_price: '1500000' }), Icon: Banknote },
  { label: '৳15L – ৳25L', to: listingsQs({ min_price: '1500000', max_price: '2500000' }), Icon: Banknote },
  { label: '৳25L – ৳40L', to: listingsQs({ min_price: '2500000', max_price: '4000000' }), Icon: Banknote },
  { label: '৳40L – ৳60L', to: listingsQs({ min_price: '4000000', max_price: '6000000' }), Icon: Banknote },
  { label: 'Above ৳60L', to: listingsQs({ min_price: '6000000' }), Icon: Crown },
  { label: 'Best value', to: listingsQs({ sort: 'price_asc' }), Icon: Gauge },
  { label: 'Premium segment', to: listingsQs({ min_price: '3500000', sort: 'price_desc' }), Icon: Crown },
  { label: 'Mid range', to: listingsQs({ min_price: '1500000', max_price: '3500000' }), Icon: Car },
  { label: 'Starter cars', to: listingsQs({ max_price: '800000' }), Icon: CarFront },
  { label: 'Any budget', to: listingsQs({}), Icon: Banknote },
];

const BODY_TYPES: CardDef[] = [
  { label: 'Hatchback', to: listingsQs({ q: 'hatchback' }), Icon: CarFront },
  { label: 'Sedan', to: listingsQs({ q: 'sedan' }), Icon: CarFront },
  { label: 'SUV', to: listingsQs({ q: 'SUV' }), Icon: Truck },
  { label: 'Crossover', to: listingsQs({ q: 'crossover' }), Icon: Truck },
  { label: 'MPV / Van', to: listingsQs({ q: 'MPV van Noah' }), Icon: Car },
  { label: 'Coupe', to: listingsQs({ q: 'coupe' }), Icon: Car },
  { label: 'Wagon', to: listingsQs({ q: 'wagon estate' }), Icon: Car },
  { label: 'Pickup', to: listingsQs({ q: 'pickup truck' }), Icon: Truck },
  { label: 'Microbus', to: listingsQs({ q: 'microbus Hiace' }), Icon: Car },
  { label: 'Convertible', to: listingsQs({ q: 'convertible' }), Icon: Car },
  { label: 'Off-road', to: listingsQs({ q: 'Prado Pajero off road' }), Icon: Truck },
  { label: 'Other body', to: listingsQs({ q: 'car sale' }), Icon: Car },
];

type TabKey = 'category' | 'city' | 'make' | 'model' | 'budget' | 'body';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'category', label: 'Category' },
  { key: 'city', label: 'City' },
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'budget', label: 'Budget' },
  { key: 'body', label: 'Body Type' },
];

const PER_VIEW = 12;

export function BrowseUsedCarsSection() {
  const [tab, setTab] = useState<TabKey>('category');
  const [page, setPage] = useState(0);
  const [brands, setBrands] = useState<BrandDto[]>([]);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [tab]);

  const cityPages = useMemo(() => {
    const cards: CardDef[] = BD_CITIES.map((city) => ({
      label: city,
      to: listingsQs({ city }),
      Icon: Building2,
    }));
    return chunk(cards, PER_VIEW);
  }, []);

  const makePages = useMemo(() => {
    const cards: CardDef[] = brands.map((b) => ({
      label: b.name,
      to: listingsQs({ brand_id: String(b.id) }),
      Icon: Car,
    }));
    return chunk(cards.length ? cards : [{ label: 'All brands', to: listingsQs({}), Icon: Car }], PER_VIEW);
  }, [brands]);

  const modelPages = useMemo(() => {
    const cards: CardDef[] = POPULAR_MODELS.map(({ label, q }) => ({
      label,
      to: listingsQs({ q }),
      Icon: CarFront,
    }));
    return chunk(cards, PER_VIEW);
  }, []);

  const budgetPages = useMemo(() => chunk(BUDGET_BANDS, PER_VIEW), []);
  const bodyPages = useMemo(() => chunk(BODY_TYPES, PER_VIEW), []);

  const pages: CardDef[][] = useMemo(() => {
    switch (tab) {
      case 'category':
        return CATEGORY_PAGES;
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
        return CATEGORY_PAGES;
    }
  }, [tab, cityPages, makePages, modelPages, budgetPages, bodyPages]);

  useEffect(() => {
    const maxIdx = Math.max(0, pages.length - 1);
    setPage((p) => Math.min(p, maxIdx));
  }, [pages.length, brands.length]);

  const pageCount = Math.max(1, pages.length);
  const safePage = Math.min(page, pageCount - 1);
  const canPrev = safePage > 0;
  const canNext = safePage < pageCount - 1;

  return (
    <section className="py-12 bg-[#f5f6f8] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Browse Used Cars</h2>

        <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-semibold transition-colors relative ${
                tab === key ? 'text-[#233D7B]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
              {tab === key ? (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#233D7B] rounded-full" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 ${
              canPrev ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 ${
              canNext ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          <div className="overflow-hidden px-12 sm:px-14">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {pages.map((slide, si) => (
                <div key={`${tab}-${si}`} className="min-w-full shrink-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                    {slide.map((c) => (
                      <BrowseTile key={`${c.label}-${si}`} {...c} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Page ${i + 1}`}
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
