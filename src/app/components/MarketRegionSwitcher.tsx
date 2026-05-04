import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MARKET_PRESETS } from '@/lib/marketPrefs';
import { useMarketPrefs } from '@/app/context/MarketPrefsContext';

export function MarketRegionSwitcher() {
  const { t } = useTranslation();
  const { preset, setPreset } = useMarketPrefs();

  return (
    <div className="flex items-center gap-1 shrink-0 min-w-0" role="group" aria-label={t('market.switcherAria')}>
      <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0 hidden sm:block" aria-hidden />
      <label className="sr-only" htmlFor="market-region-select">
        {t('market.switcherAria')}
      </label>
      <select
        id="market-region-select"
        value={`${preset.countryCode}|${preset.currency}`}
        onChange={(e) => {
          const [countryCode, currency] = e.target.value.split('|');
          const hit = MARKET_PRESETS.find((p) => p.countryCode === countryCode && p.currency === currency);
          if (hit) void setPreset(hit);
        }}
        className="max-w-[10.5rem] sm:max-w-[13rem] truncate rounded border border-neutral-300 bg-white text-neutral-800 text-[11px] sm:text-xs font-medium px-1.5 py-1 outline-none focus:ring-2 focus:ring-brand-red/25 focus:border-brand-red/50 cursor-pointer shadow-sm"
      >
        {MARKET_PRESETS.map((p) => (
          <option
            key={`${p.countryCode}-${p.currency}`}
            value={`${p.countryCode}|${p.currency}`}
            className="text-gray-900"
          >
            {t(`market.presets.${p.labelKey}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
