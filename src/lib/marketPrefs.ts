/**
 * Region + currency presets (keep in sync with backend `config/markets.php`).
 */
export type MarketPreset = {
  countryCode: string;
  currency: string;
  localeTag: string;
  /** i18n key under `market.presets.*` */
  labelKey: string;
};

export const MARKET_PRESETS: readonly MarketPreset[] = [
  { countryCode: 'BD', currency: 'BDT', localeTag: 'en-BD', labelKey: 'bdBdt' },
  { countryCode: 'PK', currency: 'PKR', localeTag: 'en-PK', labelKey: 'pkPkr' },
  { countryCode: 'IN', currency: 'INR', localeTag: 'en-IN', labelKey: 'inInr' },
  { countryCode: 'AE', currency: 'AED', localeTag: 'en-AE', labelKey: 'aeAed' },
  { countryCode: 'SA', currency: 'SAR', localeTag: 'en-SA', labelKey: 'saSar' },
  { countryCode: 'GB', currency: 'GBP', localeTag: 'en-GB', labelKey: 'gbGbp' },
  { countryCode: 'US', currency: 'USD', localeTag: 'en-US', labelKey: 'usUsd' },
  { countryCode: 'CA', currency: 'CAD', localeTag: 'en-CA', labelKey: 'caCad' },
  { countryCode: 'AU', currency: 'AUD', localeTag: 'en-AU', labelKey: 'auAud' },
  { countryCode: 'DE', currency: 'EUR', localeTag: 'de-DE', labelKey: 'deEur' },
] as const;

const STORAGE_KEY = 'banglarchaka_market_v1';

export const DEFAULT_MARKET_PRESET = MARKET_PRESETS[0];

export function findPreset(countryCode: string, currency: string): MarketPreset | undefined {
  return MARKET_PRESETS.find((p) => p.countryCode === countryCode && p.currency === currency);
}

export function readStoredMarketPrefs(): MarketPreset {
  if (typeof window === 'undefined') return DEFAULT_MARKET_PRESET;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MARKET_PRESET;
    const o = JSON.parse(raw) as { countryCode?: string; currency?: string };
    const hit = o.countryCode && o.currency ? findPreset(o.countryCode, o.currency) : undefined;
    if (hit) return hit;
  } catch {
    /* ignore */
  }
  return DEFAULT_MARKET_PRESET;
}

export function writeStoredMarketPrefs(p: MarketPreset): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ countryCode: p.countryCode, currency: p.currency, localeTag: p.localeTag }),
  );
}
