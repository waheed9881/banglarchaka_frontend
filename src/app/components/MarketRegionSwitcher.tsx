import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MARKET_PRESETS } from '@/lib/marketPrefs';
import { useMarketPrefs } from '@/app/context/MarketPrefsContext';

type SwitcherTone = 'onDark' | 'onLight';

export function MarketRegionSwitcher({ tone = 'onDark' }: { tone?: SwitcherTone }) {
  const { t } = useTranslation();
  const { preset, setPreset } = useMarketPrefs();
  const light = tone === 'onLight';

  return (
    <div className="flex items-center gap-1 shrink-0 min-w-0" role="group" aria-label={t('market.switcherAria')}>
      <Globe
        className={`w-3.5 h-3.5 shrink-0 hidden sm:block ${light ? 'text-slate-500' : 'text-white/70'}`}
        aria-hidden
      />
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
        className={
          light
            ? 'max-w-[10.5rem] sm:max-w-[13rem] truncate rounded border border-slate-300 bg-white text-slate-800 text-[11px] sm:text-xs font-medium px-1.5 py-1 outline-none focus:ring-2 focus:ring-lux-navy/25 cursor-pointer'
            : 'max-w-[10.5rem] sm:max-w-[13rem] truncate rounded border border-white/20 bg-white/10 text-white text-[11px] sm:text-xs font-medium px-1.5 py-1 outline-none focus:ring-1 focus:ring-white/40 cursor-pointer'
        }
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
