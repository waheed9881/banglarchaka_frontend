import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { BrandDto } from '@/lib/marketplace';
import { formatMoney } from '@/lib/marketplace';
import { BD_CITIES as BD_CITIES_ALL, CITY_LABEL_KEYS } from '@/i18n/bdCities';
import { mergeListingParams } from './ListingResultsPak';
import { normalizePriceDigits } from './listingPakFilterValidate';

function splitCsv(s: string | null): string[] {
  if (!s?.trim()) return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

const BODY_I18N: Record<string, string> = {
  sedan: 'listingBrowse.chipSedan',
  hatchback: 'listingBrowse.chipHatchback',
  suv: 'listingBrowse.chipSuv',
  crossover: 'listingBrowse.chipCrossover',
  coupe: 'listingBrowse.chipCoupe',
  pickup: 'listingBrowse.chipPickup',
  van: 'listingBrowse.chipVan',
};

const PAINT_I18N: Record<string, string> = {
  white: 'listingBrowse.colWhite',
  black: 'listingBrowse.colBlack',
  silver: 'listingBrowse.colSilver',
  grey: 'listingBrowse.colGrey',
  blue: 'listingBrowse.colBlue',
  red: 'listingBrowse.colRed',
  green: 'listingBrowse.colGreen',
};

type ChipRow = {
  id: string;
  label: string;
  updates: Record<string, string | null | undefined>;
};

type Props = {
  locationSearch: string;
  listingType: string;
  brands: BrandDto[];
  setSearchParams: (next: URLSearchParams, opts?: { replace?: boolean }) => void;
};

export function PakActiveFilterChips({ locationSearch, listingType, brands, setSearchParams }: Props) {
  const { t } = useTranslation();

  const chips = useMemo((): ChipRow[] => {
    if (listingType !== 'used_car' && listingType !== 'used_bike') return [];
    const sp = new URLSearchParams(locationSearch);
    const out: ChipRow[] = [];

    const push = (row: ChipRow) => out.push(row);

    const city = sp.get('city');
    if (city) {
      const slug = city.toLowerCase();
      const label = (BD_CITIES_ALL as readonly string[]).includes(slug)
        ? t(CITY_LABEL_KEYS[slug as keyof typeof CITY_LABEL_KEYS])
        : city;
      push({ id: 'city', label, updates: { city: null } });
    }

    const qRaw = sp.get('q')?.trim();
    if (qRaw) push({ id: 'q', label: qRaw, updates: { q: null } });

    const variantRaw = sp.get('variant_hints')?.trim();
    if (variantRaw) {
      const short = variantRaw.length > 36 ? `${variantRaw.slice(0, 34)}…` : variantRaw;
      push({ id: 'variant_hints', label: `${t('listingBrowse.variantKeyword')}: ${short}`, updates: { variant_hints: null } });
    }

    const brandIds = splitCsv(sp.get('brand_ids'));
    if (brandIds.length) {
      const names = brandIds
        .map((id) => brands.find((b) => String(b.id) === id)?.name)
        .filter(Boolean) as string[];
      const label =
        names.length === brandIds.length && names.length > 0
          ? names.join(', ')
          : t('listingBrowse.chipBrandsCount', { count: brandIds.length });
      push({ id: 'brand_ids', label, updates: { brand_ids: null, brand_id: null } });
    }

    const modelIds = splitCsv(sp.get('vehicle_model_ids'));
    if (modelIds.length) {
      push({
        id: 'vehicle_model_ids',
        label: t('listingBrowse.chipModelsCount', { count: modelIds.length }),
        updates: { vehicle_model_ids: null },
      });
    }

    const minP = sp.get('min_price');
    const maxP = sp.get('max_price');
    if (minP || maxP) {
      const fmt = (raw: string) => {
        const d = normalizePriceDigits(raw);
        const num = Number(d || raw);
        return Number.isFinite(num) ? formatMoney(num) : raw;
      };
      const a = minP ? fmt(minP) : '…';
      const b = maxP ? fmt(maxP) : '…';
      push({ id: 'price', label: `${a} – ${b}`, updates: { min_price: null, max_price: null } });
    }

    const minY = sp.get('min_year');
    const maxY = sp.get('max_year');
    if (minY || maxY) {
      push({ id: 'year', label: `${minY || '…'} – ${maxY || '…'}`, updates: { min_year: null, max_year: null } });
    }

    const minM = sp.get('min_mileage');
    const maxM = sp.get('max_mileage');
    if (minM || maxM) {
      push({
        id: 'mileage',
        label: `${minM || '…'}–${maxM || '…'} ${t('listingBrowse.chipMileageSuffix')}`,
        updates: { min_mileage: null, max_mileage: null },
      });
    }

    const minE = sp.get('min_engine_cc');
    const maxE = sp.get('max_engine_cc');
    if (minE || maxE) {
      push({
        id: 'engine',
        label: `${minE || '…'}–${maxE || '…'} cc`,
        updates: { min_engine_cc: null, max_engine_cc: null },
      });
    }

    const fuelsAll = [...new Set(splitCsv(sp.get('fuel_types')).concat(splitCsv(sp.get('fuel_type'))))].filter(
      Boolean,
    );
    const fuels = [...new Set(fuelsAll.map((x) => x.toLowerCase()))];
    if (fuels.length) {
      push({
        id: 'fuel',
        label: fuels
          .map((f) => (f === 'cng' ? 'CNG' : t(`hero.${f}` as 'hero.petrol')))
          .join(', '),
        updates: { fuel_types: null, fuel_type: null },
      });
    }

    const transAll = [...new Set(splitCsv(sp.get('transmissions')).concat(splitCsv(sp.get('transmission'))))].filter(
      Boolean,
    );
    const trans = [...new Set(transAll.map((x) => x.toLowerCase()))];
    if (trans.length && listingType !== 'used_bike') {
      push({
        id: 'trans',
        label: trans.map((x) => (x === 'automatic' ? t('hero.automatic') : t('hero.manual'))).join(', '),
        updates: { transmissions: null, transmission: null },
      });
    }

    const bodies = splitCsv(sp.get('body_hints'));
    if (bodies.length) {
      push({
        id: 'body_hints',
        label: bodies
          .map((b) => {
            const lk = BODY_I18N[b.toLowerCase()];
            return lk ? t(lk) : b;
          })
          .join(', '),
        updates: { body_hints: null },
      });
    }

    const paints = splitCsv(sp.get('paint_hints'));
    if (paints.length) {
      push({
        id: 'paint_hints',
        label: paints.map((p) => t(PAINT_I18N[p] ?? 'listingBrowse.colourMulti')).join(', '),
        updates: { paint_hints: null },
      });
    }

    const cond = sp.get('condition');
    if (cond) {
      const lab =
        cond === 'used'
          ? t('hero.used')
          : cond === 'reconditioned'
            ? t('hero.reconditioned')
            : cond === 'new'
              ? t('hero.new')
              : cond;
      push({ id: 'condition', label: lab, updates: { condition: null } });
    }

    const featSlugs = splitCsv(sp.get('feature_slugs'));
    featSlugs.forEach((slug) => {
      const rest = featSlugs.filter((x) => x !== slug);
      push({
        id: `feature_${slug}`,
        label: t(`listingBrowse.feature_${slug}` as 'listingBrowse.feature_abs'),
        updates: { feature_slugs: rest.length ? rest.join(',') : null },
      });
    });

    const assemblySlugs = splitCsv(sp.get('assembly'));
    assemblySlugs.forEach((slug) => {
      const rest = assemblySlugs.filter((x) => x !== slug);
      push({
        id: `assembly_${slug}`,
        label: t(`listingBrowse.assembly_${slug}` as 'listingBrowse.assembly_imported'),
        updates: { assembly: rest.length ? rest.join(',') : null },
      });
    });

    const regSlugs = splitCsv(sp.get('registration'));
    regSlugs.forEach((slug) => {
      const rest = regSlugs.filter((x) => x !== slug);
      push({
        id: `reg_${slug}`,
        label: t(`listingBrowse.region_${slug}` as 'listingBrowse.region_dhaka'),
        updates: { registration: rest.length ? rest.join(',') : null },
      });
    });

    if (sp.get('featured') === '1') {
      push({ id: 'featured', label: t('listingBrowse.featuredAdsOnly'), updates: { featured: null } });
    }
    if (sp.get('urgent') === '1') {
      push({ id: 'urgent', label: t('listingBrowse.urgentAdsOnly'), updates: { urgent: null } });
    }
    if (sp.get('verified_dealer_only') === '1') {
      push({
        id: 'verified_dealer_only',
        label: t('listingBrowse.verifiedDealersOnly'),
        updates: { verified_dealer_only: null },
      });
    }
    if (sp.get('dealer_only') === '1') {
      push({ id: 'dealer_only', label: t('listingBrowse.dealerListingsOnly'), updates: { dealer_only: null } });
    }
    if (sp.get('individual_only') === '1') {
      push({
        id: 'individual_only',
        label: t('listingBrowse.individualSellerOnly'),
        updates: { individual_only: null },
      });
    }

    return out;
  }, [brands, listingType, locationSearch, t]);

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setSearchParams(mergeListingParams(locationSearch, c.updates), { replace: true })}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-300 bg-gray-50 py-1 pl-2.5 pr-2 text-xs font-semibold text-gray-800 hover:border-gray-400"
        >
          <span className="min-w-0 truncate">{c.label}</span>
          <X className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        </button>
      ))}
    </div>
  );
}
