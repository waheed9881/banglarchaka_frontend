import type { TFunction } from 'i18next';

export const KEYWORD_MAX_LEN = 160;

const YEAR_MIN_ABS = 1950;
/** Max nominal BDT (15 digits caps sensible search range). */
const MAX_PRICE_BIGINT = 999_999_999_999_999n;

const MAX_MILEAGE_DIGITS = 8;
const MAX_MILEAGE_ABS = 9_999_999;
const ENGINE_CC_MIN_ABS = 39;
const ENGINE_CC_MAX_ABS = 8000;

export type PakFilterFieldErrors = Partial<
  Record<
    | 'keyword'
    | 'minPrice'
    | 'maxPrice'
    | 'minYear'
    | 'maxYear'
    | 'minMileage'
    | 'maxMileage'
    | 'minEngineCc'
    | 'maxEngineCc',
    string
  >
>;

export type PakFilterValidSnapshot = {
  keywordTrimmed: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  minMileage: string;
  maxMileage: string;
  minEngineCc: string;
  maxEngineCc: string;
};

export type PakListingFilterValidateResult =
  | { ok: true; normalized: PakFilterValidSnapshot }
  | { ok: false; errors: PakFilterFieldErrors };

/** Normalize numeric filter input: commas/spaces stripped, digits only */
export function normalizePriceDigits(raw: string): string {
  return raw.replace(/[\s,]/g, '').replace(/\D/g, '');
}

/** Readable breakdown under price inputs (lac / hazar / crore), for filter UX. */
export function pakPriceDigitsToHuman(normalizedDigits: string, t: TFunction): string | null {
  const bi = parsePriceBigint(normalizedDigits);
  if (!bi || bi <= 0n || bi > MAX_PRICE_BIGINT) return null;

  let r = bi;
  const crore = r / 10_000_000n;
  r %= 10_000_000n;
  const lac = r / 100_000n;
  r %= 100_000n;
  const hazar = r / 1000n;
  const rest = r % 1000n;

  const uC = t('listingBrowse.priceUnitCrore');
  const uL = t('listingBrowse.priceUnitLac');
  const uH = t('listingBrowse.priceUnitHazar');

  const parts: string[] = [];
  if (crore > 0n) parts.push(`${crore.toString()} ${uC}`);
  if (lac > 0n) parts.push(`${lac.toString()} ${uL}`);
  if (hazar > 0n) parts.push(`${hazar.toString()} ${uH}`);
  if (rest > 0n) parts.push(rest.toString());

  return parts.length ? parts.join(' ') : null;
}

function parseYearDigits(raw: string): number | null {
  const s = raw.trim();
  if (!/^\d{4}$/.test(s)) return null;
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
}

function parsePriceBigint(digits: string): bigint | null {
  try {
    if (!/^\d+$/.test(digits)) return null;
    return BigInt(digits);
  } catch {
    return null;
  }
}

function parseMileageInt(digits: string): number | null {
  if (!/^\d+$/.test(digits) || digits.length > MAX_MILEAGE_DIGITS) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n <= MAX_MILEAGE_ABS ? n : null;
}

function parseEngineCcDigits(digits: string): number | null {
  if (!/^\d{2,5}$/.test(digits)) return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < ENGINE_CC_MIN_ABS || n > ENGINE_CC_MAX_ABS) return null;
  return n;
}

/** Validate sidebar keyword, price/year/mileage bands before syncing URL */
export function validatePakListingSidebarInput(
  v: {
    keyword: string;
    minPrice: string;
    maxPrice: string;
    minYear: string;
    maxYear: string;
    minMileage: string;
    maxMileage: string;
    minEngineCc?: string;
    maxEngineCc?: string;
  },
  t: TFunction,
): PakListingFilterValidateResult {
  const errors: PakFilterFieldErrors = {};
  const keywordTrimmed = v.keyword.trim();
  if (keywordTrimmed.length > KEYWORD_MAX_LEN) {
    errors.keyword = t('listingBrowse.filterErrKeywordTooLong', { max: KEYWORD_MAX_LEN });
  }

  const minP = normalizePriceDigits(v.minPrice);
  const maxP = normalizePriceDigits(v.maxPrice);
  const minRaw = v.minPrice.trim();
  const maxRaw = v.maxPrice.trim();

  const checkPriceDigits = (
    digits: string,
    rawFilled: boolean,
    key: 'minPrice' | 'maxPrice',
  ) => {
    if (!rawFilled) return;
    if (!digits) {
      errors[key] = t('listingBrowse.filterErrPriceInvalid');
      return;
    }
    const n = parsePriceBigint(digits);
    if (n == null) {
      errors[key] = t('listingBrowse.filterErrPriceInvalid');
      return;
    }
    if (n > MAX_PRICE_BIGINT) {
      errors[key] = t('listingBrowse.filterErrPriceTooLarge');
    }
  };

  checkPriceDigits(minP, Boolean(minRaw), 'minPrice');
  checkPriceDigits(maxP, Boolean(maxRaw), 'maxPrice');

  if (!errors.minPrice && !errors.maxPrice && minP && maxP) {
    const a = parsePriceBigint(minP);
    const b = parsePriceBigint(maxP);
    if (a != null && b != null && a > b) {
      const msg = t('listingBrowse.filterErrPriceRange');
      errors.minPrice = msg;
      errors.maxPrice = msg;
    }
  }

  const yearMaxAllowed = new Date().getFullYear() + 1;
  let minYn: number | null = null;
  let maxYn: number | null = null;
  const minYs = v.minYear.trim();
  const maxYs = v.maxYear.trim();

  if (minYs) {
    minYn = parseYearDigits(minYs);
    if (minYn == null) errors.minYear = t('listingBrowse.filterErrYearInvalid');
    else if (minYn < YEAR_MIN_ABS || minYn > yearMaxAllowed) {
      errors.minYear = t('listingBrowse.filterErrYearRange', { min: YEAR_MIN_ABS, max: yearMaxAllowed });
    }
  }
  if (maxYs) {
    maxYn = parseYearDigits(maxYs);
    if (maxYn == null) errors.maxYear = t('listingBrowse.filterErrYearInvalid');
    else if (maxYn < YEAR_MIN_ABS || maxYn > yearMaxAllowed) {
      errors.maxYear = t('listingBrowse.filterErrYearRange', { min: YEAR_MIN_ABS, max: yearMaxAllowed });
    }
  }
  if (!errors.minYear && !errors.maxYear && minYn != null && maxYn != null && minYn > maxYn) {
    const msg = t('listingBrowse.filterErrYearOrder');
    errors.minYear = msg;
    errors.maxYear = msg;
  }

  const mm = normalizePriceDigits(v.minMileage);
  const xm = normalizePriceDigits(v.maxMileage);
  const mmRaw = v.minMileage.trim();
  const xmRaw = v.maxMileage.trim();

  const checkMil = (
    digits: string,
    rawFilled: boolean,
    key: 'minMileage' | 'maxMileage',
  ) => {
    if (!rawFilled) return;
    if (!digits || parseMileageInt(digits) == null) {
      errors[key] = t('listingBrowse.filterErrMileageInvalid');
    }
  };
  checkMil(mm, Boolean(mmRaw), 'minMileage');
  checkMil(xm, Boolean(xmRaw), 'maxMileage');
  let minM = mmRaw ? parseMileageInt(mm) : null;
  let maxM = xmRaw ? parseMileageInt(xm) : null;
  if (
    minM !== null &&
    maxM !== null &&
    minM <= MAX_MILEAGE_ABS &&
    maxM <= MAX_MILEAGE_ABS &&
    minM > maxM &&
    !errors.minMileage &&
    !errors.maxMileage
  ) {
    const msg = t('listingBrowse.filterErrMileageRange');
    errors.minMileage = msg;
    errors.maxMileage = msg;
  }

  const minEcRaw = (v.minEngineCc ?? '').trim();
  const maxEcRaw = (v.maxEngineCc ?? '').trim();
  const minEcDig = normalizePriceDigits(minEcRaw);
  const maxEcDig = normalizePriceDigits(maxEcRaw);

  const checkEc = (
    digits: string,
    rawFilled: boolean,
    key: 'minEngineCc' | 'maxEngineCc',
  ) => {
    if (!rawFilled) return;
    if (!digits || parseEngineCcDigits(digits) == null) {
      errors[key] = t('listingBrowse.filterErrEngineCcInvalid', {
        min: ENGINE_CC_MIN_ABS,
        max: ENGINE_CC_MAX_ABS,
      });
    }
  };
  checkEc(minEcDig, Boolean(minEcRaw), 'minEngineCc');
  checkEc(maxEcDig, Boolean(maxEcRaw), 'maxEngineCc');

  let minE = minEcRaw ? parseEngineCcDigits(minEcDig) : null;
  let maxE = maxEcRaw ? parseEngineCcDigits(maxEcDig) : null;
  if (
    minE !== null &&
    maxE !== null &&
    minE > maxE &&
    !errors.minEngineCc &&
    !errors.maxEngineCc
  ) {
    const msg = t('listingBrowse.filterErrEngineCcRange');
    errors.minEngineCc = msg;
    errors.maxEngineCc = msg;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    normalized: {
      keywordTrimmed,
      minPrice: minP,
      maxPrice: maxP,
      minYear: minYs,
      maxYear: maxYs,
      minMileage: mm,
      maxMileage: xm,
      minEngineCc: minEcDig,
      maxEngineCc: maxEcDig,
    },
  };
}
